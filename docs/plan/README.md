# Plan documents — status ledger

The planning history is a chain, not one document. This ledger says which doc is authoritative
for what; the chain itself is the record and does not get rewritten.

| Document                                         | Status                                                        | Authoritative for                                 |
| ------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------- |
| [`playbook-alignment.md`](playbook-alignment.md) | **live tracker**                                              | current launch state, open gaps, verified facts   |
| [`10x-plan.md`](10x-plan.md)                     | partially superseded (ADR-0008, ADR-0009, playbook-alignment) | original levers and rationale; historical context |
| `code14-call-briefing.md` (local only)           | point-in-time briefing                                        | the Code14 venue conversation, as prepared        |

A new plan document gets a row here in the same commit that creates it.
