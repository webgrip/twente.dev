# Content

Everything in this directory is versioned, schema-validated content. The schemas live in
[`src/content.config.ts`](../content.config.ts) and run on every build — a malformed entry fails CI
before a human reviews it.

## ⚠️ The entries currently here are FIXTURES

Every company, job, event and community file in this directory is a **placeholder** written to
exercise the schemas and give the layouts something to render. The organisations are fictional
("Example Labs", "Demo Systems B.V.", "Sample Interactive").

**Delete all of them before launch.** Real entries arrive through the contribution pipeline
(`CONTRIBUTING.md`), never by inventing them. Publishing invented vacancies attributed to real
regional employers would be both misleading and a fast way to lose the community's trust — which is
the only asset this site has.

Per the plan, the jobs section does not launch publicly until **15+ genuine listings** are seeded
through direct outreach. Content lead time, not code, gates that launch.

## Layout

| Path                 | Shape                           | Notes                                           |
| -------------------- | ------------------------------- | ----------------------------------------------- |
| `posts/{nl,en}/*.md` | locale-owned documents          | translations paired by `translationKey`         |
| `events/*.yml`       | one entity, translatable fields | `start` needs an explicit UTC offset            |
| `jobs/*.yml`         | one entity, translatable fields | `validThrough` is required — drives auto-expiry |
| `companies/*.yml`    | one entity, translatable fields | referenced by jobs and events                   |
| `communities.yml`    | single file, array of entries   | each needs a unique `id`                        |

## Conventions

- **Filename is the slug.** `jobs/example-labs-senior-go.yml` → `/nl/vacatures/example-labs-senior-go`.
- **Dates carry an offset.** Write `2026-09-10T19:00:00+02:00`, not `2026-09-10 19:00`. The site
  renders everything in `Europe/Amsterdam`, but the stored value must be unambiguous.
- **Both locales are mandatory** for any `{ nl, en }` field. If you only have one language, write it
  in both slots rather than leaving one blank — an honest duplicate beats an empty page, and it is
  visible in review.
- **Never machine-translate prose without review.** For posts, shipping a single language plus the
  "only available in …" notice is the correct outcome.
