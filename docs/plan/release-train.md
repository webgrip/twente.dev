# Release train — development cuts rc to staging, main cuts stable to production

_Started 2026-09-05. Decision record: [ADR 0019](../adrs/0019-release-driven-deploys.md)._

## Why

Until 2026-09-05 every push to `main` deployed to production, and a second path, the nightly
rebuild, redeployed `main` HEAD without the quality gates. With several sessions pushing every few
minutes, the cancel-in-progress group killed every run before its deploy: production sat on
`78c7c7f` (2026-09-04 22:03) for 33 commits. Queueing main runs fixed the starvation; this plan
fixes the model. A deploy is the consequence of a release, not of a push.

## Target state

| Concern                  | Before                                        | After                                                                                    |
| ------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Daily work lands         | `main`                                        | `development`                                                                            |
| Production deploy        | every green push to `main`, plus nightly HEAD | a stable release `vX.Y.Z`, cut on `main` by semantic-release; nightly redeploys that tag |
| Staging                  | none (branch previews on workers.dev)         | `staging.twente.dev`, behind Cloudflare Access (Authentik), deployed by every `-rc.N`    |
| Promotion                | none                                          | PR `development → main`, opened when an rc is published, merged as a fast-forward        |
| Who pushes `main`        | anyone with write                             | `webgrip-ci` (tags en releases) and `ryangr0` (hotfix escape hatch)                      |
| Who pushes `development` | n/a                                           | `webgrip-ci`, `ryangr0`; agent sessions included, they run as the owner                  |
| Renovate base            | `main`                                        | `development`                                                                            |
| Releasable types         | n/a                                           | `feat`, `fix`, `perf`, `refactor`, `revert`, plus `content` as a patch                   |

## Per repository

### webgrip/workflows — done 2026-09-05

`cloudflare-deploy.yml` gained `release-channel` (stable / prerelease, decided from the tag on a
`release` event), `wrangler-env`, `edge-probe-expect` and `check-redirects`. Commit `9033cec`,
released as the next minor.

### webgrip/cloudflare

- `staging.twente.dev` proxied A record, carried by DNSControl in `dns/dnsconfig.js` (ADR 0018
  v1.1.0). Pushed 2026-09-05 13:30 after the install-tools fix `05e5b2d` and `DNS_PUSH=on`; the
  rc.2 worker answers 200 on `/nl` and `/en` and 404 on a missing page, and the search page ships
  the Pagefind Component UI.
- Access resources on branch `feat/staging-access` (`b4311de`, rebased on the DNSControl main): open the PR once the token and the
  two repo secrets exist. Until Access is applied the anonymous edge answers 200, so
  `on_release_published.yml` probes staging for 200; flip `edge-probe-expect` to `302` in the same
  change that merges the Access PR.
- Cloudflare Access: OIDC identity provider pointing at Authentik, a self-hosted application on
  `staging.twente.dev`, an allow policy for the Authentik login. Lands as a PR that can only apply
  once the tofu token carries `Access: Apps and Policies: Edit` and
  `Access: Organizations, Identity Providers, and Groups: Edit`, and once the repo secret
  `AUTHENTIK_ACCESS_CLIENT_SECRET` exists. Both are human steps, see below.

### webgrip/homelab-cluster

- Authentik blueprint `39-oidc-cloudflare-access.yaml` and the client-secret chain to OpenBao
  `cloudflare/access-oidc` and the `cloudflare` repo secret `AUTHENTIK_ACCESS_CLIENT_SECRET`:
  landed as `7108b3e2` (2026-09-05). The redirect URI assumes the Zero Trust team `webgrip`.
- **Blocker:** Authentik is routed on `envoy-internal` only. Cloudflare Access fetches the token and
  JWKS endpoints from its edge, so Authentik needs a public hostname (an `envoy-external` route or
  the tunnel) before this login can work; `AUTHENTIK_URL` on the cloudflare repo is that origin.
  One-time PIN is the fallback identity provider if exposing Authentik is not wanted.
- Branch protection through `scripts/forgejo-sync.sh --repo twente.dev --only protect --apply`
  with `PUSH_WHITELIST=webgrip-ci,ryangr0`, run by the owner (needs a repo-admin token).

### webgrip/twente.dev — landed 2026-09-05 as `cd20c36`, branch `development` created

1. `wrangler.toml`: `[env.staging]`, worker `twente-dev-staging`, route `staging.twente.dev/*`.
2. `.releaserc.cjs` with `makeConfig({ extraReleaseRules: [{ type: 'content', release: 'patch' }] })`,
   tag-only; the 2025 `.releaserc.json` goes. Since 2026-09-17 also `changelog: false` — see
   "Waarom er geen back-merge meer is" below.
3. `on_source_change.yml`: verification on push, preview upload for feature branches, a
   release job on `main` and `development` only, no production deploy. The `pull_request`
   trigger went with [ADR 0020](../adrs/0020-ci-critical-path.md): it ran every
   `development` push a second time while the promotion PR is open.
4. `on_release_published.yml`: `release: [published]`; rc tags deploy
   staging, stable tags deploy production, each with its edge verification.
5. `nightly-rebuild.yml` checks out the latest stable tag, not `main`.
6. `on_release_published.yml`, job `open-promotion-pr`: when an rc is published, open or keep the
   promotion PR to `main`, with the staging deploy result and the live answer of
   `staging.twente.dev/nl` written into the PR body; an open PR that is not mergeable fails the
   job. A push that cuts no rc opens nothing.
7. `renovate.json`: `baseBranches: ["development"]`.
8. `CLAUDE.md`: sessions commit to `development`; `main` is promotion plus owner hotfixes.
9. Branch `development` created from `main`.

## De back-merge: waarom hij kleiner werd, en wie hem nu doet (2026-09-17)

Tot 17 september commit semantic-release een `chore(release): vX.Y.Z [skip ci]` terug naar de
branch waarop het releaset, met `CHANGELOG.md` erin. Op `main` bestond die commit daarna nergens
anders, dus na elke promotie liep `development` één commit achter. Wie die back-merge oversloeg,
liet semantic-release op `development` doorrekenen vanaf de laatste _prerelease_-tag in plaats van
de stable: op 17 september leverde dat een `v0.3.0-rc.3` op nadat `v0.3.0` al in productie stond.
De stap stond nergens opgeschreven behalve als foutmelding in `on_release_published.yml`, en dan
pas nadat het misging.

`changelog: false` in `.releaserc.cjs` haalt de release-commit weg: er valt niets meer terug te
committen. De release notes veranderen niet — die komen van de notes generator en staan op de
Forgejo release page. Wat vervalt is `CHANGELOG.md` in de working tree, plus de union-merge in
`.gitattributes`, de prettier-uitzondering en de uitzondering die de claims-guard ervoor had.

**Dat alleen was niet genoeg, en dat is op de promotie van `v0.3.1` gebleken.** Die werd met een
merge commit gemerged, en zo'n merge commit bestaat ook alleen op `main`. De stable tag kwam erop
te staan en was daarmee nog steeds onbereikbaar vanaf `development`. Nagerekend met de functie die
de beslissing neemt, `semantic-release/lib/get-next-version.js`: met de tag onbereikbaar wordt de
volgende rc `0.3.1-rc.3`, met de tag bereikbaar `0.3.2-rc.1`. De rekenregel leest `branch.tags`,
en die zijn per branch _bereikbaar_, niet globaal.

**De regel waar alles op terugkomt: elke commit die alleen op `main` bestaat, breekt de telling.**
Er zijn precies twee bronnen. De release-commit is er één, en die is weg met `changelog: false`.
De merge commit van de promotie is de andere, en die is weg sinds de promotie een fast-forward is
(ADR 0019 v1.4.0). Daarmee is `main` een prefix van `development` van constructie, en valt er na
een promotie niets te herstellen.

`ploeg` draait hetzelfde model en heeft dit nooit gehad: er staat geen enkele promotie-merge-commit
op zijn `main` en die is een lineaire voorouder van `development`.

De job `back-merge` in `on_release_published.yml` blijft staan als vangnet, niet als onderdeel van
de flow. Bij een normale promotie meldt hij "nothing to do". Hij slaat alleen aan bij de
hotfix-route uit ADR 0019 — een directe push op `main` maakt dezelfde onbereikbaarheid, en dat is
het enige geval dat een fast-forward-promotie niet afdekt. Divergeren de branches echt, dan faalt
hij luid in plaats van het stil te laten gebeuren.

De optie zelf zit in `@webgrip/semantic-release-config` v1.3.0, gedragen door toolchain-image
`harbor.webgrip.dev/webgrip/semantic-release:0.3.4` en de lanes van `webgrip/workflows` v2.7.2.
Een repo die `changelog: false` zet op een ouder image krijgt geen genegeerde optie maar een
falende release: `makeConfig` gooit op onbekende opties.

## Verification, in order

1. A `fix:` on `development` cuts `v<next>-rc.1`, the release event deploys `staging.twente.dev`,
   the anonymous edge answers 302 to the Access login, a logged-in browser sees the site.
2. The promotion PR merged to `main` cuts `v<next>`, the release event deploys production, the
   smoke paths answer 200, the 404 path answers 404.
3. The nightly run redeploys the same stable tag; the live generator meta does not change.
4. After protection: a direct push to `main` by the CI bot or the owner succeeds, by anyone else
   is rejected; a push to `development` by the owner succeeds.
5. Renovate's next PR targets `development`.

## Human steps

| Step                                                                               | Why a human                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| Extend the `forgejo-ci-tofu` token with the two Access permission groups           | Cloudflare token policies are dashboard-only      |
| Confirm the Zero Trust team name used in the Authentik redirect URI                | not readable without an Access-scoped token       |
| Decide how Authentik becomes reachable from the internet, then set `AUTHENTIK_URL` | exposing the identity provider is a security call |
| Open the PR for `feat/staging-access` in the cloudflare repo                       | sessions hold no token that may open PRs          |
| Run the `forgejo-sync.sh … --only protect --apply` command for twente.dev          | needs a Forgejo admin token                       |
| Merge the cloudflare Access PR once the plan is clean                              | first apply of a new resource family              |

## Deferred

- webgrip.nl follows the same steps once twente.dev has run the full loop (owner decision
  2026-09-05).
- A maintenance-branch model was considered and not needed: the owner keeps direct push on `main`.
