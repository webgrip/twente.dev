# ADR 0016 – A Release is a content entry, not a config constant

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-04
- **Tags**: Content, Routing, Scaling
- **Version**: 1.0.0

---

## Context and Problem Statement

[ADR 0014](0014-monthly-editions-and-the-language-that-follows.md) fixed the cadence at one
evening on the first Wednesday of every month. That is twelve Releases a year, and
`twente.dev/085` is a date, not a hypothetical.

Release 001 is not stored in one place. Its facts live in `RELEASE_001` in
[`src/config/site.ts`](../../src/config/site.ts), its calendar record lives in
[`src/content/events/twente-dev-001-reconnect.yml`](../../src/content/events/twente-dev-001-reconnect.yml),
and the two are held together by a test in [`src/lib/claims.test.ts`](../../src/lib/claims.test.ts)
that asserts they agree. On top of that the number is baked into the routing layer: the route
key is `release001`, and `src/pages/001.astro`, `src/pages/nl/001.astro` and
`src/pages/en/001.astro` are three files that exist only because the number is 001.

Counted out, one more Release costs a new route key, a new config constant, three new page
files, an edit to `scripts/sync-editie.mjs`, an edit to `src/lib/jsonld.ts` where
`canonicalRoute === 'release001'` is written out, and a second entry that has to agree with
the first. At 085 that is 255 page files and 85 route keys, and a duplication guard that has
to be re-pointed every month.

The mail generator added in `ae9f199` exposed the same seam from the other side: its speaker
source is the module-level `RELEASE_001_SPEAKERS`, so it can only ever announce speakers for
one Release.

## Decision Drivers

- The cadence is monthly and committed, so per-Release cost compounds twelve times a year.
- The same fact must not be stored twice. A test that guards agreement between two copies is
  a symptom, not a solution.
- Contributions already arrive as versioned data ([ADR 0005](0005-contributions-as-data.md)),
  and a Release is the most editorial thing on the site.
- The public URLs `/nl/001` and `/en/001` were ratified in
  [ADR 0015](0015-release-vocabulary.md) and must survive unchanged.

## Considered Options

- The Release lives on its own event entry, as an optional `release` block.
- A separate `releases` collection alongside `events`.
- Keep the config constants and scaffold the per-Release page files with a generator.

## Decision Outcome

### Chosen Option

**The event entry is the Release.** The `events` collection gains an optional `release`
object carrying what only our own evenings have: `number`, `theme`, `capacity`, and
`speakers[]`. An entry that has it is a Release; an entry that does not is a listing someone
else runs.

Three things follow from that.

**One dynamic route per locale.** `src/pages/nl/[release].astro` and
`src/pages/en/[release].astro` take their paths from `getStaticPaths()` over the entries that
carry a `release` block. Two files, for every Release there will ever be. The route key
`release001` becomes a single `release` key with a slug, exactly as `blog` already works, so
the URL is built as `routePath('release', locale, '001')` and `/nl/001` keeps resolving.

**`site.ts` keeps a pointer, not facts.** `RELEASE_001` and `RELEASE_001_SPEAKERS` are
replaced by `CURRENT_RELEASE = '001'`. Everything that needs the current evening resolves it
through the collection, including `scripts/sync-editie.mjs` for the banners and the mail
generator for the speaker announcement.

**The agreement test goes away rather than being re-pointed.** With one entry there is
nothing left to disagree. The `literal release fact` rule in `claims.test.ts` keeps working,
sourced from the resolved current Release instead of from a constant.

### Rejected options and why

- **A separate `releases` collection.** Cleaner on paper, and wrong in practice: a Release
  must appear in the events index, the ICS feed and the event JSON-LD like any other evening.
  A second collection means every one of those readers has to concatenate two sources and
  keep them sorted together, and the release entry would still have to carry the calendar
  fields, which is the duplication this ADR removes.
- **Scaffold the page files.** It makes the cost per Release cheap without making it zero, and
  it leaves 255 near-identical files in the repository for a human to read past. A generated
  file that nobody edits is a dynamic route with extra steps.

### Consequences

- Good, because a Release is added by writing one YAML file, which is the same act as adding
  any other content and needs no code change.
- Good, because the duplication between `site.ts` and the events entry disappears, and with
  it the test that existed to police it.
- Good, because the mail generator can announce a speaker for any Release without knowing
  which one is current.
- Bad, because `RouteKey` loses a compile-time guarantee: `routePath('release001', locale)`
  used to fail typecheck on a typo, and `routePath('release', locale, '002')` cannot catch a
  Release number that does not exist. A build-time check over the collection replaces it.
- Bad, because it touches the routing layer, the JSON-LD, the banner script and the claims
  guard in one change, right after the Release rename in `98c56ed` touched many of the same
  files.
- Neutral, because `/nl/001` and `/en/001` are unchanged, so nothing already shared breaks.

## Confirmation

- `pnpm build` emits `/nl/001` and `/en/001` from `getStaticPaths()`, and
  `src/pages/nl/001.astro` and `src/pages/en/001.astro` no longer exist.
- `grep -rn "RELEASE_001" src scripts` returns nothing; `CURRENT_RELEASE` is the only pointer.
- `grep -rn "release001" src` returns nothing, and `ROUTES` carries a single `release` key.
- `pnpm test` passes, with the claims guard building its literals from the resolved current
  Release rather than from a constant.
- Adding a second entry with a `release` block produces `/nl/002` and `/en/002` with no other
  edit, which is the whole point and is worth verifying once rather than assuming.

## More Information

- 2026-09-04 — monthly cadence fixed in [ADR 0014](0014-monthly-editions-and-the-language-that-follows.md),
  which is what makes the per-Release cost compound.
- 2026-09-04 — the vocabulary rename in `98c56ed` moved `EDITION_001` to `RELEASE_001` and
  `edition001` to `release001` without changing the shape this ADR is about.
- 2026-09-04 — the mail generator landed in `ae9f199` and inherited the single-Release
  limitation through `RELEASE_001_SPEAKERS`.
- 2026-09-04 — landed. Two things were removed that the record did not anticipate. The
  `canonicalRoute` field disappeared from the events schema, because it existed only to mark
  our own evening and the `release` block now does that. And the four call sites that spelled
  out "the canonical path of an event" collapsed into `eventPath()` in `src/lib/content.ts`,
  used by the event card, the ICS and RSS feeds, the JSON-LD and the event detail routes.
  Reading a release off disk for the node scripts lives in `scripts/read-releases.ts`, shared
  by the banner generator and the mail generator.
- Refines [ADR 0005](0005-contributions-as-data.md): a Release is versioned data like every
  other contribution.
- Supported by [ADR 0017](0017-mail-reaches-brevo-as-a-draft.md), whose generator reads the
  collection this ADR creates.
