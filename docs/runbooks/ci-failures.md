# Runbook — CI die rood staat

Storingen die deze repo echt heeft gehad, met de oorzaak en de fix. Wat de pijplijn hóórt te
doen staat in [ADR 0020](../adrs/0020-ci-critical-path.md); de release-mechanica in
[ADR 0019](../adrs/0019-release-driven-deploys.md) en
[`../plan/release-train.md`](../plan/release-train.md).

Eén patroon vooraf: **een verificatiejob die eruit klapt, blokkeert de release voor iedereen.**
`Release` hangt achter alle vijf de verificatiejobs, dus één rode job betekent geen rc. Tussen
2026-09-10 en 2026-09-15 stond `Container Parity` vier dagen rood en werd er in die hele
periode geen release candidate gesneden, zonder dat iemand het merkte. Kijk bij een stille
release altijd eerst naar de jobstatussen, niet naar semantic-release.

## Container Parity: `ENOENT` op `copy.config.yml`

**Symptoom.** `pnpm build` in de image stopt met
`Error: ENOENT: no such file or directory, open 'docs/brand/copy/copy.config.yml'`.

**Oorzaak.** `.dockerignore` sluit `docs` uit. Zolang `pnpm build` alleen de site bouwde was
dat prima, maar sinds `copy:check` en `validate:copy` in het buildscript zitten leest de build
uit `docs/brand/copy/`, en dat bestaat niet in de buildcontext.

**Fix.** Een uitzondering direct onder de uitsluiting. Docker honoreert `!` binnen een
uitgesloten map.

```
docs
!docs/brand/copy
```

**Les.** Elke keer dat er iets aan `scripts.build` in `package.json` wordt toegevoegd, hoort de
vraag erbij welke bestanden dat leest en of `.dockerignore` ze doorlaat.

## Container Parity: `ERR_PNPM_MISSING_PACKAGE_INDEX_FILE`

**Symptoom.** De licentiebundel faalt met
`Failed to find package index file for @emnapi/core@…`, en na een fix voor dat pakket met
`@img/sharp-wasm32@…`. Op macOS draait precies dezelfde stap zonder klacht.

**Oorzaak.** `pnpm licenses list --prod` loopt alle optionele dependencies uit de lockfile af en
zoekt elk pakket op in de pnpm-store, inclusief de platformbinaries die pnpm op dit platform
juist heeft overgeslagen. Op macOS zijn die er wel, op linux niet. Het is dus geen
licentieprobleem maar een store-probleem dat zich als licentieprobleem voordoet.

**Fix.** `scripts/third-party-licenses.mjs` loopt sinds `3c72006` de productiegraaf uit
`pnpm-lock.yaml` en leest de licentie van elk pakket dat op schijf staat in
`node_modules/.pnpm`. Geen store nodig, dus platformonafhankelijk. Pakketten die op dit
platform niet geïnstalleerd zijn, krijgen een eigen sectie in de bundel in plaats van
stilzwijgend te verdwijnen.

**Wat niet werkt**, alle drie geprobeerd en gemeten:

| Poging                                            | Uitkomst                                                                                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| De pnpm-store mounten op de `pnpm build`-stap     | Komt precies één pakket verder                                                                                                                                  |
| `--no-optional`                                   | Draait groen, maar laat `sharp`, `@img/sharp-libvips-*` en elke platformbinary uit de lijst, precies wat [het licentiebeleid](../licence-policy.md) wil auditen |
| `supportedArchitectures` met alle os, cpu en libc | 1 minuut 27 installeren, 1,8 GB `node_modules`, nog steeds rood                                                                                                 |

## Docssite: `Aborted because --strict flag is set`

**Symptoom.** De Zensical-build eindigt op `2 issues found` met `page does not exist` bij een
markdownlink.

**Oorzaak.** De docssite bouwt met `--strict`, en een relatieve link naar een `.md`-bestand
buiten `docs/` is voor die build een dode pagina. `CLAUDE.md` en `README.md` liggen boven
`docs/`, dus `](../../CLAUDE.md)` breekt de build. Links naar niet-markdownbestanden
(`](../../wrangler.toml)`, `](../../LICENSE)`) worden niet gecontroleerd en zijn dus wél goed.

**Fix.** Voor een bestand buiten `docs/` de volledige Forgejo-URL gebruiken:

```markdown
[`CLAUDE.md`](https://forgejo.webgrip.dev/webgrip/twente.dev/src/branch/main/CLAUDE.md)
```

**Bewaakt door** `pnpm validate:docs` ([`../../scripts/validate-docs-links.ts`](https://forgejo.webgrip.dev/webgrip/twente.dev/src/branch/main/scripts/validate-docs-links.ts)),
dat in de job `Docs links` op elke branch draait. Die check bestaat omdat de strict-build zelf
alleen nog op `main` draait, zie de volgende sectie.

## DNS preview: `if cloudflare apitoken is not set`

_Opgelost op 2026-09-17: de vault-sleutel staat er, de lane komt sindsdien tot de preview._

**Symptoom.** De job `DNS preview` uit `on_dns_change.yml` stopt op stap `Preview` met
`failed to initialize DNS provider "cloudflare": if cloudflare apitoken is not set, apikey and
apiuser must be provided`. De stap `Check` daarvoor is groen, dus het zonebestand deugt. De
nachtelijke `dns-drift.yml` valt elke dag om 05:45 op precies hetzelfde. Gemeten op de runs 315,
318, 321 en 413: de lane is nooit groen geweest sinds `bd833d9`.

**Oorzaak.** `${{ secrets.CLOUDFLARE_DNS_TOKEN }}` expandeert naar een lege string, en
`ops/dns/creds.json` zet die leegte via `$CLOUDFLARE_API_TOKEN` in het apitoken-veld. Het
reposecret bestaat niet, en de keten die het hoort te maken staat aan de bovenkant stil:

| Schakel                                                                | Staat op 2026-09-16                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| OpenBao `secret/cloudflare/dnscontrol`, sleutel `CLOUDFLARE_DNS_TOKEN` | bestaat niet                                                               |
| ExternalSecret `forgejo-cloudflare-dns` (namespace `forgejo`)          | `Ready=False`, `SecretSyncedError`                                         |
| Kubernetes-secret `forgejo-cloudflare-dns`                             | `NotFound`                                                                 |
| CronJob `forgejo-actions-secrets` (`23 * * * *`)                       | logt `cloudflare dns token not present yet; skipping` en slaat de PUT over |
| Reposecret `CLOUDFLARE_DNS_TOKEN` op `webgrip/twente.dev`              | nooit geschreven                                                           |

Het is dus geen CI-fout maar stap 3 van de uitrol in
[`../plan/dns-ownership.md`](../plan/dns-ownership.md) die nog openstaat. De machinerie in
`homelab-cluster` is compleet en herstelt zichzelf zodra de vault-sleutel er staat; hij faalt
zacht, dus niets alarmeert erop.

**Fix.** Twee stappen die alleen een mens kan zetten, want een Cloudflare-token bestaat alleen in
het dashboard en een waarde gaat nooit door een agent heen:

```bash
mise exec -- just bao-login
bao kv put secret/cloudflare/dnscontrol CLOUDFLARE_DNS_TOKEN=<token van forgejo-ci-dns>
kubectl -n forgejo annotate externalsecret forgejo-cloudflare-dns force-sync="$(date +%s)" --overwrite
kubectl -n forgejo get externalsecret forgejo-cloudflare-dns
```

Het token heet `forgejo-ci-dns` en draagt Zone:Read en DNS:Edit op twente.dev en webgrip.nl.
Wacht op `SecretSynced` voordat je de CronJob laat lopen, anders mount de Job nog het oude
beeld. Daarna draait `on_dns_change.yml` groen; `DNS_PUSH=on` pas zetten als de preview
`0 corrections` meldt.

**Verkeerde vault-sleutel.** `secret/cloudflare/dns` bestaat wel, maar dat is het token van
external-dns, met sleutel `api-token` en een andere scope. Daar `CLOUDFLARE_DNS_TOKEN` in zetten
repareert niets en de foutmelding blijft identiek.

**Les.** Een reusable die een secret als `required: true` declareert, krijgt van Forgejo geen
harde fout als de aanroeper een lege string doorgeeft — het loopt door tot de tool zelf klaagt.
Bij elke variant van "credential niet gezet" is de keten van vault tot reposecret de plek om te
kijken, niet de workflow:

```bash
kubectl -n forgejo get externalsecret | grep -v SecretSynced
```

## DNS Drift: `there are pending changes`

**Symptoom.** De nachtelijke `dns-drift.yml` valt op stap `Preview` met `Done. 2 corrections.`
gevolgd door `there are pending changes` en `RUN exit status 1`. `Check` ervoor is groen, dus
het zonebestand deugt en het token werkt.
([run 443](https://forgejo.webgrip.dev/webgrip/twente.dev/actions/runs/443))

**Oorzaak.** Niet Cloudflare, maar `main`. De driftjob draait op schedule en checkt dus de
standaardbranch uit, en `main` krijgt `ops/dns/` pas bij een promotie. Op run 443 wees hij nog
naar de zone van voor [`1f5a0d7`](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1f5a0d7),
de commit die de zes dagen achterstand op `webgrip/cloudflare` had ingehaald. De twee
"correcties" wilden de DMARC-handhaving op de apex terugzetten van `p=quarantine; pct=25` naar
`p=none` — precies de regressie waar
[`../plan/dns-ownership.md`](../plan/dns-ownership.md) voor waarschuwt.

**Herkennen in één commando**, voor je naar Cloudflare kijkt:

```bash
git log --oneline origin/main..origin/development -- ops/dns/
```

Komt daar iets uit, dan is de drift een achterstand van `main` en geen drift.

**Fix.** De promotie-PR mergen. Daarna vergelijkt de drift het actuele zonebestand, en blijft
over wat er echt nog openstaat: de correcties die de pushjob nog niet heeft toegepast omdat hij
op `if: false` staat. Op `development` waren dat er drie
([run 432](https://forgejo.webgrip.dev/webgrip/twente.dev/actions/runs/432)): de TTL van het
google-site-verification-record, de DMARC-trede naar `sp=reject; pct=50` en de MTA-STS-`id`.
Groen wordt de drift dus pas na een push.

**Volgorde die je niet mag omdraaien.** De MTA-STS-`id` hoort pas de zone in als het
beleidsbestand al live staat, en dat gaat mee met de productiedeploy van een stable release. De
pushschakelaar en de promotie in één merge zetten laat die twee tegen elkaar racen. Eerst
promoveren, dan `https://mta-sts.twente.dev/.well-known/mta-sts.txt` op `mode: enforce`
controleren, dan pas pushen.

**Les.** Een driftjob op de standaardbranch meet in een trunk-based repo met een release-trein
twee dingen tegelijk: echte drift, en hoe ver `main` achterloopt. Lees de correcties altijd in
die richting — een correctie die iets terugzet naar een oudere waarde is een achterstand, geen
drift.

## `if:` op een job met `uses:` doet niets

**Symptoom.** `deploy-docs-site` draagt `if: github.ref == 'refs/heads/main'` en draait toch op
`development`. Gemeten op de runs 355, 360 en 372, alle drie op `development`, en na de linkfix
publiceerde stap `Sync to Garage` in de runs 379, 395 en 400 de docssite daadwerkelijk vanaf
`development`.

**Oorzaak.** Sinds Forgejo v15.0.0 wordt een `uses:`-job uitgeklapt naar de losse jobs van de
aangeroepen workflow, zolang die job geen eigen `runs-on` heeft en de workflow op dezelfde
Forgejo-server staat ([PR #10525](https://codeberg.org/forgejo/forgejo/pulls/10525), gemerged
2025-12-24; deze instance draait 15.0.2). De `if:` van de aanroepende job gaat bij dat
uitklappen niet mee naar de binnenste jobs, en dat is in die PR ook nooit geïmplementeerd.

Een tijd lang viel het niet op omdat de Zensical-build eruit klapte vóór de syncstap. Die
kapotte build wás per ongeluk de branchgate; toen de links gerepareerd werden, verdween de gate
mee.

**Fix.** Een expliciete `runs-on` op de aanroepende job onderdrukt het uitklappen, waardoor de
job weer als geheel wordt ingepland en zijn `if` gewoon werkt.

```yaml
deploy-docs-site:
  uses: webgrip/workflows/.forgejo/workflows/techdocs-deploy-docs-site.yml@<sha>
  needs: generate-documentation
  runs-on: docker
  if: github.ref == 'refs/heads/main'
```

**Les.** Elke `if:` op een `uses:`-job in deze estate is verdacht. Controleer ze met:

```bash
grep -rn -A4 "uses:" .forgejo/workflows/ | grep -B2 "if:"
```

En let op de bijwerking: de validatie die de aangeroepen workflow op andere branches deed,
verdwijnt met de expansie mee. Vervang hem door een eigen check, zoals `Docs links` hierboven.

### Twee dingen die met dat uitklappen meekomen

**Een uitgeklapte aanroeper meldt success terwijl zijn kind niets deed.** De wrapper blijft in
de jobslijst staan en is groen zodra het kind niet faalt, ook als dat kind elke stap heeft
overgeslagen. Op run 428 stond `DNS Push: success` (0s) naast `DNS push: skipped` met een
overgeslagen checkout. Met `runs-on` erop meldt de job gewoon `skipped`, zoals
`deploy-docs-site` sinds `7cf36f4` doet en `DNS Push` sinds `9b0a7de`.

**Maar dan verlies je de stappen in de UI.** Zonder uitklappen draait de hele aangeroepen
workflow binnen één job, en de UI vouwt dat samen tot `Set up job` en `Complete job`. Run 432
toont een preview-job van vijftien seconden met twee stappen en geen `Preview` ertussen — het
dnscontrol-werk staat gewoon in het log van `Set up job`. Zoek er dus in, in plaats van te
concluderen dat de job leeg was:

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"logCursors":[{"step":0,"cursor":0,"expanded":true}]}' \
  "https://forgejo.webgrip.dev/webgrip/twente.dev/actions/runs/<run>/jobs/<jobIdx>/attempt/1" \
  | python3 -c "import sys,json;[print(l['message'].rstrip()) for s in json.load(sys.stdin)['logs']['stepsLog'] for l in s['lines']]"
```

Een job die tijdens de run op `waiting` staat is geen storing: de `if:` wordt pas beoordeeld als
de voorgaande jobs klaar zijn, en daarna springt hij naar `skipped`.

## Een rc-tag zonder release, en staging blijft achter

**Symptoom.** `development` draagt een tag `vX.Y.Z-rc.N` en een commit
`chore(release): vX.Y.Z-rc.N [skip ci]`, maar er is geen release gepubliceerd,
`staging.twente.dev` draait nog op de vorige rc, en de CHANGELOG heeft een kop voor een versie
die verder nergens bestaat.

**Oorzaak.** De run die die rc sneed is halverwege de releasejob geannuleerd.
`@semantic-release/git` commit en pusht eerst, semantic-release pusht daarna de tag, en pas dan
publiceert `@saithodev/semantic-release-gitea` de release. `on_release_published.yml` hangt aan
`release: [published]`, dus alles wat vóór die laatste stap afbreekt laat de tag staan zonder
deploy. Sinds pushes naar `development` elkaar annuleren is dat venster van een seconde of twee
bereikbaar met twee pushes vlak na elkaar. Op `main` annuleren pushes elkaar niet, precies
hiervoor.

**Fix.** Niets herstellen. De volgende push snijdt `rc.N+1`, en die tag draagt dezelfde commits,
dus de code bereikt staging alsnog. Wat overblijft is een weestag en een CHANGELOG-kop. Laat ze
staan, of ruim de tag op met `git push origin :refs/tags/vX.Y.Z-rc.N`.

## Static Analysis rood op Prettier, terwijl jij niets deed

**Symptoom.** `Static Analysis (Prettier, ESLint, Typecheck, Audit, Knip, Outdated)` faalt op
een bestand dat niet van jou is.

**Oorzaak.** Meerdere sessies delen één working tree, en een commit die zonder `pnpm format`
landt zet de gedeelde job voor iedereen op rood. Drie keer in vijf dagen gebeurd:
`scripts/gen-copy.ts` uit `f85d27f`, vier bestanden uit `b0ab95a` en `6304f1f`, en opnieuw
`scripts/license-check.mjs` uit `3ca8ac4`.

**Fix.** Voor commit:

```bash
mise exec -- pnpm exec prettier --check .
```

Staat er nog een openstaande TODO voor een hook die dit afdwingt, zie
[`../plan/nu-te-doen.md`](../plan/nu-te-doen.md).

## De Actions-API uitlezen als de UI te traag is

`/api/v1/repos/webgrip/twente.dev/actions/runs` negeert `limit` en geeft honderden rijen terug
waarin `run_number`, `display_title`, `head_branch` en `conclusion` allemaal `null` zijn. Die
is dus onbruikbaar. `/actions/tasks?limit=25` heeft de velden wel, maar geeft onder belasting
niets terug (`http=000`); er tegelijk vanuit een monitor tegenaan pollen maakt dat erger.

Twee routes die wel werken. De HTML-pagina van een workflow geeft de run-ids:

```bash
curl -s "https://forgejo.webgrip.dev/webgrip/twente.dev/actions?workflow=on_docs_change.yml" \
  | grep -oE '/actions/runs/([0-9]+)"'
```

En het UI-endpoint geeft per run de jobs, per job de stappen, en per stap het log. `attempt` is
1-gebaseerd en `jobIdx` is de 0-gebaseerde positie in de run:

```bash
curl -s -X POST -H "Content-Type: application/json" -d '{}' \
  "https://forgejo.webgrip.dev/webgrip/twente.dev/actions/runs/<run>/jobs/<jobIdx>/attempt/1"
```

Een lege body somt de jobs en stappen op; voeg
`{"logCursors":[{"step":N,"cursor":0,"expanded":true}]}` toe voor het log van stap N. De
uitvoer staat in `logs.stepsLog[].lines[].message`, niet in `streamingLogs`. Omdat de repo
publiek is, werkt dit zonder token.
