# DNS ownership — the twente.dev zone lives in this repository

_Started 2026-09-05. Decision: [ADR 0018 v1.2.0](../adrs/0018-account-and-zone-resources-in-opentofu.md)._

## Shape

| Piece                                          | Where                                                | Why                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Zone records for `twente.dev`                  | [`ops/dns/dnsconfig.js`](../../ops/dns/dnsconfig.js) | one line per record, stateless, next to the code that needs them                                          |
| Preview, push, drift mechanics                 | `webgrip/workflows` `dnscontrol.yml`                 | shared with webgrip.nl; a site adds a directory and two callers                                           |
| `on_dns_change.yml`                            | this repo                                            | preview on every push to `main` and `development` touching `ops/dns/**`, push on `main` behind `DNS_PUSH` |
| `dns-drift.yml`                                | this repo                                            | 05:45 daily, fails when the live zone differs from `main`                                                 |
| Account objects (Zero Trust, R2, token roller) | `webgrip/cloudflare`                                 | span sites                                                                                                |

## Rollout

1. `webgrip/workflows` `dnscontrol.yml` landed as `2a5d82e` (2026-09-05).
2. This repository: zone file, creds, callers and the ADR 0018 v1.2.0 amendment (on `development`).
3. Homelab publishes `CLOUDFLARE_DNS_TOKEN` to this repository from OpenBao
   `secret/cloudflare/dnscontrol`. Gedaan op 2026-09-17; zolang die vault-sleutel leeg stond
   was de hele lane rood, zie [`../runbooks/ci-failures.md`](../runbooks/ci-failures.md).
   `cloudflare/dns` is een ander geheim: dat is de token van external-dns, met sleutel
   `api-token` en een andere scope.
4. First preview must read `0 corrections` for `twente.dev`; then `DNS_PUSH=on`.
5. `webgrip/cloudflare` drops the `twente.dev` block from its `dns/dnsconfig.js`.
6. webgrip.nl repeats steps 2 to 5 for its zone.

## Twee repo's die dezelfde zone declareren lopen uit elkaar

Dit plan zei eerst dat de overlap tussen stap 2 en stap 5 veilig is, omdat een push van beide
kanten een no-op zou zijn. Dat geldt alleen zolang de twee bestanden identiek blijven, en ze
liepen binnen zes dagen uit elkaar. De kopie hier is gemaakt op 2026-09-05 (`bd833d9`);
`webgrip/cloudflare` wijzigde daarna dezelfde records tweemaal, op 2026-09-11: `170490c` haalde
`mailto:dmarc@twente.dev` uit de rua-lijst en `d83ea7e` zette DMARC op `p=quarantine; pct=25`.

De eerste groene preview vanuit deze repo meldde daardoor twee correcties
([run 423](https://forgejo.webgrip.dev/webgrip/twente.dev/actions/runs/423)), die samen de
DMARC-handhaving op de apex hadden teruggezet naar `p=none`. Er is niets toegepast: `DNS_PUSH`
stond niet op `on`, dus de pushjob werd overgeslagen. Stap 4 is precies de poort die dat
tegenhoudt, en hij heeft gewerkt.

**Zolang beide repo's de zone declareren is `webgrip/cloudflare` de waarheid** — zijn
nachtelijke drift draait `--expect-no-changes` over dezelfde zone en staat groen. Een verschil
dat een preview hier laat zien, is een verschil dat deze kopie achterloopt, niet een correctie
die nog toegepast moet worden. Zet `DNS_PUSH` pas op `on` als de preview `0 corrections` leest,
en doe stap 5 zo snel mogelijk: de overlap is de storing, niet de veiligheidsmarge.

## Human steps

| Step                                                                                             | Why a human                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create a Cloudflare token `dns-rw-twente-dev`: Zone:Read and DNS:Edit, scoped to twente.dev only | tokens are dashboard-only, until [homelab ADR-0061](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0061-ci-reads-over-oidc-writes-from-the-cluster.md) mints them |
| Seed OpenBao `secret/cloudflare/dnscontrol` with key `CLOUDFLARE_DNS_TOKEN`                      | secrets never enter a repository                                                                                                                                                                                  |
| Set the repository variable `DNS_PUSH=on` after the first empty preview                          | the switch that makes CI write to the zone                                                                                                                                                                        |

## Deleting a record

A push that deletes a record is refused unless the head commit carries one trailer per record:

```
DNS-Allow-Delete: old.twente.dev
```

## `dig` is niet de scheidsrechter

DNSControl vergelijkt het zonebestand met de records die de **provider-API** teruggeeft, niet
met wat resolvers antwoorden. Cloudflare synthetiseert records die publiek resolven maar niet
in die lijst staan: de CAA-paren die het afleidt uit de SSL/TLS-instelling van de zone
(`comodoca.com`, `digicert.com`) en `_domainconnect`. Op twente.dev toont `dig` dertien CAA
terwijl het zonebestand er negen declareert, en `dnscontrol preview --expect-no-changes` meldt
nog steeds `Done. 0 corrections.`

Op 2026-09-06 zijn die vijf records alsnog gedeclareerd omdat `dig` ze liet zien. Daarmee
werden nul verschillen er drie, en het is teruggedraaid. Het bewijs lag er al: de nachtelijke
driftjob van `webgrip/cloudflare` had `--expect-no-changes` over dezelfde zone gedraaid vanuit
een bestand met dezelfde weglatingen, en was groen.

**Voordat je een zonebestand aanpast omdat een record "mist":** kijk naar de nieuwste
`dnscontrol preview` van een van beide driftjobs (`nightly-drift.yml` in `webgrip/cloudflare`,
`dns-drift.yml` hier). `0 corrections` betekent dat het bestand in sync is, wat `dig` ook zegt.
