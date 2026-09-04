import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';
import { readFileSync } from 'node:fs';

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
