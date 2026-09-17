# Pariteit met webgrip.nl, en wat er upstream is getrokken

twente.dev heeft een zustersite: `webgrip.nl-1`, in gesprek "webgrip-1". Dezelfde vorm (Astro,
Cloudflare, Forgejo), een paar maanden jonger, en de `wrangler.toml` daar noemt expliciet de
lessen die hier zijn geleerd. Wat de twee delen hoort niet twee keer te bestaan.

De ladder waarlangs dat gaat staat in de org-richtlijnen
([reuse-and-releases.md](https://forgejo.webgrip.dev/webgrip/ai-skills/src/branch/main/org/reuse-and-releases.md)):
genereren boven refereren, refereren boven synchroniseren, synchroniseren boven kopiëren. Wat per
site een eigen besluit is — budgetten, toegankelijkheidslijsten, verboden claims — blijft per
site.

## Wat er inmiddels in de toolkit zit

`@webgrip/astro-site-toolkit` draagt drie dingen die hier zijn begonnen. Elke site houdt alleen
nog zijn eigen intentie- of copybestand plus een dunne aanroep.

| Onderdeel         | Versie | Wat de site zelf houdt                                                                                                                            |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mailauthenticatie | 0.3.0  | [`ops/mail-auth.intent.yml`](https://forgejo.webgrip.dev/webgrip/twente.dev/src/branch/main/ops/mail-auth.intent.yml) en een nachtelijke driftjob |
| Claims-guard      | 0.4.0  | `src/lib/claims.test.ts`, alleen nog regels                                                                                                       |
| Mailpijplijn      | 0.5.0  | `src/lib/mail/{theme,copy,sources,document}.ts` en eenregelige scripts                                                                            |

Nog niet getrokken: `gen-ops` naar `webgrip-edge-parity`, en een `static-site`-template die via
`sync-template-files.yml` wordt uitgedeeld.

De claims-guard had hier een uitzondering voor de gegenereerde `CHANGELOG.md`, omdat
semantic-release geschiedenis schrijft met woorden die inmiddels verboden zijn. Die uitzondering is
vervallen: deze repo laat semantic-release geen changelog meer committen (`changelog: false`), en
de release notes staan op de Forgejo release page.

## Twee trucs die je nodig hebt

**Een toolkit-wijziging testen vóór je publiceert.** Typecheck lost niet op door het package
heen, alleen de gepubliceerde versie doet dat. Wissel daarom de symlink om, draai de tests, en
zet hem terug:

```bash
ln -sfn ../../../frontend-toolkit/packages/astro-site-toolkit node_modules/@webgrip/astro-site-toolkit
mise exec -- pnpm test
```

**Pushen als `development` uiteen is gelopen met lokale commits van een peer.** Commit lokaal op
pathspec, en duw hem dan vanuit een losse worktree:

```bash
git worktree add --detach /tmp/push-scratch origin/development
git -C /tmp/push-scratch cherry-pick <sha>
git -C /tmp/push-scratch push HEAD:development
```

De lokale dubbel verdwijnt bij de volgende rebase van de peer. Draai de gates in die worktree,
niet in de gedeelde boom.

## Waar het plan staat

De volledige pariteitsronde van 2026-09-03 (negen agents, veertien uitgevoerde items) staat als
artifact op
[claude.ai](https://claude.ai/code/artifact/64d10f07-cdf0-4ea1-9a4d-575635254cde). Wat daarvan
nog openstaat, staat in [`nu-te-doen.md`](nu-te-doen.md), niet hier.
