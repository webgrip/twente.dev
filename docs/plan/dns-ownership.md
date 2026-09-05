# DNS ownership — the twente.dev zone lives in this repository

_Started 2026-09-05. Decision: [ADR 0018 v1.2.0](../adrs/0018-account-and-zone-resources-in-opentofu.md)._

## Shape

| Piece                                          | Where                                                | Why                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Zone records for `twente.dev`                  | [`ops/dns/dnsconfig.js`](../../ops/dns/dnsconfig.js) | one line per record, stateless, next to the code that needs them                     |
| Preview, push, drift mechanics                 | `webgrip/workflows` `dnscontrol.yml`                 | shared with webgrip.nl; a site adds a directory and two callers                      |
| `on_dns_change.yml`                            | this repo                                            | preview on every push and PR touching `ops/dns/**`, push on `main` behind `DNS_PUSH` |
| `dns-drift.yml`                                | this repo                                            | 05:45 daily, fails when the live zone differs from `main`                            |
| Account objects (Zero Trust, R2, token roller) | `webgrip/cloudflare`                                 | span sites                                                                           |

## Rollout

1. `webgrip/workflows` `dnscontrol.yml` landed as `2a5d82e` (2026-09-05).
2. This repository: zone file, creds, callers and the ADR 0018 v1.2.0 amendment (on `development`).
3. Homelab publishes `CLOUDFLARE_DNS_TOKEN` to this repository from OpenBao `cloudflare/dns`.
4. First preview must read `0 corrections` for `twente.dev`; then `DNS_PUSH=on`.
5. `webgrip/cloudflare` drops the `twente.dev` block from its `dns/dnsconfig.js`. Both configs
   declaring the same records in between is safe: pushes from either side are no-ops.
6. webgrip.nl repeats steps 2 to 5 for its zone.

## Human steps

| Step                                                                                            | Why a human                                |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Create a Cloudflare token `forgejo-ci-dns`: Zone:Read and DNS:Edit on twente.dev and webgrip.nl | tokens are dashboard-only                  |
| Seed OpenBao `cloudflare/dns` with key `CLOUDFLARE_DNS_TOKEN`                                   | secrets never enter a repository           |
| Set the repository variable `DNS_PUSH=on` after the first empty preview                         | the switch that makes CI write to the zone |

## Deleting a record

A push that deletes a record is refused unless the head commit carries one trailer per record:

```
DNS-Allow-Delete: old.twente.dev
```
