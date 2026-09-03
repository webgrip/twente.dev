# Runbook: rollback en nood-deploy

Twee routes om een slechte deploy terug te draaien, plus het noodpad als Forgejo
zelf plat ligt. Overgenomen van webgrip.nl (runbook 2026-09-03) en aangepast aan
deze site.

## Route 1 — Cloudflare-dashboard (seconden, geen secrets)

Workers & Pages → de `twente-dev`-worker → **Deployments** → kies de vorige
versie → **Rollback**.

- Snelste route; werkt ook als CI of Forgejo stuk is.
- **Let op:** productie wijkt daarna af van `main`. Zet de echte fix of een
  `git revert` zo snel mogelijk op `main`, anders zet de eerstvolgende push de
  kapotte versie gewoon terug.
- **Extra hier:** `nightly-rebuild.yml` deployt `main` elke nacht om 02:00 UTC
  opnieuw. Een dashboard-rollback zonder fix op `main` overleeft dus hooguit
  tot de eerstvolgende nacht.

## Route 2 — git revert (de nette route)

```sh
git revert <slechte-commit>
git push
```

CI bouwt, keurt (Lighthouse + axe + CSP-validatie) en deployt de revert zoals
elke push. Doorlooptijd: één pipeline-run (~5 min). Dit is de standaardroute
wanneer de site niet actief stuk is.

## Noodpad — Forgejo ligt plat, er moet nú iets live

De site zelf blijft gewoon draaien zonder Forgejo; dit pad is alleen nodig als
er tijdens een Forgejo-storing een wijziging live moet.

```sh
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account-id> pnpm exec wrangler deploy
```

- Token aanmaken: Cloudflare-dashboard → My Profile → API Tokens → Create
  Token: **Account · Workers Scripts · Edit** + **Account · Account Settings ·
  Read** + **Zone (twente.dev) · Workers Routes · Edit**. Na gebruik weer
  intrekken; de structurele CI-token blijft in OpenBao/Forgejo.
- Draai vanaf een schone `main`-checkout; `pnpm install && pnpm build` eerst.
- `pnpm exec`, nooit `pnpm dlx` — dlx ziet `pnpm-workspace.yaml`'s allowBuilds
  niet en blijft hangen op een interactieve build-scripts-prompt.

## Cache-nuance bij elke rollback

- **HTML** staat op `max-age=0, must-revalidate` — een rollback is direct
  zichtbaar.
- **`/_astro/*`** is content-hashed en immutable — nooit een probleem.
- **`/pagefind/*`**: de gehashte index/fragment-chunks zijn immutable; de
  stabiele namen (entry-JSON, JS, CSS, wasm) revalideren binnen een uur. Na een
  rollback kan zoeken dus tot een uur een oude index laten zien — geen actie
  nodig, het herstelt zichzelf.
- **`/brand/*`** cachet tot 24 uur aan de edge. Na een rollback die
  brand-assets raakt kan een oude versie dus nog een dag naleveren. Meestal
  prima; moet het echt direct, purge dan die paden handmatig in het
  Cloudflare-dashboard (Caching → Purge) of geef het asset een nieuwe naam via
  de generator (`docs/brand/templates/banners.html` + `scripts/export-banners.mjs`).
  Geen purge-automatisering bouwen — bewuste niet-actie.
