/**
 * Assert the partner compact still says the things we told organisers it says.
 *
 * Why this exists: the compact's commitments are quoted verbatim in outreach to
 * community organisers — that we will not run events on their nights, will not
 * approach their existing sponsors, and will remove a listing on one message.
 * Every other gate is blind to their removal. axe loads the partners page, so an
 * accessibility regression fails; lychee catches dead links; neither notices a
 * deleted paragraph. The one page whose *content* is a promise to a third party
 * had no test at all.
 *
 * Deliberately matched on meaning, not prose. Each commitment passes if ANY of
 * its alternative phrasings survives, so the page can be rewritten, tightened or
 * translated better without tripping this — an assertion that breaks on every
 * copy edit gets deleted the first time it is inconvenient, and then it protects
 * nothing.
 *
 * Runs inside `pnpm build` (like validate-csp), so it fails locally and in CI
 * rather than waiting for someone to notice in production.
 */
import { readFileSync } from 'node:fs';

const DIST = 'dist';

interface Commitment {
  /** What breaks in the world if this line disappears. */
  readonly name: string;
  /** Any one of these surviving is enough. Lower-cased, whitespace-collapsed text. */
  readonly anyOf: readonly RegExp[];
}

const COMMITMENTS: Record<string, readonly Commitment[]> = {
  'en/partners.html': [
    {
      name: 'non-compete with existing communities',
      anyOf: [
        /will not duplicate or compete/,
        /not duplicate or compete with/,
        /support and amplify/,
      ],
    },
    {
      name: 'no events on their night',
      anyOf: [
        /not run our own events on your night/,
        /events on your night/,
        /see your dates and avoid them/,
      ],
    },
    {
      name: 'will not approach their existing sponsors',
      anyOf: [
        /not approach your existing sponsors/,
        /existing sponsors/,
        /in-kind help before cash/,
      ],
    },
    {
      name: 'autonomy guarantee',
      anyOf: [/continues to come from you/, /being listed changes nothing/, /never rebranded/],
    },
    {
      name: 'one-click removal, no questions',
      anyOf: [
        /remove you the moment you ask/,
        /no questions, no notice period/,
        /one message, no questions/,
      ],
    },
    {
      name: 'no attendee data in either direction',
      anyOf: [
        /no member lists, no attendee lists/,
        /will not take your data/,
        /in either direction/,
      ],
    },
  ],
  'nl/partners.html': [
    {
      name: 'non-compete with existing communities',
      anyOf: [
        /concurreren niet met bestaande/,
        /doen niet nog eens over wat er al is/,
        /er om te versterken wat er al gebeurt/,
      ],
    },
    {
      name: 'no events on their night',
      anyOf: [/geen eigen events op jullie avond/, /jullie data kunnen zien en vermijden/],
    },
    {
      name: 'will not approach their existing sponsors',
      anyOf: [
        /bestaande sponsoren niet/,
        /bestaande sponsoren/,
        /hulp in natura en pas daarna om geld/,
      ],
    },
    {
      name: 'autonomy guarantee',
      anyOf: [
        /blijft van jullie/,
        /verandert niets aan hoe je je groep runt/,
        /nooit onder onze vlag/,
      ],
    },
    {
      name: 'one-click removal, no questions',
      anyOf: [
        /halen je eraf zodra je dat wilt/,
        /geen vragen, geen opzegtermijn/,
        /één bericht, geen vragen/,
      ],
    },
    {
      name: 'no attendee data in either direction',
      anyOf: [
        /geen ledenlijsten, geen deelnemerslijsten/,
        /nemen geen gegevens over/,
        /ook niet andersom/,
      ],
    },
  ],
};

/**
 * Sponsor pricing is contradictory between the playbook and the deck (VIK-689),
 * so the partners page deliberately names no amount. A figure appearing here
 * means someone published a number that has not been agreed.
 *
 * Matches a currency symbol or an explicit euro amount — not bare digits, which
 * would fire on dates, times and the 2,000-character notes.
 */
const AMOUNT = /€\s?\d|\b\d[\d.,]*\s?(?:euro|eur)\b/i;

/** Strip tags and collapse whitespace so a re-flowed paragraph still matches. */
function textOf(path: string): string {
  const html = readFileSync(`${DIST}/${path}`, 'utf8');
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

let failures = 0;

for (const [path, commitments] of Object.entries(COMMITMENTS)) {
  let text: string;
  try {
    text = textOf(path);
  } catch {
    console.error(`commitments: ${path} is missing from the build — the partner compact must ship`);
    failures += 1;
    continue;
  }

  for (const { name, anyOf } of commitments) {
    if (!anyOf.some((re) => re.test(text))) {
      console.error(`commitments: ${path} no longer states "${name}"`);
      failures += 1;
    }
  }

  const amount = text.match(AMOUNT);
  if (amount) {
    console.error(
      `commitments: ${path} names an amount (${amount[0].trim()}) — sponsor pricing is unresolved (VIK-689)`,
    );
    failures += 1;
  }
}

if (failures > 0) {
  console.error(
    `\n${failures} commitment check(s) failed. These lines are quoted to community organisers in ` +
      `outreach; removing one makes a promise we made in writing untrue. If the wording changed ` +
      `deliberately, add the new phrasing to scripts/validate-commitments.ts — do not delete the check.`,
  );
  process.exit(1);
}

const total = Object.values(COMMITMENTS).reduce((n, c) => n + c.length, 0);
console.log(`commitments: ${total} partner-compact commitments intact across both locales`);
