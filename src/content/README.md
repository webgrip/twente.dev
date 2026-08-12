# Content

Everything in this directory is versioned, schema-validated content. The schemas live in
[`src/content.config.ts`](../content.config.ts) and run on every build — a malformed entry fails CI
before a human reviews it.

## No fictional content — and CI now enforces it

The fixtures are gone (deleted 2026-08-12): three fictional companies and two fictional events
that existed to exercise the schemas and give the layouts something to render. What remains is
real — the /001 edition entry, the 12 verified communities, and the posts.

**CI will not let them come back.** The content-validation job runs with
`REQUIRE_REAL_CONTENT=1`, which turns the fixture check in `scripts/validate-content.ts` from a
warning into a hard failure. Anything carrying `fixture: true` fails the build.

That field is the mechanism, not the `# FIXTURE` comment — comments do not survive into the build,
the schema field does. If you genuinely need scratch data while developing a layout, keep it
out of a commit; do not reach for the flag to get a PR green.

Real entries arrive through the contribution pipeline (`CONTRIBUTING.md`), never by inventing them.
Publishing invented listings attributed to real regional organisations would be both misleading and
a fast way to lose the community's trust — which is the only asset this site has.

> `companies/` currently has no entries and the directory pages are placeholders pending the
> decision recorded on VIK-683. A zero-entry collection is valid — `validate:content` reports
> "checked 0 companies" and the build succeeds.

## Layout

| Path                 | Shape                           | Notes                                   |
| -------------------- | ------------------------------- | --------------------------------------- |
| `posts/{nl,en}/*.md` | locale-owned documents          | translations paired by `translationKey` |
| `events/*.yml`       | one entity, translatable fields | `start` needs an explicit UTC offset    |
| `companies/*.yml`    | one entity, translatable fields | referenced by events                    |
| `communities.yml`    | single file, array of entries   | each needs a unique `id`                |

## Conventions

- **Filename is the slug.** `events/frontend-avond-hengelo.yml` → `/nl/events/frontend-avond-hengelo`.
- **Dates carry an offset.** Write `2026-09-10T19:00:00+02:00`, not `2026-09-10 19:00`. The site
  renders everything in `Europe/Amsterdam`, but the stored value must be unambiguous.
- **Both locales are mandatory** for any `{ nl, en }` field. If you only have one language, write it
  in both slots rather than leaving one blank — an honest duplicate beats an empty page, and it is
  visible in review.
- **Never machine-translate prose without review.** For posts, shipping a single language plus the
  "only available in …" notice is the correct outcome.
- **Venue names are proper nouns.** `venue.name` cannot be localized, so keep it to the venue's
  actual name — no descriptive words like "kantoor"/"office". Leave it out entirely while the
  venue is unknown; templates render the localized "Locatie volgt" / "Venue to be announced".
- **Bump `updatedAt` on events when a fact changes.** It drives `SEQUENCE`/`LAST-MODIFIED` in the
  ICS feed — without a bump, Outlook subscribers never see the edit (including cancellations).
