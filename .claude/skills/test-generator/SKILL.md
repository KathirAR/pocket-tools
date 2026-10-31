---
name: test-generator
description: Generates prioritized test cases (P0-P3) for Pocket Tracker from a requirement, feature description, or function. Covers positive, negative, boundary, calculation, date and time zone, security, and access control cases, from both customer and product perspectives. Use when the user shares a requirement or code and asks for test cases or test coverage. Does not invent behavior; unclear requirements are listed as open questions.
---

# Rules
1. Only test behavior that exists in the code or in BEHAVIOR.md. Never invent features, fields, or screens that Pocket Tracker does not have.
2. Every test case must have specific steps, an exact input, and a clear expected result that can be marked pass or fail. If it can't be judged pass or fail, don't include it.
3. If the intended behavior is unclear, don't guess. Write the case under Open Questions with what is unclear, and mark any inferred expectation as an assumption.

# Output format
Return a table with one row per test case and these columns:

| ID | Priority | Category | Steps | Expected result | Assumption |

- ID: TC-001, TC-002, and so on.
- Priority: P0 (critical) to P3 (low).
- Category: positive, negative, boundary, calculation, date/time zone, security, or access.
- Steps: exact steps with exact input values.
- Expected result: one specific, checkable outcome.
- Assumption: what the code appears to intend, or "none" if BEHAVIOR.md states it.

After the table, add an "Open questions" list for anything unclear.