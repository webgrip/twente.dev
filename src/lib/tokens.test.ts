import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';
import { readFileSync } from 'node:fs';

/**
 * The dark palette exists twice in tokens.css by CSS necessity: once under
 * `@media (prefers-color-scheme: dark)` and once under `[data-theme='dark']`
 * so the manual toggle beats the OS preference in both directions. The two
 * blocks must stay character-identical or the toggle and the OS preference
 * silently diverge — exactly the drift class the file's header warns about.
 * CSS cannot express "same declarations in two scopes"; this test can.
 */

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');

function declarationsOf(block: string): string[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('--') || line.startsWith('color-scheme'))
    .sort();
}

function extractBlock(afterMarker: string): string {
  const start = css.indexOf(afterMarker);
  assert.notEqual(start, -1, `marker not found: ${afterMarker}`);
  const open = css.indexOf('{', start + afterMarker.length);
  // Find the matching close brace for the *inner* rule body.
  let depth = 1;
  let i = open + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') depth--;
    i++;
  }
  return css.slice(open + 1, i - 1);
}

describe('tokens.css dark palette', () => {
  test('media-query block and [data-theme=dark] block declare identical tokens', () => {
    const mediaBlock = extractBlock('@media (prefers-color-scheme: dark) {\n  :root');
    const toggleBlock = extractBlock(":root[data-theme='dark']");
    assert.deepEqual(
      declarationsOf(mediaBlock),
      declarationsOf(toggleBlock),
      'the two dark blocks in tokens.css have drifted apart — every token change must land in both',
    );
  });
});
