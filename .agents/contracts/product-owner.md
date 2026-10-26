# Board contract — twente.dev

The repo contract layer of the product-owner-contract skill: ids and small facts for this
repository's Vikunja project. The skill reads this file on board work; it is not loaded into
every agent session.

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
