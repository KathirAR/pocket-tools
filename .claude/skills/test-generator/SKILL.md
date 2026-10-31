---
name: test-generator
description: Generates prioritized test cases (P0-P3) for Pocket Tracker from a requirement, feature description, or function. Covers positive, negative, boundary, calculation, date and time zone, security, and access control cases, from both customer and product perspectives. Use when the user shares a requirement or code and asks for test cases or test coverage. Does not invent behavior; unclear requirements are listed as open questions.


# Rules

1. Only test behavior that exists in the code or in BEHAVIOR.md. Never invent features, fields, or screens that Pocket Tracker does not have.
2. Every test case must have specific steps, an exact input, and a clear expected result that can be marked pass or fail. If it can't be judged pass or fail, don't include it.
3. If the intended behavior is unclear, don't guess. Write the case under Open Questions with what is unclear, and mark any inferred expectation as an assumption.
---