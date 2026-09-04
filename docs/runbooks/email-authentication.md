# Runbook — mail authentication for twente.dev and webgrip.nl

**Owner: Ryan** (needs Cloudflare DNS and Google Workspace admin; neither is available to an
agent). Originally filed as the blocker on all outreach — VIK-798.

> **Verified state, 2026-09-01** (measured with `dig` against 8.8.8.8, not asserted). Both
> zones are on the same Cloudflare account (`lynn`/`nadia.ns.cloudflare.com`).
>
> |         | twente.dev                              | webgrip.nl               | ryangrippeling.nl |
> | ------- | --------------------------------------- | ------------------------ | ----------------- |
> | MX      | Cloudflare Email Routing (inbound only) | Google Workspace         | **none**          |
> | SPF     | ✅ Cloudflare + Google includes         | ✅ Google include        | ✅ `-all`, no MX  |
> | DKIM    | ✅ 408 chars, `google` selector         | ✅ 408 chars             | ❌ absent         |
> | DMARC   | ✅ `p=none`, two `rua`, `fo=1`          | ✅ `p=none`, two `rua`   | ✅ `p=reject`     |
> | DNSSEC  | ❌ deliberately deferred                | ❌ deliberately deferred | ❌                |
> | MTA-STS | ❌ not yet                              | ❌ not yet               | ❌ n/a            |
>
> **The baseline is done on both sending domains.** Outreach from `ryan@webgrip.nl` is
> authenticated. What remains is hardening, one unverified assumption, and one architectural
> decision — all listed under "Still open".

---

## What was done, 2026-09-01

In roughly one sitting, from a starting position of zero of eight:

1. **SPF** published on webgrip.nl (it had none at all — every business mail from that domain
   was unauthenticated, independently of twente.dev).
2. **DMARC `p=none`** on both domains, with `fo=1; adkim=r; aspf=r`.
3. **`dmarc@` made deliverable** on both — a Cloudflare routing rule on twente.dev, a Google
   Group on webgrip.nl.
4. **twente.dev added to Google Workspace** as a domain alias of webgrip.nl, so Google can
   sign for it.
5. **DKIM generated, published and authentication started** on both domains, 2048-bit.
6. **SPF on twente.dev** extended with the Google include (Path B shape — both includes).
7. **Cloudflare DMARC Management** enabled on both zones, so the aggregate reports are parsed
   into a dashboard instead of arriving as unreadable XML.

Sequencing that mattered: the domain had to be added to Workspace early, because Google needs
the domain known before it will mint a DKIM key.

---

## Still open

Ordered by what unblocks what. Items 1 and 2 are quick; 3 gates 6.

1. ~~**Verify outbound DKIM alignment.**~~ **Done, 2026-09-04.** Outbound from
   `hello@twente.dev` lands at outlook.com with `dkim=pass (signature was verified)
header.d=twente.dev`, `dmarc=pass` and `compauth=pass reason=100`. mail-tester scores
   8.8/10 and awards `DKIM_VALID_AU`, which is specifically the author-domain check. The
   signature is aligned; the alias is signing as twente.dev, not as webgrip.nl.
   **But note which leg carries it.** SPF passes on the envelope
   (`smtp.mailfrom=webgrip.nl`) while the header From is `twente.dev`, so SPF is _not_
   aligned and DMARC is passing on DKIM alone. That is valid, and it is one leg. If DKIM
   signing ever breaks (key rotation, or the alias-to-secondary-domain switch in item 3),
   DMARC fails the same day rather than degrading. Re-run this test after any change to
   the Workspace domain setup.
   The 8.8 rather than 10 is content, not authentication: `HTML_IMAGE_ONLY_16` costs
   1.048 for too little text against the images, and `HEADER_FROM_DIFFERENT_DOMAINS`
   costs 0.25 for the envelope/From split above. Worth fixing in the announcement
   template before it goes to a real list.
2. ~~**Lock down ryangrippeling.nl.**~~ **Done, 2026-09-04.** `v=spf1 -all` and
   `_dmarc` `p=reject` are published; the domain has no MX and now cannot be spoofed.
3. **Decide: domain alias or secondary domain for twente.dev.** No longer forced by DKIM
   (item 1 proved alignment works under the alias). The remaining reason is namespace: a
   domain alias mirrors usernames and has no namespace of its own, so `conduct@twente.dev`
   cannot be a group with more than one member. Inbound works today through Cloudflare
   Email Routing, so a single organiser is fine and nothing is broken. This becomes
   blocking the moment a second code-of-conduct contact is appointed, which the organiser
   playbook calls the first role to hand off. Cost of switching: remove the alias, re-add
   as a secondary domain, regenerate DKIM (new key, new TXT), then re-run item 1.
4. **Google Postmaster Tools** for both domains. Free, and the only place the real spam rate
   and authentication rate are visible rather than guessed at.
5. **Registrar transfer**, Hostnet → Namecheap, for webgrip.nl and ryangrippeling.nl. Verify
   Namecheap accepts `.nl` _transfers_ first; ccTLD support is narrower than gTLD support.
   Cloudflare Registrar is not an option here — it does not carry `.nl`.
6. **DNSSEC** on all zones — **after** the registrar transfer, never during. Enabling it means
   a DS record at the registry managed through the registrar; a transfer with DNSSEC live can
   leave a signed zone with no matching DS, which resolves as SERVFAIL rather than as a visible
   error.
7. **MTA-STS + TLS-RPT** on twente.dev. Enforces TLS on inbound mail so a downgrade attack
   cannot strip STARTTLS. Blocked on decision 3, because the policy's `mx:` list must match the
   real MX exactly.
8. **Subdomain lockdown** — `v=spf1 -all` plus `_dmarc` `p=reject` on anything that never
   sends, and `sp=reject` on the apex once the apex is at quarantine. Cloudflare's DMARC
   Management does not cover subdomains; these are manual.
9. **Tighten DMARC**, after two to four weeks of clean reports. See the ladder below.

---

## Gotchas that cost time, and what they actually mean

The point of this section: none of these produce an error message. They all look like success
or like silence.

### "Complete" on the domain-status page does not mean signing is on

The Workspace domain overview compares your **published DNS values against the recommended
ones**. That is all it does. Whether Google is actually signing is a different screen: Apps →
Google Workspace → Gmail → **Authenticate email**. The authoritative indicators there are the
`Status:` line and the presence of a **STOP AUTHENTICATION** button.

That page also shows a permanent block of text reading _"You must update the DNS records for
this domain… then click Start authentication"_ — **it shows this regardless of status**. It is
boilerplate, not an instruction directed at your current state.

### Google signs without owning your MX

DKIM went to Complete on twente.dev while MX still pointed at Cloudflare Email Routing and
Gmail showed _Pending activation_. Signing is outbound; MX is inbound; they are independent.

So **Path B is confirmed viable**: you never have to move MX for authentication reasons. Moving
it is a decision about mailboxes and about `conduct@`, not a technical requirement.

### A domain alias mirrors usernames — it has no namespace of its own

This is the one that bites hardest, and it is invisible until you try.

A **domain alias** of webgrip.nl means every existing webgrip.nl user automatically gains the
matching `@twente.dev` address, delivered to the same inbox. What it does **not** give you is
the ability to create addresses at twente.dev. In the _Alternate email addresses_ dialog the
domain dropdown offers **only webgrip.nl**; the twente.dev addresses appear below it, greyed
out and auto-generated.

Consequence: **every twente.dev address you want must also exist at webgrip.nl.** To get
`hello@twente.dev` you create `hello@webgrip.nl` and let the mirror produce it. For `hello@`
that is harmless. For `conduct@` it is not — the playbook requires that route to be a group
with more than one member, and under a domain alias it is by definition an alias on one
person's account.

A **secondary domain** has its own namespace: `hello@`, `conduct@` and `press@` become Google
Groups directly at twente.dev, free, with no webgrip.nl twins. That is the shape this project
actually needs. Recorded here because the domain alias was chosen first and the limitation was
only discovered at the dialog.

### A new Google Group rejects external senders by default

DMARC aggregate reports arrive from Google, Microsoft, Yahoo and Fastmail — all external. A
freshly created group bounces them with _"you may not have permission to post messages to the
group"_.

Fix: Admin console → Directory → Groups → the group → **Access settings** → tick **External**
on the **Who can post** row.

Two adjacent traps:

- **Do not** tick External on _Who can view conversations_. That publishes the archive to the
  internet, and DMARC reports enumerate your sending infrastructure, IPs and volumes.
- _Allow external members_ stays **off**. Posting permission and membership are separate
  rights; external senders do not need to be members to post.

Also set spam handling (a different screen — the group's posting policies) to post directly
rather than to a moderation queue. Otherwise external reports stop bouncing and start silently
accumulating in a queue nobody opens, which is harder to notice than the bounce.

Verify by sending from an address outside Workspace and confirming it lands in the archive.

### Cloudflare DMARC Management adds a `rua`, it does not replace yours

Its dialog offers to append a Cloudflare-hosted reporting address to the existing record. It
preserved both `mailto:dmarc@twente.dev` and the `fo=1; adkim=r; aspf=r` tags — verified after
the fact with `dig`, because the preview truncates the value and shows the Cloudflare address
first.

It does **not** support subdomains; those `_dmarc` records stay manual.

### A 2048-bit DKIM key is 408 characters and must be pasted whole

Longer than the 255-character limit for a single DNS character-string. TXT handles this by
splitting into multiple quoted strings that are concatenated on read. Cloudflare does the
splitting correctly — do not pre-split it or add quotes by hand.

Verify **both ends**, not just that something resolves:

```bash
v=$(dig +short TXT google._domainkey.twente.dev @8.8.8.8 | tr -d '" \n')
echo "${#v}"        # expect 408
echo "${v: -20}"    # must match the tail shown in the Admin console
```

### DNSSEC and registrar transfers do not mix

Enable DNSSEC only once the domain is at its final registrar. The DS record lives at the
registry and is managed through the registrar; a transfer mid-flight can leave a signed zone
without a matching DS. The failure mode is SERVFAIL at validating resolvers — invisible from a
browser that uses a resolver with a stale cache. This is the same class of breakage found on
`tkkrlab.nl`, which went unnoticed for months.

---

## Reference — the two paths

### Path A — MX to Google

Best when replies matter and role addresses need real mailboxes.

```text
twente.dev  MX  1   aspmx.l.google.com
twente.dev  MX  5   alt1.aspmx.l.google.com
twente.dev  MX  5   alt2.aspmx.l.google.com
twente.dev  MX  10  alt3.aspmx.l.google.com
twente.dev  MX  10  alt4.aspmx.l.google.com
```

SPF becomes `v=spf1 include:_spf.google.com ~all` — the Cloudflare include is dropped, because
Cloudflare no longer handles this domain's mail. Recreate `hello@`, `conduct@` and `press@`;
`conduct@` should be a group so it does not depend on one person.

Trade-off: you lose Cloudflare Email Routing's catch-all. Worth it when the reply _is_ the
point of the outreach.

**Do not cut over on a day that matters.** Registration for /001 runs by e-mail to
`hello@twente.dev` from 2 September; an MX change that week is the wrong moment to discover a
misconfigured group.

### Path B — Cloudflare inbound, Workspace outbound (current state)

MX unchanged. Both includes in one record:

```text
twente.dev  TXT  v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
```

**One SPF record per domain, never two** — two is a permanent error, not a merge.

What Path B costs, in practice: `hello@twente.dev` is a forwarding rule, not a mailbox, so
there is no archive at twente.dev; forwarded mail is filtered more strictly than directly
delivered mail; and replying in Gmail defaults to your own address, so the From has to be
switched by hand every time.

---

## Verify before trusting it

```bash
for d in twente.dev webgrip.nl; do
  dig +short TXT "$d" @8.8.8.8 | grep -i spf
  dig +short TXT "_dmarc.$d" @8.8.8.8
  dig +short TXT "google._domainkey.$d" @8.8.8.8 | cut -c1-60
  dig +short MX "$d" @8.8.8.8
done
```

Then send one real message to a Gmail address, an outlook.com address, and to
[mail-tester.com](https://www.mail-tester.com). In Gmail use **Show original** and confirm:

```text
SPF:   PASS
DKIM:  PASS   with  d=twente.dev
DMARC: PASS
```

**`d=twente.dev` is the part that matters.** A DKIM pass signed by `webgrip.nl` or `gmail.com`
is not alignment — it is the failure this runbook exists to prevent, and it looks like success.
Target 9/10 or better on mail-tester.

Test against **outlook.com** specifically, not only Gmail: every institution on the outreach
list — the universities, the municipalities, the large employers — runs Microsoft 365, and that
is the filter most likely to bin an unauthenticated new sender.

DMARC only needs **one** aligned leg. Once DKIM signs with the From domain, DMARC passes even
when SPF aligns to a different domain — which is why DKIM alignment is the one to chase: it
survives forwarding and send-as aliases, and SPF does not.

---

## Tighten, after 2–4 weeks of clean reports

```text
p=none  →  p=quarantine; pct=25  →  pct=100  →  p=reject
```

Do not skip to `p=reject`. If anything else legitimately sends as these domains — a form, a
CRM, an invoicing tool — enforcement is what surfaces it, and you want that discovered by a
report rather than by a bounced invoice. Add `sp=reject` once the apex is at quarantine, and
move `~all` to `-all` last.

---

## Beyond the baseline

Free, and almost nobody at this scale does it:

- **MTA-STS + TLS-RPT.** SMTP negotiates TLS opportunistically, so an attacker who strips
  STARTTLS reads everything. MTA-STS closes that. Serve
  `https://mta-sts.twente.dev/.well-known/mta-sts.txt` as `text/plain`, plus two TXT records:
  ```text
  _mta-sts.twente.dev    TXT   v=STSv1; id=<bump on every change>
  _smtp._tls.twente.dev  TXT   v=TLSRPTv1; rua=mailto:tlsrpt@twente.dev
  ```
  Start at `mode: testing` with a low `max_age`, read the TLS-RPT reports for two weeks, then
  go to `mode: enforce` with `max_age: 604800`. The `mx:` list must match the real MX exactly,
  and `tlsrpt@` must be a deliverable address or the reports bounce like any other mail.
- **DNSSEC**, one click per zone at Cloudflare — after the registrar transfer.
- **Google Postmaster Tools**, both domains.
- **Drift monitoring.** All of this is DNS, and DNS rots quietly. The repo pattern already
  exists for exactly this shape: `scripts/validate-csp.ts` guards a claim that only fails at
  the user. A `validate-mail-auth` script plus a scheduled Forgejo workflow would check SPF,
  DKIM, DMARC, DNSSEC and the MTA-STS policy on every domain and fail on drift.

---

## What this deliberately does not do

**No BIMI.** It puts the logo beside every message in Gmail, and the mark already exists
(`docs/brand/mark-round.svg`). But Gmail and Apple honour BIMI only with a Verified Mark
Certificate, which requires a _registered_ trademark plus roughly €1,000/year. The free half
displays only in Fastmail and Zoho, which is not where this audience is. Revisit if the mark is
ever registered.

**No DANE.** Requires DNSSEC first, and only pays off if the MX hosts publish TLSA records —
check the Workspace console rather than assuming.

**No sending subdomain.** Standard cold-email advice says never send from the primary domain.
That advice is for volume senders buying reputation insurance. Here the entire value is that
the message comes from a named human at `twente.dev`; an `outreach.twente.dev` sender reads as
a marketing rig to exactly the institutional recipients being courted, and splitting reputation
across two domains halves the signal from genuine, replied-to mail.

**Where a subdomain _is_ right: the newsletter.** Put Brevo on `news.twente.dev` so an
unsubscribe spike on an opt-in list cannot damage the apex that personal mail depends on.

**No warm-up scheme.** At 10–30 hand-written messages a week you are already sending at warm-up
pace. Week one, send five to ten to people who will actually reply — replies are the strongest
positive signal available, stronger than volume. Never open with a batch of unverified role
addresses: bounces on a cold domain are the worst possible first impression, and verifying each
address on the organisation's own contact page is required for the legal exemption anyway.

**Authentication is not deliverability.** All of the above gets mail _delivered_; it does not
get it _read_. At this volume, reputation is driven by bounces, complaints and replies — one
batch to unverified `info@` addresses does more damage than these records repair.
