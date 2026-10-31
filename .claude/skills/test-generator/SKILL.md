---
name: test-generator
description: Generates prioritized test cases (P0-P3) for Pocket Tracker from a requirement, feature description, or function. Covers positive, negative, boundary, calculation, date and time zone, security, and access control cases, from both customer and product perspectives. Use when the user shares a requirement or code and asks for test cases or test coverage. Does not invent behavior; unclear requirements are listed as open questions.
---

# Rules
1. Only test behavior that exists in the code or in BEHAVIOR.md. Never invent features, fields, or screens that Pocket Tracker does not have.
2. Every test case must have specific steps, an exact input, and a clear expected result that can be marked pass or fail. If it can't be judged pass or fail, don't include it.
3. If the intended behavior is unclear, don't guess. Write the case under Open Questions with what is unclear, and mark any inferred expectation as an assumption.
4. Smoke cases cover only the paths that must work on every build, where a failure means the feature is unusable. Give each feature area at most 3 Smoke cases.
5. Mark a case P0 only if its failure breaks a money calculation or loses or corrupts user data. Do not give P0 to more than about a quarter of the cases. Use P1 to P3 for the rest, and use P3 for cosmetic and low-impact cases.

# Scope
1. If the user names a whole tool, read its code and BEHAVIOR.md, then split it into feature areas, such as screens or groups of related functions.
2. List the areas you found before generating anything.
3. Cover one area at a time, each under its own heading, so every area can be reviewed on its own.
4. If the user names one function or feature, test only that.

# Output format
Return a table with one row per test case and these columns:

| ID | Priority | Suite | Category | Steps | Expected result | Assumption |

- ID: TC-001, TC-002, and so on.
- Priority: P0 (critical) to P3 (low).
- Suite : Smoke or Regression. Every smoke case should be part of a regression suite, but not every regression case is a smoke case.
- Category: positive, negative, boundary, calculation, date/time zone, security, or access.
- Steps: exact steps with exact input values.
- Expected result: one specific, checkable outcome.
- Assumption: what the code appears to intend, or "none" if BEHAVIOR.md states it.

After the table, add an "Open questions" list for anything unclear.

# Saving and returning results
1. Identify the target tool's folder from the user's request. If it's unclear, ask before generating anything.
2. Read <tool-folder>/BEHAVIOR.md if it exists. If not, infer expected behavior from the code and say so in the Assumption column.
3. Save results to <tool-folder>/<tool-folder>-test-cases.md, for example finance-tracker/finance-tracker-test-cases.md. Create it if missing.
4. Use one heading per function or feature. Append new cases under the matching heading, and create the heading if it's missing.
5. Never overwrite or delete existing test cases. Skip any case that already exists, and report how many were skipped.
6. Label each new section with the date and "Status: unreviewed".
7. Never commit or push. Tell the user which file changed, so they can review it and commit it themselves.
8. In the reply, give the file path, the number of cases added and skipped, and the open questions.