# ADR 0017 – Generated mail reaches Brevo as a draft, and a human sends it

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-04
- **Tags**: Mail, Automation, Content
- **Version**: 1.0.0

---

## Context and Problem Statement

[ADR 0011](0011-brevo-for-machine-sent-mail.md) put every machine-sent mail on Brevo from
`send.twente.dev`. It said nothing about how the HTML gets into Brevo, and the answer was a
human pasting a hand-filled template into the campaign editor.

That answer failed on 2026-09-04. A campaign carried a link that returned 404 from Brevo's
own redirector while every destination on `twente.dev` returned 200. The cause was a template
placeholder, `⟦https://twente.dev/nl/001⟧`, that survived the paste: Brevo rewrote it into a
tracking link with no usable destination. Nothing in the path from template to inbox could
have caught it, because the path had no machine in it.

`ae9f199` replaced the hand-filling with `pnpm mail`, which generates the HTML from the
content that is already in the repository. The paste remained. So did two smaller costs: the
subject and the preheader are retyped into Brevo by hand, and the campaign editor is free to
rewrite pasted HTML.

The question this record answers is where the automation stops.

## Decision Drivers

- A send cannot be undone. Every other step in the pipeline can.
- Mail from this project goes out under a person's name, and that person reads it first.
- The editor is the least trustworthy link in the chain and the easiest one to remove.
- An API key that can send mail to the whole list is a different blast radius from one that
  can write a draft.

## Considered Options

- Create and update a draft over the API; a human opens it and sends it.
- Keep the copy-paste and add a preflight check to the generator.
- Automate the send too, gated on a schedule or a commit.

## Decision Outcome

### Chosen Option

**`pnpm mail:draft <id> [locale]` writes a draft into Brevo and stops.** `POST
/v3/emailCampaigns` creates a campaign in draft status by default and accepts `htmlContent`
inline; `GET /v3/emailCampaigns` finds an existing campaign back by name so a re-run updates
through `PUT /v3/emailCampaigns/{id}` instead of stacking drafts. The subject and the
preheader travel with the payload rather than being retyped.

**No script in this repository calls the send path.** `POST
/v3/emailCampaigns/{id}/sendNow` and the campaign status endpoint are out of scope, not
merely unused. The draft is opened in Brevo, read, and sent by a person.

**The key stays out of the repository and out of CI.** `BREVO_API_KEY` is read from the
environment, the same route `VIKUNJA_API_TOKEN` already takes: held in the Keychain and
exported into the shell. It is deliberately not a Forgejo secret, because a scheduled job
holding a mail-sending credential is a standing risk in exchange for saving a command.

CI gets the half that carries no credential: `pnpm mail --all` renders every mail on every
push, and fails on a placeholder, a render error or a generated link that does not resolve.
That is the check that would have caught the 404 before it reached an inbox.

### Rejected options and why

- **Copy-paste with a preflight check.** The generator already refuses to emit a `⟦…⟧`, so the
  specific failure is closed either way. It leaves the editor in the path, and the editor is
  what rewrites pasted HTML, so the class of failure stays open.
- **Automate the send.** It removes the only step where a person reads the mail as a reader.
  The cost of the manual step is one click a month; the cost of an unreviewed send to the
  whole list is not recoverable.

### Consequences

- Good, because the campaign editor never touches the HTML, which closes the class of failure
  that produced the 404, not just the instance.
- Good, because the subject and the preheader stop being retyped, which is where a mismatch
  between the tested artefact and the sent one would otherwise creep in.
- Good, because re-running is idempotent: the draft is updated, so a correction does not leave
  a stale twin in the campaign list.
- Bad, because it adds a credential to the local environment, and a key that can create
  campaigns can also read the contact list.
- Bad, because a draft created by a script is a draft nobody remembers creating. The command
  prints the campaign URL for that reason.
- Neutral, because the hand-made templates in `docs/brand/templates/` stay the route for the
  mails that do not come from content: the double opt-in, the welcome and the transactional
  ones.

## Confirmation

- `grep -rn "sendNow\|emailCampaigns/.*/status" scripts src` returns nothing.
- `pnpm mail:draft` without `BREVO_API_KEY` set exits non-zero and names the variable, rather
  than failing somewhere inside an HTTP call.
- A campaign created by the command shows as **Draft** in Brevo, and running the same command
  twice leaves one campaign, not two.
- The source-change workflow runs `pnpm mail --all` and fails the build on a placeholder or an
  unresolvable link.

## More Information

- 2026-09-04 — a campaign pasted from `email-announcement.html` shipped a `⟦…⟧` placeholder;
  Brevo's redirector returned 404 for that link while every destination resolved.
- 2026-09-04 — `pnpm mail` generated the first mails from content (`ae9f199`), and refuses to
  emit a placeholder.
- Refines [ADR 0011](0011-brevo-for-machine-sent-mail.md), which stays Accepted: the platform
  decision holds, this record only settles how content reaches it.
- Supported by [ADR 0016](0016-release-as-content.md), which is what lets the generator
  announce any Release rather than only the current one.
