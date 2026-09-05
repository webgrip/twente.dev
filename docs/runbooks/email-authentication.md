# Runbook — mail authentication for twente.dev and webgrip.nl

**Owner: Ryan** (Google Workspace admin stays Ryan's; the DNS half is a commit in
[`webgrip/cloudflare`](https://forgejo.webgrip.dev/webgrip/cloudflare) since 2026-09-05,
[ADR 0018](../adrs/0018-account-and-zone-resources-in-opentofu.md)). Originally filed as the blocker on all outreach — VIK-798.

> **Verified state, 2026-09-04** (measured with `dig` against 8.8.8.8, not asserted). Both
> zones are on the same Cloudflare account (`lynn`/`nadia.ns.cloudflare.com`).
>
> |         | twente.dev                          | webgrip.nl               |
> | ------- | ----------------------------------- | ------------------------ |
> | MX      | Google Workspace, `smtp.google.com` | Google Workspace         |
> | SPF     | ✅ Google include                   | ✅ Google include        |
> | DKIM    | ✅ 408 chars, `google` selector     | ✅ 408 chars             |
> | DMARC   | ✅ `p=none`, two `rua`, `fo=1`      | ✅ `p=none`, two `rua`   |
> | DNSSEC  | ❌ deliberately deferred            | ❌ deliberately deferred |
> | MTA-STS | ✅ `mode: testing`, both TXT live   | ❌ not yet               |
> | CAA     | ❌ none, any CA may issue           | ❌ none                  |
>
> **twente.dev moved from domain alias to secondary domain on 2026-09-04**, MX included. The
> DKIM key was reminted that day and ends `OG82QF3EobbNIQIDAQAB`; the pre-migration key ended
> `pxe6hNv5yIv9ewIDAQAB`. Cloudflare Email Routing is off and its catch-all is replaced by a
> Workspace Default routing rule scoped to `.*@twente\.dev$`, acting only on non-recognized
> addresses. `hello@`, `conduct@`, `press@` and `dmarc@` are Google Groups, verified receiving
> from an external sender at every member.
>
> **The baseline is done on both sending domains.** What remains is hardening, listed under
> "Still open".

---

## What was done, 2026-09-01

In roughly one sitting, from a starting position of zero of eight:

1. **SPF** published on webgrip.nl (it had none at all — every business mail from that domain
   was unauthenticated, independently of twente.dev).
2. **DMARC `p=none`** on both domains, with `fo=1; adkim=r; aspf=r`.
3. **`dmarc@` made deliverable** on both — a Cloudflare routing rule on twente.dev, a Google
   Group on webgrip.nl.
   **Corrected 2026-09-04, from the dashboard: neither half of that sentence is right for
   twente.dev.** There is no routing rule for `dmarc@`, and there are no per-address rules at
   all. The zone has exactly one rule, a **catch-all to `ryan+twentedev@webgrip.nl`**, and it
   is the only reason `hello@`, `conduct@`, `press@` and `dmarc@` resolve to anything.
   Worse, `dmarc@` is **not deliverable**: over the last seven days Email Routing received 42
   messages, forwarded 15 and failed 27, and every failure in the log is a Google aggregate
   report from `noreply-dmarc-support@google.com` to `dmarc@twente.dev`, going back at least
   23 hours in an unbroken run. Test messages from an outside mailbox to `hello@`, `conduct@`,
   `press@` and `dmarc@` forwarded fine on the same day, so the address works and the reports
   specifically do not. The likely mechanism is the forwarding hop: an aggregate report is
   `From: google.com`, which publishes `p=reject`, and a forward that breaks the original DKIM
   signature leaves nothing aligned for the receiving side to accept. Confirm against the
   failure reason in the Activity Log before treating that as the cause.
   Consequence while it lasts: the DMARC ladder cannot be climbed on the mailbox leg. What is
   keeping the record honest is the Cloudflare `rua`, whose dashboard does have data, so the
   reports are being collected even though the copy addressed to us is being dropped.
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

Ordered by what unblocks what. Item 1 is quick; 4 gates 5.

1. ~~**Verify outbound DKIM alignment.**~~ **Done, 2026-09-04.** Outbound from
   `hello@twente.dev` lands at outlook.com with `dkim=pass (signature was verified)
header.d=twente.dev`, `dmarc=pass` and `compauth=pass reason=100`. mail-tester scores
   8.8/10 and awards `DKIM_VALID_AU`, which is specifically the author-domain check. The
   signature is aligned; the alias is signing as twente.dev, not as webgrip.nl.
   **But note which leg carries it.** SPF passes on the envelope
   (`smtp.mailfrom=webgrip.nl`) while the header From is `twente.dev`, so SPF is _not_
   aligned and DMARC is passing on DKIM alone. That is valid, and it is one leg. If DKIM
   signing ever breaks (key rotation, or the alias-to-secondary-domain switch in item 2),
   DMARC fails the same day rather than degrading. Re-run this test after any change to
   the Workspace domain setup.
   The 8.8 rather than 10 is content, not authentication: `HTML_IMAGE_ONLY_16` costs
   1.048 for too little text against the images, and `HEADER_FROM_DIFFERENT_DOMAINS`
   costs 0.25 for the envelope/From split above. Worth fixing in the announcement
   template before it goes to a real list.
2. ~~**Decide: domain alias or secondary domain for twente.dev.**~~ **Done, 2026-09-04.**
   Secondary domain, licence included, executed the same evening; see the state table above.
   The analysis that led there stands below, because routes A and B remain the fallbacks if
   this ever has to be unwound.
   No longer forced by DKIM
   (item 1 proved alignment works under the alias). **Corrected 2026-09-04: it is not forced
   by the alias either.** This item used to say a domain alias has no namespace of its own,
   so `conduct@twente.dev` could not be a group with more than one member. Google's own
   documentation says the opposite: "Each mailing group also gets an email address at the
   user alias domain." A Group at `conduct@webgrip.nl` therefore already yields
   `conduct@twente.dev`, at no cost and with as many members as it needs.
   **The real blocker is one hop earlier.** twente.dev's MX points at Cloudflare Email
   Routing, so Google's mirror is never consulted for inbound mail to this domain;
   Cloudflare decides, and a routing rule forwards to exactly one verified destination.
   That reframes the decision: a second code-of-conduct contact needs either a fan-out
   destination behind the Cloudflare rule, or MX at Google. It does not need a licence, and
   it does not need the alias removed. See "Adding a second person to `conduct@`" below.
   Cost of switching to a secondary domain anyway: remove the alias, re-add as a secondary
   domain, regenerate DKIM (new key, new TXT), then re-run item 1. Groups on a secondary
   domain are free; only a _user account_ there costs a licence, and that is what item 5 of
   the migration plan buys.
3. **Google Postmaster Tools** for both domains. Free, and the only place the real spam rate
   and authentication rate are visible rather than guessed at.
4. ~~**Registrar transfer**, Hostnet → Namecheap, for webgrip.nl.~~
   **Done, verified 2026-09-04** with `whois`: both `.nl` domains answer `Registrar: NAMECHEAP,
INC.` The ccTLD worry was unfounded. Cloudflare Registrar was never an option here; it does
   not carry `.nl`.
5. **DNSSEC** on all zones. **Unblocked by item 4, and webgrip.nl is already halfway there in a
   way worth naming.** Measured 2026-09-04: `webgrip.nl` publishes a `DNSKEY` (algorithm 13) and
   **no `DS` at the parent**, so Cloudflare signs the zone while no resolver validates it. That
   is the harmless half of the pair. The dangerous half is the reverse, a `DS` with no matching
   key, which resolves as SERVFAIL and is invisible from a browser on a cached resolver.
   Finishing it is one action per zone: take the DS values Cloudflare generates and enter them at
   Namecheap under Domain List → Manage → Advanced DNS → DNSSEC, as KeyTag, Algorithm, DigestType
   and Digest. `twente.dev` has neither half yet, so it starts in the Cloudflare dashboard.
6. ~~**MTA-STS + TLS-RPT** on twente.dev.~~ **Live in `mode: testing`, 2026-09-05.** The policy
   at `public/.well-known/mta-sts.txt` is served from the Worker on `mta-sts.twente.dev`,
   listing `smtp.google.com` plus the classic `aspmx` names so a revert does not invalidate it.
   `_mta-sts` carries `id=20260905` and `_smtp._tls` reports to the `tlsrpt@` group. The policy
   went up before the TXT record, which is the only safe order.
   What remains is one step, and it has a date: after two clean weeks of TLS-RPT, move the file
   to `mode: enforce` with `max_age: 604800` **and bump the `id`**, because receivers cache on
   that id and a policy change without one is ignored.
7. **Subdomain lockdown** — `v=spf1 -all` plus `_dmarc` `p=reject` on anything that never
   sends, and `sp=reject` on the apex once the apex is at quarantine. Cloudflare's DMARC
   Management does not cover subdomains; these are manual.
8. **Tighten DMARC**, after two to four weeks of clean reports. See the ladder below.

---

## Plan: van domain alias naar secondary domain

Dit is de klus die punt 3 en punt 5 hierboven in één keer oplost. Alles is
Cloudflare-DNS en Workspace-admin, dus het is handwerk. Doe het in één zitting.

### Wat er klaar is als je klaar bent

1. `twente.dev` staat in Workspace als **secondary domain**, niet als alias.
2. `ryan@twente.dev` is een echt gebruikersaccount met een eigen licentie.
3. `hello@`, `conduct@`, `press@` en `dmarc@` op twente.dev zijn **Google Groups**,
   dus met meer dan één lid en zonder doorstuurregel ertussen.
4. MX van twente.dev wijst naar Google; Cloudflare Email Routing staat uit voor
   dit domein.
5. Een testmail vanaf `ryan@twente.dev` laat **beide** DMARC-benen slagen:
   `dkim=pass header.d=twente.dev` én `spf=pass smtp.mailfrom=twente.dev`.

Punt 5 is de winst die de licentie koopt. Zonder een echt account op het domein
blijft de envelope `webgrip.nl` en blijft DMARC op één been staan, hoe je het
domein ook koppelt.

### Vooraf, en sla dit ergens op

- **Noteer het huidige DKIM-record**: `google._domainkey.twente.dev`, de hele
  waarde. De selector blijft straks hetzelfde en alleen de waarde verandert, dus
  dit is je vergelijkingspunt en je weg terug.

**Gemeten stand van 2026-09-04**, tegen 8.8.8.8, zodat het vergelijkingspunt al
vastligt voordat je begint. De DKIM-waarde staat hier als lengte en staart, want
dat is genoeg om te zien of je naar de oude of de nieuwe sleutel kijkt:

```text
google._domainkey.twente.dev   408 tekens, eindigt op  pxe6hNv5yIv9ewIDAQAB
twente.dev  MX                 2 route2 · 33 route3 · 60 route1 .mx.cloudflare.net
twente.dev  TXT                v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
_dmarc.twente.dev  TXT         v=DMARC1; p=none; rua=…dmarc-reports.cloudflare.net,mailto:dmarc@twente.dev; fo=1; adkim=r; aspf=r
```

Wat hier **niet** in staat en wat je zelf moet opschrijven: de Cloudflare Email
Routing-regels. Die zijn niet via DNS te lezen, dus ze staan alleen in het
dashboard en ze zijn de helft van je weg terug.

- **Schrijf elke Cloudflare Email Routing-regel voor twente.dev op**: welk adres
  naar welke bestemming. Je bouwt ze straks na als Groups en je hebt ze nodig als
  je terug moet.
- **Noteer de huidige MX-records** van twente.dev.
- Plan het niet vlak voor een verzending en niet op vrijdagmiddag.

### De volgorde, en waarom die zo is

De volgorde is gekozen zodat inkomende mail blijft werken tot het allerlaatste
moment. Cloudflare Email Routing hangt niet aan Workspace, dus stap 1 tot en met
6 raken je inbox niet. Pas stap 7 zet de post om.

1. **Verwijder de domain alias.** Admin console → Account → Domains → Manage
   domains → twente.dev → verwijderen. Google vraagt mogelijk eerst om
   verwijzingen op te ruimen. Kijk eerst even of er inmiddels een knop staat die
   een alias omzet naar een secondary domain; die kende ik niet, maar dan sla je
   stap 1 en 2 over.
2. **Voeg twente.dev toe als secondary domain.** Add domain → nadrukkelijk
   _secondary domain_, niet _alias_.
3. **Verifieer het eigendom** met het TXT-record dat Google geeft, in Cloudflare
   DNS op de apex.
4. **Maak `ryan@twente.dev`** als gebruiker. Dit kost een licentie en dit is de
   stap die SPF-alignment mogelijk maakt.
5. **Maak de Groups**: `hello@`, `conduct@`, `press@`, `dmarc@`. Zet er de leden
   in die nu in je Cloudflare-routeringsregels staan. Let op de valkuil verderop:
   een nieuwe Group weigert externe afzenders standaard, en dat is precies wat
   `hello@` en `conduct@` moeten kunnen ontvangen.
6. **Genereer DKIM opnieuw** voor twente.dev (Apps → Google Workspace → Gmail →
   Authenticate email), publiceer de nieuwe TXT-waarde in Cloudflare op
   `google._domainkey`, en zet daarna Start authentication aan. 2048 bit is 408
   tekens en moet in zijn geheel geplakt.
7. **Zet MX om naar Google** en schakel Cloudflare Email Routing uit voor
   twente.dev. Dit is het onomkeerbare moment; alles ervoor moet kloppen.
8. **Laat SPF met rust.** Het record heeft nu al beide includes en blijft
   slagen. De Cloudflare-include eruit halen is opruimwerk voor later, geen
   onderdeel van deze klus.

### Verifiëren voordat je het klaar noemt

```bash
dig +short twente.dev MX                      # moet Google zijn
dig +short google._domainkey.twente.dev TXT   # moet de NIEUWE waarde zijn
dig +short twente.dev TXT | grep spf          # ongewijzigd
```

Daarna, en dit is het echte bewijs:

- Stuur vanaf `ryan@twente.dev` naar mail-tester en naar een outlook-adres. Je
  wilt in de headers `dkim=pass header.d=twente.dev` **en** `spf=pass
smtp.mailfrom=twente.dev` zien. Eén van de twee is de oude situatie.
- Stuur vanaf een extern adres naar `conduct@twente.dev` en controleer dat
  **elk** groepslid hem krijgt. Dit is het meldadres dat op de gedragscodepagina
  staat; een meldadres dat niet aankomt is erger dan geen meldadres.
- Stuur vanaf een extern adres naar `hello@` en `press@`.
- Controleer dat `dmarc@` nog aankomt, want daar wijzen de rua-adressen heen.

### Terug als het misgaat

Tot stap 7 is er niets stuk: inbound loopt nog over Cloudflare. Na stap 7 is de
weg terug de MX-records herstellen en Email Routing weer aanzetten met de regels
die je vooraf hebt opgeschreven. De DKIM-sleutel is dan een nieuwe, en dat is
geen probleem zolang de TXT klopt.

## Adding a second person to `conduct@`

The organiser playbook calls this the first role to hand off, and registration opens on
14 September, so this is the near-term shape of decision 2 rather than a hypothetical.

**The trap first.** The obvious move is to add a second Cloudflare Email Routing rule for
`conduct@twente.dev` pointing at the second person. Cloudflare accepts it and the dashboard
lists both. Only one of them delivers: "If you create more than one rule with the same email
pattern, only the rule shown first in the dashboard list processes incoming emails." No
bounce, no warning, and the person who is not first never learns they are missing reports. On
a code-of-conduct address that is the worst failure available, because its symptom is silence
and silence is also what a working, never-used reporting address looks like.

Three routes that do work, cheapest first.

### A — a Google Group at webgrip.nl behind the Cloudflare rule

Create `conduct@webgrip.nl` as a Google Group with both contacts as members, then point the
existing `conduct@twente.dev` routing rule at it. Free, no MX change, reversible in a minute.

- The Group has to accept **external** senders before Cloudflare's verification mail can even
  land, and until someone clicks that link the rule stays dead: "Until a destination address
  is verified, any routing rule that points to it stays disabled." Same setting as `dmarc@`,
  same trap.
- Cloudflare rewrites the envelope (SRS) and adds an ARC seal when it forwards, so the extra
  hop authenticates at Google rather than looking like a spoof.
- What it costs: a twin address at webgrip.nl, and the archive of code-of-conduct reports
  living in a Webgrip-branded group. No reporter ever sees that, and for a project whose
  whole position is being a neutral operator rather than a Webgrip event it is still worth a
  moment's thought.

### B — MX to Google, keep the alias, let the mirror do it

Move MX (Path A below), keep the domain alias, and `conduct@twente.dev` is mirrored from the
`conduct@webgrip.nl` Group with no forwarding hop and no one-destination limit. Still leaves
the twin, and it is a real cutover: not in the week registration opens.

### C — the secondary domain (the plan above) — **chosen 2026-09-04**

The only route where `conduct@twente.dev` is a Group in its own namespace with no twin at
webgrip.nl. Groups on a secondary domain cost nothing; the licence in step 4 of that plan buys
SPF alignment, not the group. If the group is what you need and the envelope is not, that plan
works without step 4.

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
`hello@twente.dev` you create `hello@webgrip.nl` and let the mirror produce it.

**Corrected 2026-09-04.** This paragraph used to continue that `conduct@` is therefore an
alias on one person's account and cannot be a group. That is wrong: the mirror covers groups
too, in Google's words "Each mailing group also gets an email address at the user alias
domain", so a Group at `conduct@webgrip.nl` yields a multi-member `conduct@twente.dev`. What
the alias really costs is the twin, not the membership. The thing that actually stops mail
reaching two people today is that MX sits at Cloudflare, which never asks Google.

A **secondary domain** has its own namespace: `hello@`, `conduct@` and `press@` become Google
Groups directly at twente.dev, free, with no webgrip.nl twins. That is the shape this project
actually needs. Recorded here because the domain alias was chosen first and the limitation was
only discovered at the dialog.

### A brand-new user cannot sign in while 2SV is enforced

Creating `ryan@twente.dev` and then signing in fails with _"Your sign-in settings don't meet
your organization's 2-Step Verification policy"_. The account has no second factor yet,
enforcement blocks the sign-in, and the admin console says plainly that **only the user can
turn on 2-step verification**. The backup codes offered on the user's Security page do not
help; those are for an account that already has 2SV.

Two ways out: set a **New user enrollment period** on the org unit (Security → Authentication
→ 2-step verification), which is the mechanism Google built for exactly this and is timeboxed
by design, or move the user to an org unit with enforcement off, sign in, enrol, and put
enforcement back. Do not leave enforcement off: this account holds a paid licence and a public
address.

### Gmail will not send an internal From address through a custom SMTP server

This is the one that decides whether the licence buys anything.

Gmail's _Send mail as_ offers SMTP-server fields only for a From address **outside** your own
Workspace domains. The admin setting that appears to control it, Apps → Google Workspace →
Gmail → End User Access → **Allow per-user outbound gateways**, says so in its own label:
"Allow users to send mail through an external SMTP server when configuring a 'from' address
hosted outside your email domain." Turning it on changes nothing for `hello@twente.dev`,
because the moment twente.dev became a secondary domain that address became internal.

So for any address in the Workspace, Google delivers the mail and **the envelope sender is the
mailbox you pressed send in**. Not the From header, not the group, not a setting.

The consequence is concrete and it is the whole point of the migration:

| Signed in as      | From               | Envelope   | DKIM         | SPF aligned |
| ----------------- | ------------------ | ---------- | ------------ | ----------- |
| `ryan@twente.dev` | `hello@twente.dev` | twente.dev | d=twente.dev | yes         |
| `ryan@webgrip.nl` | `hello@twente.dev` | webgrip.nl | d=twente.dev | no          |

DKIM aligns either way, so DMARC passes either way. SPF alignment exists only when the mail
actually leaves from the twente.dev mailbox.

**Decided 2026-09-04: `ryan@twente.dev` is the mailbox twente.dev mail is sent from**, with
`hello@twente.dev` as the From. That is what the licence buys, and it is the only arrangement
where both DMARC checks align. Sending that same From from the webgrip.nl mailbox still
arrives, on DKIM alone, so a slip is not an outage.

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
- ~~**Drift monitoring.**~~ **Built, 2026-09-05.** `webgrip-validate-mail-auth` from
  `@webgrip/astro-site-toolkit` reads `ops/mail-auth.intent.yml`, which declares per domain what
  should be published, and `.forgejo/workflows/mail-auth-drift.yml` runs it nightly. The engine
  is shared; the intent is this site's, and webgrip.nl carries its own in its own repo. It covers
  MX, SPF, DKIM key length,
  DMARC policy and report addresses, MTA-STS, CAA and DNSSEC. Two things it does that a generic
  checker cannot: it knows `send.twente.dev` should have **no** SPF record, which ADR 0011
  decided and which any validator would call healthy; and it fails when a record is published
  while the intent file still says it is not, so the declared state cannot quietly fall behind
  the world.

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
