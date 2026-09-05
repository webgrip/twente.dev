# Deliberate non-actions

Things this project has decided **not** to do. Recording the decision is the deliverable: the
next person who feels the itch finds the reasoning here instead of re-doing the debate — and a
non-action stops being deliberate the moment its reasons no longer hold, so each entry carries
its date and its source.

| Non-action                                                | Since      | Reasoning lives in                                                                                                                                                                        |
| --------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No cache-purge automation for `/brand/*` after a rollback | 2026-09-03 | [`docs/runbooks/rollback.md`](runbooks/rollback.md) — a day of stale brand assets is acceptable; purge by hand when it truly matters                                                      |
| No `i18n` block in the sitemap integration                | 2026-08    | `astro.config.mjs` — prefix-swapping cannot express localized route segments; partial hreflang annotations are worse than none                                                            |
| No per-page OG images as the default                      | 2026-08-30 | `src/components/BaseHead.astro` — a shared preview cannot be recalled; the evergreen banner is doctrine, per-page images are an opt-in (VIK-692)                                          |
| The nginx parity container stays despite `wrangler dev`   | 2026-08    | [`docs/adrs/0007`](adrs/) — no-local-Node contributors and header-drift testing in CI need it                                                                                             |
| Preview deploys do not wait for Lighthouse/axe            | 2026-08    | `.forgejo/workflows/on_source_change.yml` — reviewsnelheid; only production is gated                                                                                                      |
| No CRM software for outreach                              | 2026-08    | outreach tracker is one spreadsheet by design; deletion on request must stay trivial                                                                                                      |
| No DNS edits in the Cloudflare dashboard                  | 2026-09-05 | [ADR 0018](adrs/0018-account-and-zone-resources-in-opentofu.md) — the zone is OpenTofu in `webgrip/cloudflare`; a hand edit shows as drift the next morning and the next apply reverts it |
