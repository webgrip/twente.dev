import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';

type Step = { run?: string; env?: Record<string, string> };
type Job = { needs?: string | string[]; if?: string; steps?: Step[] };
type Workflow = { on: Record<string, unknown>; jobs: Record<string, Job> };

const workflow = (name: string): Workflow =>
  parse(
    readFileSync(new URL(`../../.forgejo/workflows/${name}`, import.meta.url), 'utf8'),
  ) as Workflow;

const pullRequest = workflow('on_pull_request.yml');
const sourceChange = workflow('on_source_change.yml');
const gate = pullRequest.jobs.gate!;
const gated = [gate.needs ?? []].flat();
const advisory: string[] = [];

test('the pull request workflow runs on pull requests and on command only', () => {
  assert.deepEqual(Object.keys(pullRequest.on).sort(), ['pull_request', 'workflow_dispatch']);
});

test('every pull request check is the push run check of the same name, so both verify the same thing', () => {
  for (const [name, job] of Object.entries(pullRequest.jobs)) {
    if (name === 'gate') continue;
    assert.deepEqual(job, sourceChange.jobs[name], `${name} drifted from on_source_change.yml`);
  }
});

test('a pull request deploys and releases nothing and reads no secret', () => {
  assert.doesNotMatch(JSON.stringify(pullRequest), /secrets\.|cloudflare-deploy|semantic-release/);
});

test('the gate waits for every pull request job except the advisory ones, even after one failed', () => {
  const expected = Object.keys(pullRequest.jobs).filter(
    (name) => name !== 'gate' && !advisory.includes(name),
  );
  assert.deepEqual(
    [...gated].sort(),
    expected.sort(),
    'a new pull request job joins the gate, or is named advisory here',
  );
  assert.equal(gate.if, 'always()');
});

test('the gate passes only when each job it waits for succeeded', () => {
  const step = gate.steps!.find((candidate) => candidate.run)!;
  assert.equal(step.env?.NEEDS, '${{ toJSON(needs) }}');
  const exitCode = (needs: unknown): number | null =>
    spawnSync('bash', ['-eo', 'pipefail', '-c', step.run!], {
      env: { ...process.env, NEEDS: JSON.stringify(needs, null, 2) },
      encoding: 'utf8',
    }).status;
  const result = (value: string) => ({ result: value, outputs: {} });
  const every = (value: string) => Object.fromEntries(gated.map((name) => [name, result(value)]));
  assert.equal(exitCode(every('success')), 0);
  for (const outcome of ['failure', 'cancelled', 'skipped']) {
    assert.equal(
      exitCode({ ...every('success'), [gated[0]!]: result(outcome) }),
      1,
      `a ${outcome} job fails the gate`,
    );
  }
  assert.equal(exitCode({}), 1, 'no results fail the gate');
  assert.equal(
    exitCode({
      ...every('success'),
      [gated[0]!]: { result: 'success', outputs: { note: '"result": "failure"' } },
    }),
    0,
    'an output that quotes a result is not a result',
  );
});
