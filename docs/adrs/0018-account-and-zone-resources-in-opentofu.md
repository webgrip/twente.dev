# ADR 0018 – Account and zone resources live in code, application resources in wrangler

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-05
- **Tags**: Infrastructure::DNS, Infrastructure::IaC, Security, Operations
- **Version**: 1.2.0

---

## Context and Problem Statement

Everything application-shaped on Cloudflare is already code. The Worker, its routes and its
asset handling live in [`wrangler.toml`](../../wrangler.toml) and deploy from Forgejo through the
shared `cloudflare-deploy.yml` lane ([ADR 0002](0002-cloudflare-workers-static-assets.md),
[ADR 0003](0003-forgejo-as-ci-and-release-authority.md)); Counterscale's Worker, R2 binding and
cron live the same way in its own repository ([ADR 0013](0013-counterscale-for-campaign-attribution.md));
edge headers and redirects are compiled into nginx and parity-tested on every push.

Everything account-shaped is dashboard state. The DNS records of `twente.dev` and `webgrip.nl`,
the `www -> apex` redirect rule on webgrip.nl, zone settings, DNSSEC and the R2 bucket the
Counterscale Worker binds were all created by hand. None of it is reviewable, diffable or
rebuildable. The mail runbook says the DNS half of its work is not available to an agent, the
Counterscale README asks a human to create the bucket before the first deploy, and the runbook's
open items (DNSSEC, the MTA-STS records, CAA) are dashboard sessions because nothing else can
express them. The Email Routing rules that kept `hello@` reachable lived only in the dashboard
until the move to Google on 2026-09-04 made them history.

The question that prompted this record had two halves that are easy to conflate. Clickops is
state that cannot be reviewed or rebuilt; infrastructure as code fixes it. Lock-in is state that
cannot move to another vendor; infrastructure as code does nothing for it, because the resource
schemas are Cloudflare's. What protects this estate against lock-in is already in place: `dist/`
is a plain directory, `_headers` and `_redirects` are portable formats proven against nginx on
every push, R2 speaks S3, and the registrar is elsewhere. The one deep dependency is Analytics
Engine, and Counterscale's nightly R2 rollup is its export path. This record settles the clickops
half.

## Decision Drivers

| #   | Driver                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------- |
| 1   | Every zone change is a reviewable diff with a plan, and drift from the declared state is detected nightly |
| 2   | One writer per record: no tool ever fights external-dns, wrangler or Cloudflare itself over the same name |
| 3   | No laptop-held credential for routine changes; the estate's OpenBao and Forgejo secret chain is reused    |
| 4   | Authority over public DNS must not depend on the homelab cluster being up                                 |
| 5   | Free tier, and nothing new to operate                                                                     |
| 6   | Registration for twente.dev/001 opens on 14 September; no DNS answer changes around that date             |

## Considered Options

1. **OpenTofu, applied from Forgejo Actions, state in R2 with OpenTofu's native encryption**
2. **Terraform**, same provider, BUSL licence
3. **Pulumi** with its Cloudflare provider
4. **Alchemy**, TypeScript-native infrastructure as code
5. **Crossplane** `provider-cloudflare`
6. **Flux `tofu-controller`** in the homelab cluster
7. **Atlantis** on Forgejo
8. **external-dns `DNSEndpoint` objects** for every record
9. **Keep the dashboard**
10. **DNSControl or octoDNS** for the records, a general IaC tool only for what they cannot
    express

## Decision Outcome

### Chosen Option

**One repository, `webgrip/cloudflare`, applied from Forgejo Actions, with two tools behind one
boundary: account and zone resources live there; application resources stay in wrangler.**
DNS records and redirect rules are DNSControl (`dns/dnsconfig.js`, one line per record, no state:
it diffs the file against the live zone). Everything DNSControl cannot express is OpenTofu:
the R2 bucket now, DNSSEC toggles, zone settings and Zero Trust Access as they arrive. Since version 1.2.0 each site repository declares its own zone
(`ops/dns/dnsconfig.js` here, later in webgrip.nl) through the shared `dnscontrol.yml` lane in
`webgrip/workflows`: preview on every push and pull request, push on `main` behind `DNS_PUSH`, a
nightly drift check. `webgrip/cloudflare` keeps the zone-spanning account objects and the redirect
rules, and stops declaring a zone the moment the site repository's push is green. The
repository never owns a Worker, a route, a binding or a `custom_domain`; those remain in each
site's `wrangler.toml`, where `wrangler deploy` asserts them on every deploy. Two writers on one
object would fight forever, so the split follows who already writes.

The same rule keeps this repository away from records other writers own: external-dns in
homelab-cluster owns `www.webgrip.nl` and everything it publishes on `webgrip.dev`; the
`webgrip.nl` apex record is a legacy hand-made record it deliberately refuses to adopt and stays
listed as unmanaged; `counterscale.webgrip.dev` is wrangler's `custom_domain`. DNSControl's `IGNORE()`
exists for exactly this sharing: the ignored names are neither modified nor deleted, and a config
that both ignores and declares a name is rejected. The one trap is declaring a
name someone else declares, which produces a duplicate record, and duplicates of MX, SPF or DMARC
break mail.

State lives in an R2 bucket through the `s3` backend, encrypted by OpenTofu itself with a
passphrase that is one of five values seeded once into OpenBao and published as repository
secrets on `webgrip/cloudflare` by the existing `forgejo-actions-secrets` CronJob, which also
verifies the token hourly. Repository scope rather than the org-wide scope the wrangler token
has, because a token with DNS Write should not be readable by every workflow in the org. The
token `forgejo-ci-tofu` carries Zone Read and DNS Write on the two zones, the redirect-rules
permission on webgrip.nl and Workers R2 Storage Write, and nothing else.

Three guards make the apply safe to run on every push to `main`: a plan that destroys anything
is refused unless the commit body carries `Tofu-Allow-Destroy: <address>` per destroyed address;
a plan against an empty state is refused, because a vanished state object would otherwise plan a
create for every record and duplicate the mail set; imports are refused in CI and run from a
laptop, where a human reads the plan JSON and confirms it contains nothing but imports. Mail
records and the proxied placeholders carry `prevent_destroy`. A nightly plan on `main` fails on
any diff.

The first iteration imports all of `twente.dev`, the mail and verification records of
`webgrip.nl`, the `www -> apex` ruleset and the Counterscale bucket, with a plan that must read
zero adds, zero changes and zero destroys before anything is applied. Zone settings, DNSSEC, the
MTA-STS and TLS-RPT records, CAA and the `webgrip.dev` zone follow after 16 September.

### Rejected options and why

- **Terraform.** Same provider, same resources, a BUSL licence and no native state encryption;
  the estate's tooling is pinned through mise either way, and `opentofu` is a registry name there.
- **Pulumi.** Actively maintained, but its Cloudflare provider is bridged from the same Terraform
  provider, so it adds a language runtime and a second state model for an identical schema.
- **Alchemy.** Cloudflare-first and pleasant to read, and in beta on its second major line with
  two parallel packages. Zone authority is not the place to park a pre-1.0 dependency.
- **Crossplane.** `provider-cloudflare` was archived on 2026-03-06; its upjet successor has ten
  stars and no release. It would also make the homelab cluster the authority for public DNS,
  against driver 4.
- **Flux `tofu-controller`.** Alive at 0.16.5, and it puts a Kubernetes control plane in the
  apply path of a public zone. Forgejo Actions already exists and needs nothing running.
- **Atlantis.** Supports Gitea-style webhooks, and its whole value is the pull-request comment
  loop. This estate is trunk-based on `main` with no pull requests.
- **external-dns for everything.** It already owns what it owns, and it cannot express zone
  settings, DNSSEC, rulesets or R2 buckets.
- **DNSControl or octoDNS alone.** Chosen for the records, where their stateless diff and their
  coexistence primitives beat a general tool; rejected as the only tool, because R2 buckets,
  zone settings and Access policies are outside their model. octoDNS lost to DNSControl on
  coexistence: its Cloudflare filters lean on record tags, a paid feature, where DNSControl's
  `IGNORE()` needs nothing.
- **Keep the dashboard.** The status quo, whose cost is the runbook line "not available to an
  agent" and three zones nobody can rebuild.

### Consequences

- Good, because every change to a zone becomes a diff with a plan attached, and a dashboard edit
  shows up the next morning instead of never.
- Good, because the runbook's open items stop being dashboard sessions: DNSSEC, the MTA-STS
  records and CAA become commits with a plan.
- Good, because the Counterscale bucket that nothing verified is declared and drift-checked.
- Bad, because there is now a state to protect: the passphrase and the R2 key are two more
  values whose loss means re-importing from the HCL, which the bootstrap document keeps
  re-runnable for that reason.
- Bad, because the token is strictly larger than the wrangler token: it can change MX or unproxy
  the apex. Repository-scoped publication, hourly verification and the destroy gate bound it;
  an IP condition is not available while the runner's egress is a home connection.
- Bad, because the MTA-STS policy now spans two repositories: the policy file lives here, the
  `_mta-sts` TXT with its `id` lives in `webgrip/cloudflare`, and a policy change needs both.
- Neutral, because the mail-auth validator in this repository keeps its job. It answers a
  different question from `tofu plan`: what the world sees through a public resolver, including
  Google's DKIM key and the DS at the registrar that Cloudflare never knows about.

## Confirmation

- `grep -rn "cloudflare_dns_record\|cloudflare_zone"` over this repository, `webgrip.nl` and
  `counterscale` returns nothing; the HCL lives in `webgrip/cloudflare` only.
- In `webgrip/cloudflare`, `grep -lE "cloudflare_workers|custom_domain" *.tf` returns nothing.
- `tofu state list` in `webgrip/cloudflare` names no `www.webgrip.nl`, no `k8s.` record and no
  `webgrip.dev` record.
- The last run of `[Scheduled] Cloudflare Drift` in `webgrip/cloudflare` is green.
- The `forgejo-actions-secrets` job log in homelab-cluster carries `CLOUDFLARE_TOFU_TOKEN valid`.
- `pnpm exec wrangler deploy --dry-run` in this repository still lists both routes; the boundary
  has not moved.

## More Information

- 2026-09-04: the question was asked as "is there a way to make this GitOps, and am I locking
  into a vendor". The two halves were separated as described above; the lock-in answer is the
  parity work already in place, the clickops answer is this record.
- 2026-09-04: the live zones were enumerated. Email Routing was found switched off (MX at Google
  since that day), external-dns was found to own `www.webgrip.nl` and eight names on
  `webgrip.dev`, and `mail.webgrip.nl` was found to be an empty non-terminal with at least one
  DKIM selector beneath it that only the API can name.
- 2026-09-05: decision recorded. Phase A (secret chain, skeleton, zero-diff import, nightly
  drift) lands before 14 September and changes no DNS answer; phases B and C wait until
  16 September. Tracking: [VIK-843](https://vikunja.webgrip.dev/tasks/843).
- 2026-09-05, version 1.1.0: the same day, after the OpenTofu import had landed with a zero-diff
  plan, the record layer moved to DNSControl. The trigger was the shape of the result: sixteen
  HCL files in the root and twelve lines per record for what is data, plus a state bucket, a
  passphrase and a lockfile that existed only to make a general tool safe for DNS. The first
  research pass had compared IaC frameworks and skipped the DNS-specific tools; that gap is
  recorded here so it is not repeated. OpenTofu keeps the account objects. The boundary, the
  repository, the token and the secret chain did not move.
- 2026-09-05, version 1.2.0: the zone records moved once more, from the shared repository to the
  site repository that owns the hostname. The trigger was the release train (ADR 0019): a staging
  record, mail records and CAA belong with the code and the checks that depend on them, and the
  mail-auth drift check in this repository already watched them from the outside. DNSControl made
  the move cheap (no state), and a reusable lane made it a two-file addition per site. The account
  objects did not move: Zero Trust, R2 and the token roller span sites.
- The repository: [`webgrip/cloudflare`](https://forgejo.webgrip.dev/webgrip/cloudflare), with
  the ownership table in its README and the procedure in `docs/bootstrap.md`.
- Refines [ADR 0002](0002-cloudflare-workers-static-assets.md) and
  [ADR 0003](0003-forgejo-as-ci-and-release-authority.md), which stay Accepted; the Worker and
  the release authority do not move. [ADR 0011](0011-brevo-for-machine-sent-mail.md) and
  [ADR 0013](0013-counterscale-for-campaign-attribution.md) gain the records and the bucket they
  depend on as declared resources. webgrip.nl adopts this decision by citation.
- The estate rule on comments is
  [workflows ADR 0006](https://forgejo.webgrip.dev/webgrip/workflows/src/branch/main/docs/adrs/0006-no-comments-in-code.md);
  HCL carries intent in resource names, and rationale stays in that repository's README and here.
