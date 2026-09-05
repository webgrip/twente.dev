# Een mail als draft in Brevo zetten

`pnpm mail` maakt de HTML uit de content, `pnpm mail:draft` zet die als concept in Brevo.
Verzenden doet een mens, in Brevo zelf. Waarom die knip daar ligt staat in
[ADR 0017](../adrs/0017-mail-reaches-brevo-as-a-draft.md).

Deze runbook gaat over het enige dat je één keer moet inrichten.

## Twee waarden, en maar één is een secret

**`NEWSLETTER_LIST_ID` in [`src/config/site.ts`](../../src/config/site.ts) is geen secret.** Het
identificeert een contactlijst en geeft er geen toegang toe. Het staat daarom gewoon in Git,
naast `NEWSLETTER_FORM_ACTION`, dat ook al een publieke Brevo-identifier is. Zolang het `null`
is, toont `pnpm mail:draft` de beschikbare lijsten en stopt het.

**`BREVO_API_KEY` is wel een secret, en een grove.** Een Brevo v3-sleutel is niet te beperken
tot één endpoint: dezelfde sleutel die een draft schrijft kan ook de contactlijst uitlezen en
een campagne verzenden. Daarom heeft hij precies één origineel, in de kluis, en verder alleen
kopieën die de kluis zelf bijhoudt. Het model is
[homelab-cluster ADR-0055](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0055-one-secrets-model-six-levels.md).

| Waar                                                       | Wat                                                     | Wie schrijft                      |
| ---------------------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| OpenBao `secret/brevo/twente-dev`, sleutel `BREVO_API_KEY` | het origineel                                           | jij, één keer, over OIDC          |
| Forgejo Actions, repo-secret op `twente.dev`               | een kopie, elk uur ververst en tegen Brevo geverifieerd | de `forgejo-actions-secrets`-brug |
| jouw shell                                                 | een export die met de shell sterft                      | `just secret-env`                 |

## De sleutel aanmaken en in de kluis zetten

1. Brevo, **API Keys & MCP**, **Generate new API key**. Noem hem `twente.dev mail:draft`, zodat
   je later weet wat je intrekt. Kopieer hem meteen; Brevo toont hem één keer.
2. Vanuit een checkout van `homelab-cluster`, op LAN of VPN:

   ```bash
   mise exec -- just bao-login
   export BAO_ADDR="$(mise exec -- just bao-addr)"
   mise exec -- bao kv put secret/brevo/twente-dev BREVO_API_KEY=<sleutel>
   ```

   Liever niet op de commandoregel? De OpenBao-UI (Authentik-login) doet hetzelfde: engine
   `secret/`, pad `brevo/twente-dev`, sleutel `BREVO_API_KEY`.

3. Klaar. De `ExternalSecret/forgejo-brevo` haalt hem binnen een uur op, de brug zet hem op de
   volgende tik (`:23`) als repo-secret `BREVO_API_KEY` op `twente.dev`, en logt
   `BREVO_API_KEY valid` nadat `GET /v3/account` 200 gaf. Alleen deze repo ziet hem; de
   org-instellingen tonen hem niet.

## Lokaal gebruiken

```bash
eval "$(mise exec -- just secret-env brevo/twente-dev)"
[ -n "$BREVO_API_KEY" ] && echo "sleutel staat klaar"
pnpm mail:draft post:open-call-001 nl --dry-run
```

De export leeft in deze shell en niet langer. Wil je hem ook zonder VPN, dan mag de Keychain
als cache, onder de naam van het kluispad zodat de kopie zijn bron kent:

```bash
printf '%s' "$BREVO_API_KEY" | security add-generic-password -U -a "$USER" -s brevo-twente-dev -w /dev/stdin
```

en in `~/.zshrc`, naast de regel voor Vikunja:

```bash
export BREVO_API_KEY="$(security find-generic-password -s brevo-twente-dev -w 2>/dev/null)"
```

Na een rotatie in de kluis draai je de `eval` en de `printf` opnieuw. Een cache die je niet
ververst is een sleutel die niet meer werkt, en dat is de juiste kant om te falen.

## In CI

De workflow [`[Manual] Mail Draft`](../../.forgejo/workflows/mail-draft.yml) draait
`pnpm mail:draft` op verzoek: Actions, kies de workflow, vul het doel en optioneel de taal in.
Hij leest `secrets.BREVO_API_KEY` uit de repo-secrets die de brug bijhoudt. Niets draait
automatisch bij een push, want welke mail wanneer als draft klaarstaat blijft een keuze van een
mens.

## Het lijst-id vinden

Met de sleutel gezet en `NEWSLETTER_LIST_ID` nog op `null`:

```bash
pnpm mail:draft post:open-call-001 nl
```

Dat print de lijsten met hun id en aantal abonnees, en stopt zonder iets te versturen. Zet het
juiste nummer in `NEWSLETTER_LIST_ID` en commit dat. Daarna werkt het commando gewoon.

## Draften

```bash
pnpm mail                                    # wat er te bouwen valt
pnpm mail:draft post:open-call-001 nl        # één taal
pnpm mail:draft event:twente-dev-001-reconnect  # beide talen
pnpm mail:draft post:open-call-001 nl --dry-run  # laat de payload zien, raakt Brevo niet aan
```

De check uit `pnpm validate:mail` draait eerst. Een mail met een probleem gaat niet de deur
uit. Een tweede run op hetzelfde doel werkt de bestaande draft bij, gevonden op campagnenaam,
dus een correctie laat geen tweeling achter.

## Intrekken en roteren

Sleutel gelekt, laptop kwijt, of gewoon periodiek:

1. Brevo, **API Keys & MCP**, verwijder de oude sleutel. Vanaf dat moment werkt hij nergens
   meer, ook niet in een cache die hem nog heeft.
2. Maak een nieuwe aan en schrijf hem op dezelfde plek in de kluis:

   ```bash
   mise exec -- bao kv put secret/brevo/twente-dev BREVO_API_KEY=<nieuwe sleutel>
   ```

3. Klaar. De brug verifieert en publiceert de nieuwe waarde op de volgende tik; tot die tijd
   faalt zijn verificatie hard en meldt het alarm `ForgejoActionsSecretsReconcileStale` precies
   welk pad je moet vullen. Lokaal draai je de `eval` uit "Lokaal gebruiken" opnieuw.

Er verandert geen bestand in deze repo en geen workflow.

## Wat dit commando nooit doet

Verzenden. `sendNow` en het status-endpoint van de campagne-API komen in geen enkel script
voor, en dat is te controleren:

```bash
grep -rn "sendNow\|emailCampaigns/[^\"]*status" scripts src
```

Geeft dat ooit een treffer, dan is de knip uit [ADR 0017](../adrs/0017-mail-reaches-brevo-as-a-draft.md)
stuk.
