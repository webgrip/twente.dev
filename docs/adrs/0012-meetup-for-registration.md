# ADR 0012 – Registration runs on Meetup, the site stays the record

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-02
- **Tags**: External services, Product, Event ops
- **Version**: 1.0.0

---

## Context and Problem Statement

Registration for /001 has been re-decided twice. pretix was dropped on 2026-08-30 — a ticketing
platform is more administration than it solves at 35 seats — and replaced by a mailto to `hello@`
plus a hand-kept list and waitlist. `REGISTRATION_URL` was designed to hold that mailto, and
[the playbook alignment](../plan/playbook-alignment.md) still records "registration opens 2 September"
against it.

That reasoning was sound and answered the wrong question. Registration mechanics are not the
scarce input before a first release; **an audience is**. A mailto handles forty people perfectly
and introduces the release to nobody. The region's developers already gather on meetup.com —
[the organiser playbook](../organiser-playbook.md) lists Agile Meetup Twente, Flutter
Twente/Baseflow and DevSessions Zwolle there — and those are precisely the people who will never
find twente.dev on their own before 7 October.

The venue is also not neutral here: /001 is hosted by Code14, and the release is advertised as an
independent community evening. Whatever carries the registration has to leave that framing intact.

## Decision Drivers

| #   | Driver                                                                                        |
| --- | --------------------------------------------------------------------------------------------- |
| 1   | Reach is the scarce input before /001; registration mechanics are not                         |
| 2   | Nothing that has to be _operated_ — one person, no backend, no new secret                     |
| 3   | twente.dev stays the canonical record of the release (ADR 0008), whatever handles the RSVP    |
| 4   | The published safeguards hold: no attendee data to sponsors, no paid speaking, no exclusivity |
| 5   | Cost must be bounded and stoppable, because there is no entity and no bookkeeping             |

## Considered Options

mailto plus a hand-kept list (the standing decision) · Meetup · Luma · pretix · Eventbrite.

## Decision Outcome

### Chosen Option

**Meetup carries registration for /001 and /002. twente.dev stays the record.**

- **The group is located in Enschede**, not in the host's town. Meetup's location determines the
  discovery radius, and the community is regional while the room changes every release.
- **Six months up front** (~$99.99) rather than monthly (~$29.99). Cheaper, and the commitment
  already spans both releases Code14 has offered to host.
- **The Meetup event links to `twente.dev/nl/001`**, which stays the page that describes the
  release. The ICS feed remains the subscribable record, so nothing about the archive moves.
- **Dietary and access needs are collected as RSVP questions**, which is where they were going to
  be asked anyway — the mailto route asked the same three things by hand.
- **The waitlist is on, and registrations are accepted above seated capacity.** Free evenings
  no-show heavily; the exact overbooking factor is an open question put to an experienced organiser
  in the Code14 call briefing (`docs/plan/code14-call-briefing.md`, which is not part of the
  published docs site).

We are buying distribution, not software. The RSVP handling is a side effect of the thing being
paid for.

### Rejected options and why

- **mailto plus a hand-kept list.** Works at this size and costs nothing, which is why it was
  chosen on 2026-08-30. It fails driver 1 completely: it cannot introduce the release to a single
  person who does not already know the site exists.
- **Luma.** The better product, and free. Rejected because its audience is a startup-event scene
  that barely exists in Twente — it would mean paying nothing for software we do not need while
  skipping the reach we do.
- **pretix.** Already rejected on 2026-08-30 and nothing has changed: it is ticketing for a free
  evening.
- **Eventbrite.** Ticketing plus fees plus a processor, with weaker local discovery than Meetup.

### Consequences

**Good**

- The release becomes visible to people who attend developer events in Twente and have never heard
  of twente.dev. That is the only channel available before /001 that does not depend on outreach
  landing first.
- Waitlist, reminders and check-in are handled, which removes the hand-kept list and the follow-up
  mail it implied.
- The Meetup covers already exist — `banner-meetup-1200x675@2x.png` and the `-001-` variant were
  rendered from the brand templates before this decision was taken.

**Bad**

- **A US processor now holds attendee data.** Both privacy pages currently say event registration
  runs by e-mail with "no ticketing platform in between", and that sentence becomes false. It has to
  change in both locales, and Meetup joins the processor list.
- The safeguard "sponsors never receive attendee data" now depends partly on Meetup's own export
  and organiser permissions, not only on our restraint. Code14 is a host, not an organiser, and must
  not be given organiser rights on the group.
- [The partner compact](../partner-compact.md) says "Het is geen meetup." That is positioning, not
  platform, but the two will be read side by side. It needs one sentence that names the difference.
- A recurring cost on a project that had none. Bounded by being prepaid per six months, and
  stoppable.
- RSVP is not attendance. Overbooking becomes a judgement call every release, and getting it wrong
  is visible in the room either way.

## Confirmation

- `REGISTRATION_URL` in `src/config/site.ts` points at the Meetup event, so `/nl/001` renders the
  register button instead of the "registration opens 2 September" state.
- `MEETUP_GROUP_URL` in `src/config/site.ts` carries the group URL, so `/nl/001` links to Meetup
  before the event exists; the button switches to the event once `REGISTRATION_URL` is set.
- The Meetup event description links to `twente.dev/nl/001`, and `/nl/events` plus the ICS feed
  still carry the release — the site remains the record, not the mirror.
- Both privacy pages name Meetup as a processor for event registration, and
  `grep -rn "geen ticketingplatform\|no ticketing platform" src/pages/` returns nothing.
- Code14 holds no organiser role on the Meetup group.

## More Information

- 2026-08-30 — pretix dropped; registration decided as a mailto plus a hand-kept list.
- 2026-09-02 — Meetup accepted for /001 and /002; the mailto route retired before it ever opened.
- 2026-09-04 — bought as **one year for EUR 99**, not the six months at ~$99.99 costed above.
  Cheaper per month and it spans /001 through roughly /012, but it also means the "bounded and
  stoppable" consequence now has a twelve-month floor rather than six.
- 2026-09-04 — registration opens **14 September 2026**, four weeks before the old date and
  seven before the new one. The open call and the newsletter run ahead of it deliberately, so
  the release has an audience before it has a ticket.
- 2026-09-05 — the release page links the Meetup group (`MEETUP_GROUP_URL`,
  `meetup.com/twente-dev`) ahead of registration opening, next to a venue map with directions.
- Superseded by nothing yet. The question returns after /002, when there is attendance data to
  argue from and the venue rotation makes the group's location worth revisiting.
