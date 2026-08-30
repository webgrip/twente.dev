# Legitimate Interest Assessment — outreach to regional organisations

**Controller**: twente.dev (Ryan Grippeling, trading as Webgrip; an independent stichting is
in formation).
**Processing**: one-to-one email contact with community organisers, educational
institutions, municipalities, ecosystem bodies, employers and venues in Twente, to
introduce twente.dev, ask permission to list a community, request advice, and invite
participation in `twente.dev/001`.
**Legal basis**: Article 6(1)(f) GDPR — legitimate interests.
**Date**: 2026-08-30 · **Review**: after the first outreach wave, or on any complaint.

This is the three-step assessment required by [EDPB Guidelines
1/2024](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202401_legitimateinterest_en.pdf).
It is short on purpose; the processing is small.

---

## 1. Purpose test — is the interest legitimate?

Yes. twente.dev is a non-commercial community initiative that makes local technology
events, communities and knowledge easier to find in a region where they are fragmented. It
cannot function without contacting the organisations it intends to list, credit and
collaborate with. Listing a community _without_ contacting it first would be the worse
outcome for the people concerned — consent-before-publication is precisely what this
outreach exists to obtain.

Recital 47 GDPR expressly contemplates direct marketing as a possible legitimate interest.
The Dutch AP's 2019 _normuitleg_ argued that a purely commercial interest cannot qualify;
the CJEU in **KNLTB (C-621/22, October 2024)** confirmed that a commercial interest can.
The interest here is not commercial at all — no product is sold and no revenue results —
which puts it on stronger ground than the case the CJEU already accepted.

Third-party and public interests also served: the communities gain free visibility and a
calendar feed they own; the region gains a shared directory that does not exist today.

## 2. Necessity test — is the processing necessary?

Yes, and it is minimal.

- **Could the purpose be achieved another way?** No. There is no route to asking an
  organisation for permission to list it, or for advice, that does not involve contacting
  that organisation.
- **Data collected**: organisation, contact name and role, the published contact address,
  the source URL it came from, date of contact, outcome, objection flag. Nothing else. No
  enrichment, no profiling, no inferred attributes.
- **Sources**: only contact details the organisation itself has published for the purpose of
  being contacted — a contact page, an `info@`/`bestuur@`/`extern@` address, a board page.
  **No guessed addresses** (`firstname.lastname@`), no purchased lists, no enrichment
  services, no scraped personal accounts.
- **Volume**: roughly 70 organisations, individually written, sent by hand. This is
  individual business correspondence, not a campaign.

## 3. Balancing test — do the individual's rights override the interest?

**Reasonable expectations.** The people contacted hold a public-facing role — organiser,
external-relations officer, communications lead — and have published a contact address
_for that role_. Being contacted about a regional technology community is squarely within
what they would expect at that address. Contact is in a professional capacity, not a
private one.

**Impact.** Low. One email, in a professional inbox, on a subject relevant to the
recipient's stated role. No profiling, no automated decision-making, no special-category
data, no children's data, no data sharing, no international transfer beyond the EU-hosted
mail provider.

**Mitigations applied.**

| Risk                             | Mitigation                                                                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unwanted contact                 | **Two touches maximum** to anyone who does not reply, then stop. Immediate stop on an explicit no.                                                                                                   |
| Not knowing where data came from | Every first email names the source and links the privacy notice — the Article 14 disclosure, delivered at the time of first communication as art. 14(3)(b) requires.                                 |
| Difficulty objecting             | _"Reply 'stop' and it won't happen again"_ on its own line in every message, as art. 21(4) requires it be presented explicitly and separately. Objection is honoured immediately, without balancing. |
| Data lingering                   | Non-responders deleted 12 months after last contact. Suppression list (email + objection date only) kept indefinitely, because deleting it would cause re-contact — the actual harm.                 |
| Exposure                         | Contact data is held encrypted (SOPS + age) **outside** the public site repository. Committing it would make erasure unenforceable against git history, clones and mirrors.                          |

**Purpose limitation.** Being contacted never results in a newsletter subscription. The
newsletter is separate, double opt-in, with its own consent record.

**Conclusion**: the interest is legitimate, the processing is necessary and minimal, and
with the mitigations above it does not override the rights and freedoms of the people
contacted. **Article 6(1)(f) is available.**

---

## Note on the other regime

GDPR is only half of it. **Telecommunicatiewet art. 11.7** separately governs whether the
message may be sent at all, and it covers _"commerciële, **ideële** of charitatieve
doeleinden"_ alike — being a community project is not an exemption. The exemption relied on
is **art. 11.7 lid 2**: contact with a legal person, or a natural person acting
professionally, using electronic contact details _"door hen daarvoor bestemd en
bekendgemaakt"_ and used in line with the purpose they were published for.

That is why the "published address only, never a guessed one" rule above is not merely good
manners — it is the condition the exemption depends on. Art. 11.7 lid 4 additionally
requires every message to carry the sender's real identity and a valid postal address for
stop requests.
