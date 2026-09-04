# Architecture Decision Records

MADR 4.0.0, matching the `webgrip/workflows` convention. New records use
[`0000-template.md`](0000-template.md).

| #                                                              | Decision                                                       | Status   | Date       |
| -------------------------------------------------------------- | -------------------------------------------------------------- | -------- | ---------- |
| [0001](0001-astro-as-site-framework.md)                        | Astro as the site framework                                    | Accepted | 2026-08-03 |
| [0002](0002-cloudflare-workers-static-assets.md)               | Cloudflare Workers Static Assets over Pages                    | Accepted | 2026-08-03 |
| [0003](0003-forgejo-as-ci-and-release-authority.md)            | Forgejo is the sole CI/CD and release authority                | Accepted | 2026-08-03 |
| [0004](0004-locale-strategy.md)                                | Explicit locale prefixes with localized route segments         | Accepted | 2026-08-03 |
| [0005](0005-contributions-as-data.md)                          | Community contributions are versioned data                     | Accepted | 2026-08-03 |
| [0006](0006-privacy-first-analytics.md)                        | Privacy-first analytics, no cookie banner                      | Accepted | 2026-08-03 |
| [0007](0007-container-for-dev-and-parity.md)                   | Container for dev and production parity, not deploy            | Accepted | 2026-08-04 |
| [0008](0008-playbook-first-launch-scope.md)                    | Launch scope follows the strategy playbook                     | Accepted | 2026-08-13 |
| [0009](0009-lean-launch-remove-job-board.md)                   | Lean launch: no job board, directory held as placeholder       | Accepted | 2026-08-13 |
| [0010](0010-participation-over-listing.md)                     | Participation over listing: consent-gated communities          | Accepted | 2026-08-31 |
| [0011](0011-brevo-for-machine-sent-mail.md)                    | Brevo on send.twente.dev for every machine-sent mail           | Accepted | 2026-09-02 |
| [0012](0012-meetup-for-registration.md)                        | Registration runs on Meetup, the site stays the record         | Accepted | 2026-09-02 |
| [0013](0013-counterscale-for-campaign-attribution.md)          | Campaign attribution on Counterscale, reported from the Worker | Accepted | 2026-09-04 |
| [0014](0014-monthly-editions-and-the-language-that-follows.md) | Editions are monthly, and the vocabulary drops "flagship"      | Accepted | 2026-09-04 |
| [0015](0015-release-vocabulary.md)                             | The evening is a Release, the write-up is release notes        | Accepted | 2026-09-04 |

## Open decisions

Deliberately not yet recorded — see [`../plan/10x-plan.md`](../plan/10x-plan.md) §2:

- Whether company profiles gain a paid sponsorship tier — Phase 5. The `tier` field already exists in
  the schema so the model does not need retrofitting.
