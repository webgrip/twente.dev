import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const REGISTER = 'docs/brand/copy/plakplekken.yml';

interface Plakplek {
  id: string;
  status: string;
  url: string | null;
  notitie?: string;
  bron: string;
  laatst_gesynct?: string;
  eigenaar: string;
}

function laatsteWijziging(pad: string): Date | null {
  const uit = execFileSync('git', ['log', '-1', '--format=%cI', '--', pad], {
    encoding: 'utf8',
  }).trim();
  return uit.length > 0 ? new Date(uit) : null;
}

const plekken = parse(await readFile(REGISTER, 'utf8')) as Plakplek[];
const verlopen: string[] = [];
const zonderAccount: string[] = [];

for (const plek of plekken) {
  if (plek.status !== 'live') {
    zonderAccount.push(plek.id);
    continue;
  }
  const gewijzigd = laatsteWijziging(plek.bron);
  if (!gewijzigd) continue;
  const gesynct = plek.laatst_gesynct ? new Date(plek.laatst_gesynct) : null;
  if (!gesynct || gewijzigd > gesynct) {
    const dagen = gesynct
      ? Math.round((gewijzigd.getTime() - gesynct.getTime()) / 86_400_000)
      : null;
    verlopen.push(
      `${plek.id} (${plek.url ?? plek.notitie ?? 'geen URL'}) — ${plek.bron} is ` +
        `${dagen === null ? 'nooit gesynct' : `${dagen} dag(en) nieuwer`}, eigenaar ${plek.eigenaar}`,
    );
  }
}

if (zonderAccount.length > 0) {
  console.log(
    `copy-drift: ${zonderAccount.length} plek(ken) zonder account: ${zonderAccount.join(', ')}`,
  );
}

if (verlopen.length === 0) {
  console.log('copy-drift: elke live plakplek is bij');
  process.exit(0);
}

console.log(`\ncopy-drift: ${verlopen.length} plakplek(ken) opnieuw plakken:\n`);
for (const regel of verlopen) console.log(`  ${regel}`);
