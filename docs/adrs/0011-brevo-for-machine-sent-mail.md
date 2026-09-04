# ADR 0011 – Brevo on `send.twente.dev` for every machine-sent mail

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-02
- **Tags**: External services, Trust & Safety, Infrastructure
- **Version**: 1.0.0

---

## Context and Problem Statement

`ee52888` shipped `<NewsletterForm>` deliberately provider-agnostic: our own markup, a plain
cross-origin POST, and `NEWSLETTER_FORM_ACTION` left `null` so the page renders an honest mailto
until an endpoint exists. The registry listed the provider as an open decision ("Buttondown vs.
self-hosted listmonk — Phase 3"). That deferral ran out: registration opens 2 September, the
/001 page now offers an updates route with nothing behind it, and the launch tracker's
"email opt-in live" milestone has been amber since 31 August.

Two constraints made this more than a vendor pick.

**The privacy pages are already specific.** Both locales promise no third-party scripts, no
cookies, double opt-in, one-click unsubscribe, open tracking off, and a named processor inside the
EU. A provider is only admissible if all six survive contact with its defaults.

**The apex carries the launch.** [The mail runbook](../runbooks/email-authentication.md) found
twente.dev unauthenticated on every path on 2026-08-30, and argues that hand-written outreach must
send from the apex because "the entire value is that the message comes from a named human". That
same reasoning forbids putting bulk mail there: every institution on the outreach list runs
Microsoft 365, and a complaint spike scored against the apex would degrade exactly the mail the
launch depends on.

## Decision Drivers

| #   | Driver                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------- |
| 1   | The six published privacy promises must hold under the provider's defaults, not despite them              |
| 2   | An EU/GDPR processor, nameable on the privacy page without a transfer story                               |
| 3   | Nothing that has to be _operated_ — one person, one evening a quarter, no pager                           |
| 4   | Institutional recipients on Microsoft 365 must actually receive; a fresh unauthenticated sender is binned |
| 5   | Bulk complaints must not touch the domain the hand-written outreach sends from                            |
| 6   | The archive stays on twente.dev (ADR 0008) — a provider that wants to own it is disqualified              |

## Considered Options

**Platform**: Brevo · Mailcoach (Spatie) · Keila Cloud · EmailOctopus · Buttondown · MailerLite ·
self-hosted listmonk with a managed relay · own MTA (Postal, Postfix) · Cloudflare Email Service ·
Mailman announce-only list · no list at all (RSS and ICS only).

**Sending identity**: the apex `twente.dev` · `news.twente.dev` · `send.twente.dev`.

## Decision Outcome

### Chosen Option

**Brevo carries every mail the site sends as a system, from `send.twente.dev`. Mail written by a
human keeps going out from the apex through Google Workspace.**

- **One platform for machine mail.** The newsletter first; confirmations and reminders around an
  edition as they come online. Splitting them across two providers would double the processors on
  the privacy page and halve the reputation signal on both.
- **One sending subdomain, purpose-neutral in its name.** `send.` rather than `news.`, because the
  same identity signs a registration confirmation, where "news" would be untrue. It carries its own
  SPF and DKIM, so the apex SPF record is untouched and Workspace's DKIM keeps signing personal mail.
- **The form stays first-party.** `<NewsletterForm>` renders our markup and POSTs cross-origin to
  Brevo's serve endpoint — no script, no iframe, no cookie. The field contract is Brevo's: `EMAIL`
  (uppercase, because Brevo maps fields onto contact attributes), `email_address_check` as the
  honeypot, `locale` to pick the language of the confirmation mail, and `html_type` from
  `NEWSLETTER_FORM_FIELDS`.
- **The CSP is derived, not maintained.** `astro.config.mjs` reads `NEWSLETTER_FORM_ACTION` and puts
  its origin in `form-action`, so the endpoint and the policy cannot drift apart.
- **Consent is the double opt-in.** No checkbox: the confirmation click is the record, held with a
  timestamp by the processor. Anonymised tracking is switched on in Brevo, which is what makes the
  "open tracking is off" sentence true.

### Rejected options and why

- **Self-hosted listmonk with a managed relay.** The cheapest, most FOSS-aligned answer, and the one
  we got furthest into. Rejected on driver 3: it puts the pager on one person, and its failure modes
  are quiet — listmonk's POP3 bounce processing reads a mailbox and classifies out-of-office replies
  as bounces, which is precisely what outreach to institutions generates.
- **An own MTA.** A fresh IP with no history, no PTR on a consumer connection, and port 25 blocked
  outbound by most Dutch ISPs. It would sabotage driver 4 in the way that looks like success until
  someone mentions they never got it.
- **Cloudflare Email Service.** Tempting because the zone and the Worker are already here. Sending
  is beta on Workers Paid, framed for transactional use, and — decisively — it is not a list
  manager: no double opt-in, no unsubscribe, no consent record. It would be a pipe under something
  we would then have to build.
- **Forward Email.** Advertises itself as 100% open source and publishes an official listmonk guide.
  The repository is `BUSL-1.1 AND MPL-2.0`, which is source-available, not open source. Checking the
  licence is what removed it.
- **Hyvor Relay.** Genuinely AGPL-3.0, but the hosted plan is sized at €30/month for 300k mails
  against our ~1,200, and self-hosting it is the own-MTA option under another name.
- **Mailcoach and Keila Cloud.** Both are better fits on EU establishment and product shape than the
  option chosen, and Mailcoach was picked first and reversed the same day. Brevo wins on two
  specifics: it is already named as the processor in both privacy pages and in the runbook, and it
  holds bulk and transactional in one account, which is what driver 5's single-identity plan needs.
- **Buttondown.** The closest match in tone, rejected on driver 2 (US establishment, so a transfer
  story the privacy page does not currently carry) and driver 6 (its hosted archive competes with
  the one ADR 0008 puts on twente.dev).
- **`news.twente.dev`.** Correct while the newsletter was the only automated mail. Once the plan
  covered event mail, the name would be false on half of what it signs.
- **The apex as sending identity.** Rejected on driver 5, and the runbook had already argued it.

### Consequences

**Good**

- One processor for everything the site sends automatically, so the privacy page gains one name
  rather than a list, and there is one place to check whether tracking is off.
- The apex SPF record is untouched and Workspace DKIM keeps signing personal mail, so an unsubscribe
  spike on the list cannot reach the outreach.
- The subscribe form remains first-party: no third-party script, no cookie, no iframe, and the CSP
  origin follows the endpoint automatically.
- The provider holds a timestamped confirmation per subscriber, which is a stronger consent record
  than anything we would keep ourselves.

**Bad**

- Bulk and transactional now share one reputation on `send.twente.dev`. A campaign that draws
  complaints can delay a registration confirmation somebody is waiting for. The trigger to split is
  transactional mail becoming something people wait on; that is also the cheaper half to move.
- The From address reads `@send.twente.dev`, and that subdomain has no MX, so a reply bounces unless
  Reply-To is set to `hello@twente.dev`. The homepage promises the newsletter is reply-friendly, so
  this is a published promise resting on one provider setting.
- Brevo stamps its logo on free-tier mail; removing it is a paid add-on. This decision therefore
  carries the first recurring bill on the project.
- Event registration data now passes a processor, where the 2026-08-30 decision had it as a mailbox
  and a hand-kept list. The privacy pages change accordingly.
- Open tracking is off by choice in a UI where it is on by default. Nothing in this repository can
  enforce it — it is a setting, checked by a human, behind a sentence we publish.

## Confirmation

- `dig +short TXT _dmarc.twente.dev` returns **exactly one** record. Two DMARC records is not a
  merge; RFC 7489 treats the domain as having no policy at all.
- `dig +short TXT send.twente.dev` returns the `brevo-code`, and
  `dig +short TXT mail._domainkey.send.twente.dev` returns the DKIM key. **No SPF record is
  published on the sending subdomain**: on Brevo's shared IPs the Return-Path stays on a
  Brevo-owned domain, so an SPF pass there does not align with our From address and earns nothing.
  DMARC passes on DKIM alignment alone, which is why the DKIM record is the load-bearing one.
- A test message to Gmail, to an outlook.com address and to mail-tester.com reads `SPF: PASS`,
  `DKIM: PASS` and `DMARC: PASS`, with **`d=send.twente.dev`**. A pass signed by `brevo.com` is the
  failure this ADR exists to prevent, and it looks like success.
- `NEWSLETTER_FORM_ACTION` being non-`null` puts its origin into `form-action`; `pnpm validate:csp`
  passes and the rendered `<meta http-equiv="content-security-policy">` names the Brevo origin.
- Brevo's campaign settings show anonymised tracking active, and a received edition contains no
  tracking pixel.

## More Information

- 2026-08-30 — runbook records both zones unauthenticated; newsletter earmarked for a subdomain
  (`57cb15b`).
- 2026-09-01 — `<NewsletterForm>` shipped provider-agnostic, CSP derived from the constant
  (`ee52888`).
- 2026-09-02 — Mailcoach chosen and reversed the same day; Brevo accepted; sending domain settled on
  `send.twente.dev` after the plan grew to include event mail.
