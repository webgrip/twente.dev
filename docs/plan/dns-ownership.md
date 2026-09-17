# DNS ownership — the twente.dev zone lives in this repository

_Started 2026-09-05. Decision: [ADR 0018 v1.2.0](../adrs/0018-account-and-zone-resources-in-opentofu.md)._

## Shape

| Piece                                          | Where                                                | Why                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Zone records for `twente.dev`                  | [`ops/dns/dnsconfig.js`](../../ops/dns/dnsconfig.js) | one line per record, stateless, next to the code that needs them                                          |
| Preview, push, drift mechanics                 | `webgrip/workflows` `dnscontrol.yml`                 | shared with webgrip.nl; a site adds a directory and two callers                                           |
| `on_dns_change.yml`                            | this repo                                            | preview on every push to `main` and `development` touching `ops/dns/**`, push on `main` behind `enabled:` |
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
4. First preview must read `0 corrections` for `twente.dev`; then `enabled: true` on the push job.
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
DMARC-handhaving op de apex hadden teruggezet naar `p=none`. Er is niets toegepast: de pushjob
stond uit, dus hij werd overgeslagen. Stap 4 is precies de poort die dat tegenhoudt, en hij
heeft gewerkt.

**Zolang beide repo's de zone declareren is `webgrip/cloudflare` de waarheid** — zijn
nachtelijke drift draait `--expect-no-changes` over dezelfde zone en staat groen. Een verschil
dat een preview hier laat zien, is een verschil dat deze kopie achterloopt, niet een correctie
die nog toegepast moet worden. Zet de pushjob pas aan als de preview `0 corrections` leest,
en doe stap 5 zo snel mogelijk: de overlap is de storing, niet de veiligheidsmarge.

## Human steps

| Step                                                                                             | Why a human                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create a Cloudflare token `dns-rw-twente-dev`: Zone:Read and DNS:Edit, scoped to twente.dev only | tokens are dashboard-only, until [homelab ADR-0061](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0061-ci-reads-over-oidc-writes-from-the-cluster.md) mints them |
| Seed OpenBao `secret/cloudflare/dnscontrol` with key `CLOUDFLARE_DNS_TOKEN`                      | secrets never enter a repository                                                                                                                                                                                  |

## De pushschakelaar staat in git, niet in een CI-variabele

`enabled:` op de pushjob in [`on_dns_change.yml`](../../.forgejo/workflows/on_dns_change.yml) is
een letterlijke `true` of `false`. Aanzetten is een commit: het staat in de diff, het is te
reviewen en het is met één revert terug te draaien. De repovariabele `DNS_PUSH` die hier eerst
stond kon buiten git om worden omgezet, was in geen enkele review zichtbaar, en werkte
waarschijnlijk niet eens: Forgejo v15 evalueert de `with:`-expressies van een aanroeper op het
moment dat het de job uitklapt, met een lege context, dus `${{ vars.DNS_PUSH == 'on' }}` kwam er
als `false` uit hoe de variabele ook stond. `cloudflare-deploy.yml` waarschuwt in zijn eigen
inputbeschrijving voor precies dat.

Twee poorten blijven eronder liggen, allebei in de gedeelde workflow: `push-refs` laat alleen
`refs/heads/main` pushen, en een push die een record verwijdert wordt geweigerd zonder
`DNS-Allow-Delete`-trailer. `development` kan dus niet pushen, ook niet als `enabled` aanstaat.

Op termijn verdwijnt de schakelaar helemaal: in
[homelab ADR-0061](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0061-ci-reads-over-oidc-writes-from-the-cluster.md)
past een reconciler in het cluster de zone toe en houdt CI alleen de preview.

## De twee ladders

Beide staan in een meetstand die pas opschuift als iemand de rapporten leest. Zonder datum
blijven ze staan waar ze staan.

| Ladder  | Nu                            | Volgende trede               | Poort                                                        |
| ------- | ----------------------------- | ---------------------------- | ------------------------------------------------------------ |
| DMARC   | `p=quarantine; pct=50`        | `pct=100`, daarna `p=reject` | geen legitieme afzender die faalt in de Cloudflare-rapporten |
| MTA-STS | `mode: enforce`, `max_age` 1w | —                            | TLS-RPT op `tlsrpt@twente.dev` blijft leeg                   |

`sp=reject` staat er al: elk subdomein zonder eigen `_dmarc` wordt meteen geweigerd. Brevo
verstuurt vanaf `send.twente.dev`, en dat heeft een eigen `_dmarc`, dus dat raakt het niet.

## Het MTA-STS-beleid en de zone horen bij elkaar

Het beleidsbestand staat in [`public/.well-known/mta-sts.txt`](../../public/.well-known/mta-sts.txt)
en gaat mee met de Worker; de `id` staat in de zone en gaat mee met DNS. Verandert het bestand
zonder dat de `id` verandert, dan blijven verzenders het oude beleid gebruiken tot `max_age`
verlopen is, en niets merkt dat op.

**Wie het beleidsbestand aanpast, bumpt de `id` naar de datum van vandaag.** Dat staat hier
opgeschreven en verder nergens: niets dwingt het af. Een korte afweging: de `id` afleiden uit de
inhoud van het bestand maakt vergeten onmogelijk, maar het bestand verandert ongeveer eens per
jaar en een leesbare datum is in een `dig` meer waard dan een hash.

Wat wél wordt afgedwongen is de kant die mail kan kosten. `pnpm validate:mta-sts` faalt als een
MX uit de zone niet in het beleid staat, want onder `mode: enforce` weigert een verzender dan te
bezorgen. Verhuizen van Google naar een andere MX zonder het beleid bij te werken is daarmee
geen stille storing meer maar een rode job. De check hangt aan `Mail Validation`, dus het
kritieke pad krijgt er geen job bij.

Volgorde bij een wijziging: eerst het bestand laten uitrollen met de site, dan de zone pushen.
Andersom halen verzenders het oude bestand op en bewaren dat onder de nieuwe id, tot `max_age`
verloopt — sinds enforce een week.

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
