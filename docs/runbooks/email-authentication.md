# Runbook — make twente.dev able to send mail

**Owner: Ryan** (needs Cloudflare DNS and Google Workspace admin; neither is available to an
agent). Blocks all outreach — VIK-798.

> **Verified state, 2026-08-30.** Both zones are on the same Cloudflare account
> (`lynn`/`nadia.ns.cloudflare.com`), so this is one sitting.
>
> |       | twente.dev                                                                                    | webgrip.nl          |
> | ----- | --------------------------------------------------------------------------------------------- | ------------------- |
> | MX    | Cloudflare Email Routing — **inbound forwarding only**                                        | Google Workspace    |
> | SPF   | `v=spf1 include:_spf.mx.cloudflare.net ~all` — authorises the _forwarder_, nothing that sends | **absent entirely** |
> | DKIM  | **none**                                                                                      | **none**            |
> | DMARC | **none**                                                                                      | **none**            |
>
> Consequence: mail composed as `hello@twente.dev` is unauthenticated on every path. If
> twente.dev is a Workspace domain, SPF is checked against twente.dev and fails for lack of a
> Google include; if it is only a Gmail alias, the envelope domain is webgrip.nl, which
> publishes no SPF. Neither yields a DKIM signature.
>
> **This also affects webgrip.nl's ordinary business mail**, independently of twente.dev.

---

## Step 0 — do this now, it is free and reversible

Publish a monitoring-only DMARC record on **both** domains. `p=none` enforces nothing, so no
message can be rejected because of it; it just starts collecting reports so the later steps
have evidence instead of guesswork. While Cloudflare Email Routing is still live,
`dmarc@twente.dev` is simply another routing rule.

In Cloudflare DNS, add two TXT records:

```text
Name:  _dmarc.twente.dev
Type:  TXT
Value: v=DMARC1; p=none; rua=mailto:dmarc@twente.dev; fo=1; adkim=r; aspf=r
```

```text
Name:  _dmarc.webgrip.nl
Type:  TXT
Value: v=DMARC1; p=none; rua=mailto:dmarc@webgrip.nl; fo=1; adkim=r; aspf=r
```

Keep the `rua` address on the same domain. Pointing reports at a third-party domain requires
_that_ domain to publish an authorisation record, which is a silent failure mode.

Also fix webgrip.nl's missing SPF in the same pass — it is on Google Workspace, so:

```text
Name:  webgrip.nl
Type:  TXT
Value: v=spf1 include:_spf.google.com ~all
```

**One SPF record per domain, never two.** Two records is a permanent error, not a merge.

---

## Step 1 — answer the one question that decides the rest

**Is `twente.dev` registered in your Google Workspace?**

Check: Google Admin console → **Account → Domains → Manage domains**. Either it is listed
(as a secondary domain or a domain alias), or it is not and `hello@twente.dev` is only a
Gmail _"Send mail as"_ alias.

This decides everything below, because **Google can only DKIM-sign for a domain it knows
about.**

---

## Path A — add twente.dev to Workspace as a domain alias (recommended)

Best end state, and it suits how this is actually used: one mailbox, several addresses.

A **domain alias** of webgrip.nl means every existing user automatically gains the matching
`@twente.dev` address, delivered to the same inbox, with native send-as and full alignment.
No extra licence cost.

1. Admin console → Domains → **Add a domain** → _domain alias of webgrip.nl_ → verify.
2. **Point MX at Google** and remove Cloudflare Email Routing. Recreate `hello@`, `conduct@`
   and `press@` as user aliases or Google Groups. (`conduct@` should be a group, so it can
   fan out to the two trained contacts without depending on one person.)

   ```text
   twente.dev  MX  1   aspmx.l.google.com
   twente.dev  MX  5   alt1.aspmx.l.google.com
   twente.dev  MX  5   alt2.aspmx.l.google.com
   twente.dev  MX  10  alt3.aspmx.l.google.com
   twente.dev  MX  10  alt4.aspmx.l.google.com
   ```

3. **SPF** — replace the Cloudflare include entirely, since Cloudflare no longer handles this
   domain's mail:

   ```text
   Name: twente.dev   Type: TXT
   Value: v=spf1 include:_spf.google.com ~all
   ```

4. **DKIM**, per domain: Admin console → Apps → Google Workspace → Gmail → **Authenticate
   email** → select the domain → **2048-bit** → publish the record it gives you at
   `google._domainkey.<domain>` → then click **Start authentication**.

   Two gotchas: Gmail must have been active on the domain for 24–72 hours before the console
   will mint a key, and a 2048-bit value exceeds the 255-character DNS string limit —
   Cloudflare chunks it correctly, but verify with `dig` afterwards rather than assuming.

**Trade-off:** you lose Cloudflare Email Routing's catch-all convenience. Worth it — replies
land natively in the right mailbox instead of via a forward, which matters when the reply
_is_ the point of the outreach.

---

## Path B — keep Cloudflare inbound, Workspace for outbound only

Valid if you would rather not move MX right now. twente.dev still has to be **added to
Workspace** (as a secondary domain) so Google can sign for it — but you can leave MX on
Cloudflare. Google will warn that mail is not delivered to it; that is expected.

- **MX** — unchanged, Cloudflare Email Routing.
- **SPF** — both paths, in _one_ record:

  ```text
  Name: twente.dev   Type: TXT
  Value: v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
  ```

- **DKIM** — same Admin console steps as Path A.

Keep `~all` (softfail) on both paths until the DMARC reports come back clean, then tighten
to `-all`.

---

## Step 2 — verify before trusting it

```bash
dig +short TXT twente.dev
dig +short TXT _dmarc.twente.dev
dig +short TXT google._domainkey.twente.dev | cut -c1-60
dig +short MX  twente.dev

dig +short TXT webgrip.nl
dig +short TXT _dmarc.webgrip.nl
dig +short TXT google._domainkey.webgrip.nl | cut -c1-60
```

Then **send one real message** as `hello@twente.dev` to a Gmail address, a personal
outlook.com address, and to [mail-tester.com](https://www.mail-tester.com). In Gmail use
**Show original** and confirm all three read `PASS`:

```text
SPF:   PASS
DKIM:  PASS   with  d=twente.dev
DMARC: PASS
```

**`d=twente.dev` is the part that matters.** A DKIM pass signed by `webgrip.nl` or
`gmail.com` is not alignment — it is the failure this whole runbook exists to prevent, and it
looks like success. Target 9/10 or better on mail-tester.

Test against **outlook.com** specifically, not only Gmail: every institution on the outreach
list — the universities, the municipalities, the large employers — runs Microsoft 365, and
that is the filter most likely to bin an unauthenticated new sender.

---

## Step 3 — tighten, after 2–4 weeks of clean reports

```text
p=none  →  p=quarantine; pct=25  →  pct=100  →  p=reject
```

Do not skip to `p=reject`. If anything else legitimately sends as these domains — a form, a
CRM, an invoicing tool — enforcement is what surfaces it, and you want that discovered by a
report rather than by a bounced invoice.

---

## What this deliberately does not do

**No sending subdomain.** Standard cold-email advice says never send from the primary domain.
That advice is for volume senders buying reputation insurance. Here the entire value is that
the message comes from a named human at `twente.dev` — an `outreach.twente.dev` sender reads
as a marketing rig to exactly the institutional recipients being courted, and splitting
reputation across two domains halves the signal from genuine, replied-to mail.

**Where a subdomain _is_ right: the newsletter.** Put Brevo on `news.twente.dev` so an
unsubscribe spike on an opt-in list cannot damage the apex that personal mail depends on.

**No warm-up scheme.** At 10–30 hand-written messages a week you are already sending at
warm-up pace. Week one, send five to ten to people who will actually reply — replies are the
strongest positive signal available, stronger than volume. Never open with a batch of
unverified role addresses: bounces on a cold domain are the worst possible first impression,
and verifying each address on the organisation's own contact page is required for the legal
exemption anyway.
