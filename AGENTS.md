# Agent guide — twente.dev

The architecture is in [`README.md`](README.md) and the decisions are in [`docs/adrs/`](docs/adrs/);
neither is repeated here. This file carries what an agent cannot derive from the code: the board
contract, and the handful of repo rules that look like style choices but are load-bearing.

## Board contract (vikunja-product-owner)

- MCP server: `vikunja` · project: `twente.dev` (**id 50**, created 2026-08-12) · instance list cap
  (maxitemsperpage): 250
- Ticket prefix: `VIK` (commit trailers `VIK-<taskID>`; bare Vikunja task URLs autolink in Forgejo)
- Labels — **the board is authoritative, not this file.** Enumerate with `labels_list` before
  applying any; only the _dimensions_ below are contract. Labels are shared instance-wide with the
  Webgrip infra boards, so a new value costs every board:
  - `theme/<kebab>` — one per ticket. This project introduced `theme/infra`, `theme/content`,
    `theme/external-service`, `theme/trust-safety`, `theme/event-ops`, `theme/seo`, `theme/a11y`,
    `theme/docs`, `theme/contribution`, and reuses the pre-existing `theme/ci-cd`.
  - `repo/twente.dev` — every ticket, following the instance's `repo/*` convention
  - `impact/H|M|L`
  - **3D estimation**: `effort/S|M|L` · `time/hours|days|weeks` · `uncertainty/low|med|high`
    (`high` ⇒ never `agent-ready` — spike first)
  - `do-next` (≤10) · `ready` / `needs-refinement` / `review` / `agent-ready` · `agent/<name>`
  - If no existing `theme/*` fits, that is a taxonomy decision for a human — raise it; do not
    create a label to unblock a write.
- **Stages live in the Kanban buckets of view 145** (ratified 2026-09-04, replacing the earlier
  label-derived rule): Backlog · To refine · To estimate · To do · Doing · Blocked · In review ·
  Done. The bucket is the status; `ready` / `review` / `needs-refinement` / `agent/<name>` survive
  as taxonomy but no longer define the stage. **DoD**: an evidence comment proving (1) _deployed_ —
  verified against real state, not a proxy — and (2) _monitored_ — names the signal that would
  catch regression, or why none applies.
- **Pick-up order**: the project description carries a `Pick-up queue` — ordered
  `VIK-<id> — title`, top picked up first. The MCP has no position API, so raw drag-order is not
  the queue.
- Top-up ground truth: `git log --oneline <last-sweep>..HEAD` · `just check` ·
  `pnpm validate:content` · `curl` against the live site · audit dimensions: launch-tracker dates ·
  CI/DX · content honesty · a11y/SEO
- **Buckets and Gantt dates need the REST API — the MCP cannot reach them.** `task_update` exposes
  no `startDate`/`endDate` and nothing assigns a bucket, so use
  `https://vikunja.webgrip.dev/api/v1` with the same `$VIKUNJA_API_TOKEN`: `POST /tasks/<id>` for
  dates, `POST /projects/50/views/145/buckets/<bucketId>/tasks` with `{"task_id": n}` to move one.
  **A partial `POST /tasks/<id>` silently blanks every field you omit** — description, due date and
  priority all went empty once. Always GET the task, patch the fields you want, POST the whole
  object back.
- Web base for cross-references: `https://vikunja.webgrip.dev/tasks/<id>`
- Instance ops (token rotation, 401s, bridge 503s):
  [`homelab-cluster` runbooks/mcp-vikunja.md](https://forgejo.webgrip.dev/webgrip/homelab-cluster)

### MCP gotchas that cost time on 2026-08-12

- **Client auth required since 2026-08 (server v1.0.0)**: every tool call needs
  `Authorization: Bearer <vikunja-api-token>` — `No token` back means the header never
  arrived. The plugin's `.mcp.json` expands `${VIKUNJA_API_TOKEN}` from the environment;
  export it before launching Claude Code. Token minting/rotation: the ops runbook below.
- **List responses are multi-line blocks**, not one line per entity. Parsing `[ID: n]` off the
  title line silently returns nothing.
- **Pseudo-projects report negative ids** (`[ID: -2]`). A parser matching only `\d+` skips that
  block and steals the _next_ one's id, shifting every later row onto the wrong entity.
- **`task_get` does not render relations.** Auditing relations from its output reports every one
  as missing. Probe with `relation_create` instead: a 409 "already exists" is the proof.
- **The bridge 503s mid-run** (supergateway stateless mode dies when any client hangs up early;
  it self-recovers). Re-`init()` and retry on 404/410/503, keep client timeouts ≥ 120 s, and never
  run parallel sweeps — one 60 s-timeout bulk sweep took the bridge down for every session once.
- `labels_bulk_set_on_task` **replaces** the whole label set. Deletes are soft: `task_delete`
  completes, `project_delete` archives.

### Reading Forgejo Actions logs from a script

The REST API exposes runs but **not** job logs — `/api/v1/.../actions/runs/{n}/jobs` and every
`.../logs` variant 404 even with a valid token. The UI's own endpoint works, and it is a POST:

```bash
curl -X POST -H "Authorization: token $TOKEN" -H "Content-Type: application/json" \
  -d '{"logCursors":[{"step":7,"cursor":0,"expanded":true}]}' \
  "https://forgejo.webgrip.dev/webgrip/twente.dev/actions/runs/<run>/jobs/<jobIdx>/attempt/1"
```

Three things that make it fail silently: `attempt` is **1-based** (omitting it gives
`task with job_id … and attempt 0: resource does not exist`), `jobIdx` is the job's **0-based
position in the run** (not the id from the tasks API — POST with no `logCursors` to enumerate
titles), and the output lands in `logs.stepsLog[].lines[].message`, not `streamingLogs`.
Run metadata (which job failed) is public; log bodies need the token.

## Repo rules that are load-bearing

- **Comments are NOT allowed.** Always communicate intent with code: a precise name, a type, a
  smaller function, a test that states the case. A comment is a failure. This holds for every
  language in the repo, prose in YAML and TOML included. Machine-read directives stay, because the
  toolchain acts on them as syntax: `// @ts-check`, `eslint-disable`, `<!-- prettier-ignore -->`,
  `# syntax=`, `# renovate:`, `# yaml-language-server:`, and shebangs. Doc-comment forms the
  toolchain itself reads are not comments either and stay: godoc directly above an exported
  identifier, rustdoc `///` and `//!`, and PHPDoc blocks carrying type tags. Anything that outlives
  a single expression belongs in `docs/` or an ADR, where it gets reviewed, linked and kept
  current. The estate decision is
  [ADR 0006](https://forgejo.webgrip.dev/webgrip/workflows/src/branch/main/docs/adrs/0006-no-comments-in-code.md).
- **Never build a URL by swapping a locale prefix.** Route _segments_ are localized
  (`/nl/bedrijven` ↔ `/en/companies`), so `/en/bedrijven` does not exist. Always go through
  `routePath()` / `alternatesFor()` in [`src/i18n/routes.ts`](src/i18n/routes.ts).
- **A missing translation is a compile error**, not a runtime fallback — `en` is typed against `nl`
  in [`src/i18n/ui.ts`](src/i18n/ui.ts). Add a key to one half, add it to both.
- **Never invent content.** Entries in `src/content/` attributed to real regional organisations
  must come from the contribution pipeline. Fixtures carry `fixture: true` and must be gone before
  launch — see [`src/content/README.md`](src/content/README.md).
- **`uses:` must be the `org/repo/path@sha` shorthand**, never a full `https://` URL: Forgejo
  resolves the called workflow's `runs-on` server-side, and a full URL leaves the job queued
  forever with an empty label list.
- **`actions/checkout@v5`, never `@v6`** — v6 is broken on non-GitHub runners.
- **`pnpm exec wrangler`, never `pnpm dlx`** — dlx installs into a throwaway project that never
  sees `pnpm-workspace.yaml`'s allowBuilds, so pnpm's build-scripts guard prompts interactively
  for esbuild/workerd and a CI job hangs forever.
- **wrangler.toml: the `routes` key stays above the first `[table]` header**, and
  `workers_dev = false` without a route is a green deploy and a dead site — every path 522s while
  `/robots.txt` serves Cloudflare's managed default.
- **`compressHTML` stays off** (whitespace-eating bug), and
  `build.format: 'file'` pairs with wrangler's `html_handling = "auto-trailing-slash"` — change
  either half alone and clean URLs break.
- **The CI runner's docker is a sibling, not a child.** Published ports and bind mounts resolve in
  the host namespace where the checkout does not exist; share a network namespace or `docker cp`
  (see `efa10df`).
- Facts about the flagship edition live only in [`src/config/site.ts`](src/config/site.ts). A
  `null` there is deliberate — components render an honest pre-launch state instead of a dead link.
- Secrets go through SOPS or the Forgejo secret store, never into a workflow, config file or
  committed `.env` (`guard-secrets` skill).

## Current state (dated — update when it drifts)

_2026-09-04._ Launch tracking lives in
[`docs/plan/playbook-alignment.md`](docs/plan/playbook-alignment.md); which plan doc is
authoritative for what: [`docs/plan/README.md`](docs/plan/README.md). CI runs through the shared
static-site lanes in `webgrip/workflows` (v2.1.0); the copied toolchain configs are being replaced
by the `@webgrip/*` packages (VIK-813). Several sessions share this working tree: commit by
pathspec, and a local commit can be pushed by a peer at any time.
