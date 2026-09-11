# Licence policy

What this repository ships under, what it is allowed to depend on, and what happens when that
changes. Enforced by `pnpm run licenses:bundle`, which runs inside `pnpm run build` — a violation
fails the build, it does not warn.

## What we ship under

Apache-2.0. See [ADR](adrs/README.md) and [`LICENSE`](../LICENSE).

## Third-party licences we may distribute

A dependency whose licence is on this list may end up in `dist/` and reach a visitor's browser:

```
MIT   ISC   Apache-2.0   BSD-2-Clause   BSD-3-Clause   0BSD
BlueOak-1.0.0   CC0-1.0   Python-2.0   OFL-1.1   Unlicense
```

Every one of them is permissive and attribution-only. The attribution is not optional: every
production dependency's licence text is reproduced into
[`dist/third-party-licenses.txt`](../scripts/third-party-licenses.mjs) at build time, and that file
is served with the site.

**Inter and IBM Plex Mono matter most here.** They are SIL OFL-1.1, they are the one third-party thing that
actually ships to a browser as a file, and the OFL requires its text to travel with the font. It
does, in that generated file. Before this policy existed, it did not.

## Third-party licences allowed **build-time only**

```
MPL-2.0              lightningcss     (a hard dependency of vite)
LGPL-3.0-or-later    sharp's libvips  (a hard dependency of astro)
```

Both are weak copyleft. Neither obligation triggers here, because both obligations attach on
**distributing** or **conveying** the library, and we do neither — they run on a build machine to
produce output, and the output is ours. Neither can be removed without leaving Astro: they are hard
dependencies of the framework, not choices. (As it happens this site does not use image
optimisation at all, so `sharp` is installed and never invoked.)

**This exception is conditional and it is checked.** The build fails if anything from those
packages appears in `dist/` — any `.node`, `.dylib`, `.so` or `.dll`, or any filename matching
`libvips` or `lightningcss`. If that check ever fires, the exception no longer applies and the
situation needs a new decision, not a wider allowlist.

## Anything else

A dependency introducing a licence on neither list **fails the build** with the SPDX identifier and
the package that brought it in. Resolve it by removing the dependency, replacing it, or adding the
licence to a list here — deliberately, in a commit that says why, and in an ADR if it is a
copyleft licence.

## Where this is enforced

| Check | Command | What it covers |
|---|---|---|
| Third-party licences | `pnpm run licenses:bundle` | allowlist, attribution file, build-time-only assertion |
| Our own licence surface | `pnpm run license:check` | LICENSE, copyright line, NOTICE, inbound terms, manifest, image label |
| Per-file licensing | `pnpm run license:reuse` | [REUSE](https://reuse.software/spec-3.3/) 3.3 compliance |

The first runs inside `pnpm run build`. All three run in `just check` and in CI.
