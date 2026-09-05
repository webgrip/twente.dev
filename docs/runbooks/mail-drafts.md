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
een campagne verzenden. Dat is precies waarom hij op één laptop staat en niet in de
Forgejo-secrets: een geplande job met een verzendcredential is een staand risico in ruil voor
het besparen van één commando.

## De sleutel aanmaken

1. Brevo, **API Keys & MCP**, **Generate new API key**. Noem hem `twente.dev mail:draft`, zodat
   je later weet wat je intrekt.
2. Kopieer hem meteen. Brevo toont een sleutel één keer; ben je hem kwijt, dan maak je een
   nieuwe.
3. Zet hem in de Keychain, met de waarde via de prompt en niet op de commandoregel:

   ```bash
   security add-generic-password -a "$USER" -s brevo-api -w
   ```

   `-w` als **laatste** optie en zonder waarde erachter vraagt de sleutel interactief. Schrijf
   nooit `-w '<sleutel>'`, want dan staat hij in je shell-history.

4. Exporteer hem in `~/.zshrc`, direct naast de regel die hetzelfde doet voor Vikunja:

   ```bash
   export BREVO_API_KEY="$(security find-generic-password -s brevo-api -w 2>/dev/null)"
   ```

5. Nieuwe shell, en controleren zonder de waarde te tonen:

   ```bash
   [ -n "$BREVO_API_KEY" ] && echo "sleutel staat klaar"
   ```

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
   meer, ook niet op een machine die hem nog heeft.
2. Maak een nieuwe aan en werk het Keychain-item bij. `-U` vervangt de waarde van een item dat
   al bestaat, dus verwijderen hoeft niet:

   ```bash
   security add-generic-password -U -a "$USER" -s brevo-api -w
   ```

Verder verandert er niets: geen bestand in de repo, geen Forgejo-secret, geen CI-job die
omvalt.

## Wat dit commando nooit doet

Verzenden. `sendNow` en het status-endpoint van de campagne-API komen in geen enkel script
voor, en dat is te controleren:

```bash
grep -rn "sendNow\|emailCampaigns/[^\"]*status" scripts src
```

Geeft dat ooit een treffer, dan is de knip uit [ADR 0017](../adrs/0017-mail-reaches-brevo-as-a-draft.md)
stuk.
