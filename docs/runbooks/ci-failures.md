# Runbook — CI die rood staat

Storingen die deze repo echt heeft gehad, met de oorzaak en de fix. Wat de pijplijn hóórt te
doen staat in [ADR 0020](../adrs/0020-ci-critical-path.md); de release-mechanica in
[ADR 0019](../adrs/0019-release-driven-deploys.md) en
[`../plan/release-train.md`](../plan/release-train.md).

Eén patroon vooraf: **een verificatiejob die eruit klapt, blokkeert de release voor iedereen.**
`Build Site` hangt achter `Container Parity`, en `Release` achter `Build Site`. Tussen
2026-09-10 en 2026-09-15 stond `Container Parity` vier dagen rood en werd er in die hele
periode geen release candidate gesneden, zonder dat iemand het merkte. Kijk bij een stille
release altijd eerst naar de jobvolgorde, niet naar semantic-release.

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
