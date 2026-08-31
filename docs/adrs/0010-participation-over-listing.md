# ADR 0010 – Participation over listing: consent-gated communities, a companies page that asks, pretalx for the open call

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-31
- **Tags**: Product, Content, Trust & Safety, External services
- **Version**: 1.0.0

---

## Context and Problem Statement

[ADR 0009](0009-lean-launch-remove-job-board.md) reduced `/bedrijven` and `/communities` to short
placeholders "pending a post-launch decision", and deferred whether the directory returns at all
until "there is event data to argue from". Six weeks before /001 that deferral had produced three
problems that are not about launch scope:

1. **A published promise with nothing enforcing it.** `/nl/partners` says, verbatim and in public,
   _"We zetten je er niet op zonder te vragen"_ — we do not list you without asking. Every
   researched, verified group sits in `src/content/communities.yml` already. Nothing in the code
   stopped them being published; the only thing that had stopped it was that nobody had built the
   page yet. `scripts/validate-commitments.ts` protects the sentence on the partners page and is
   blind to the behaviour it describes.
2. **A placeholder advertising something that may never exist.** `/bedrijven` read "Hier komt de
   bedrijvengids" while ADR 0009 had already deferred that directory indefinitely, and ADR 0009's
   own consequences section flagged the matching loose end: the `submit-company` issue form
   "still invites contributions into a placeholder".
3. **No route for the thing the edition actually needs.** /001 needs two speakers and a room. The
   site asked for neither: the open call existed as a blog post, and the contribute page was two
   paragraphs pointing at a mailbox.

A review on 2026-08-31 (Ryan) added a fourth: the homepage promised _outcomes_ — "one useful idea,
one useful introduction, one reason to return" — which are not ours to deliver, and which said
nothing about what the site is.

## Decision Drivers

| #   | Driver                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------- |
| 1   | A promise made to third parties in public must be enforced by the code, not by whoever remembers it      |
| 2   | An empty directory must explain itself, or it reads as neglect (ADR 0009 driver 3, restated)             |
| 3   | Nothing may be added that has to be _operated_: no backend, no new processor, no new secret, no new bill |
| 4   | The scarce input before /001 is speakers and a room — the surfaces should ask for those, in those words  |
| 5   | Money introduces obligations (invoicing, accounting, a refund story) that nothing yet needs              |

## Considered Options

**Community listings**: publish the verified list now with an opt-out · publish nothing until the
page is redesigned · gate each entry on recorded consent.

**`/bedrijven`**: keep the directory placeholder · delete the page · reframe it to participation.

**Talk submissions**: mailto only · a home-grown form · a Forgejo issue template · pretalx.

**Money**: Stripe payment link with iDEAL · Open Collective · IBAN and invoice only · no route yet.

**Contribution forms**: Worker endpoint writing Forgejo issues · a hosted form service (Tally,
Formspree) · a form that composes an e-mail client-side · plain mailto links.

## Decision Outcome

### Chosen Option

**Every public surface asks people to take part; nothing lists anyone who has not agreed to it.**
Concretely, as shipped:

- **`consent` is now a field on the communities schema**, defaulting to `{ granted: false }`, and
  `getCommunities()` filters on it. `granted: true` requires `evidence` and `at` alongside it, so
  the claim is checkable by someone who was not in the conversation. The researched entries
  stay in the file, unpublished, which makes the research safe to do and safe to review. The
  directory ships with search and a topic filter, and an empty state that names the number of groups
  waiting on their answer rather than pretending none exist.
- **`/bedrijven` and `/companies` become participation pages**, ordered by what an edition actually
  needs: host a room, send your people on work time, put someone through the open call, bring a
  demo, give something in kind. They carry an explicit list of what sponsorship does _not_ buy
  (attendee data, speaking time, editorial influence, exclusivity) and state plainly that there is
  no company directory and why.
- **Talks go to pretalx when the call outgrows e-mail.** `PRETALX_CFP_URL` is `null` today and the
  page renders the e-mail route; hosted pretalx is free until an event is made public and offers up
  to 25% off for volunteer-run non-profit events. It is not opened yet because two slots do not need
  a review workflow.
- **No payment route before /001.** In-kind first, a conversation for anything else, and a public
  financial summary after the edition.
- **Contribution forms compose an e-mail in the visitor's own client.** The CSP sets
  `form-action 'self'`, so a `<form action="mailto:…">` is blocked; the server therefore renders the
  questions as a checklist next to a prefilled `mailto:` link and the script swaps in the real form,
  so no control on the page ever silently drops what someone typed.
- **The homepage states what twente.dev does** — the shared calendar, the evening with no field, the
  archive — instead of promising outcomes, and the flagship appears once rather than twice.

### Rejected options and why

- **Publish the verified list now with a visible opt-out.** This is normal directory practice and it
  is not available to us: the non-compete language on `/partners` went verbatim into outreach to the
  region's organisers. Rewriting the promise to match the behaviour we wanted would be the wrong way
  round.
- **Delete `/bedrijven`.** The page has the second-highest B2B intent on the site. The problem was
  never that it existed, only that it promised a directory.
- **A Worker endpoint writing Forgejo issues.** Architecturally attractive — it keeps contributions
  as data (ADR 0005) and needs no e-mail, which matters while VIK-798 blocks outbound mail. Rejected
  for now on driver 3: a bot token in SOPS, spam handling, and a POST route on a site that is
  otherwise wholly static, to serve a handful of submissions per edition. Revisit when the volume
  makes a mailbox the bottleneck.
- **A hosted form service.** Fastest to build, and it puts a processor between a contributor and us
  for exactly the conversations where that is least welcome: privacy page, LIA and CSP all change.
- **Stripe or Open Collective.** Both are reasonable the day there is something to fund. Neither is
  reasonable while the honest answer to "what do you need" is a room and forty sandwiches.

### Consequences

**Good**

- The listing promise is now structural: a new entry added through any route is invisible until
  consent is recorded. It cannot be broken by forgetting.
- Research and publication are decoupled, so the directory can be built out in the open before a
  single group has replied.
- No new service, secret, processor or recurring cost. `pnpm build` still validates CSP and the
  partner compact, and both pass.

**Bad**

- The directory ships close to empty, and stays that way until outreach lands. That is the intended
  cost of driver 1, but it is a real cost: the page is weakest exactly when the site is newest.
- The open call runs through a mailbox until pretalx is opened, so proposals have no availability
  field and no review trail. Acceptable at two slots; it does not scale to /003.
- Contribution forms depend on a working `mailto:` handler. Webmail-only visitors get the checklist
  path, which is honest but clumsy.
- ADR 0009's deferral of the _company directory_ still stands and is now stated on the page itself,
  so the question returns after /001 rather than being closed here.

## Confirmation

- `pnpm build` passes, including `validate:csp` and `validate:commitments` (12 commitments intact
  across both locales).
- `getCollection('communities')` in `getCommunities()` filters on `consent.granted`; with no entry
  carrying consent, `/nl/communities` and `/en/communities` render the empty state and no group name.
- `grep -rn "bedrijvengids\|company directory" src/pages/` returns only the paragraphs that say it
  does not exist.
- `PRETALX_CFP_URL === null` renders the e-mail route on `/nl/bijdragen` and `/en/contribute`.
