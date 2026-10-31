# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pocket-tools** is a collection of small, single-file web tools. Each tool is a self-contained HTML/CSS/JavaScript application that lives in its own folder.

Current tool: **Finance Tracker** (`finance-tracker/`) — a personal finance tracker with Google authentication, cloud sync via Firebase, and local storage fallback.

## Finance Tracker: Architecture

### Data Model
- **Expenses**: Array of {id, amount, category, description, date, refundAmount}
- **Categories**: Array of {name, color} for expense categorization
- **Monthly Records**: Array of {month, income, savingsBalance, investBalances, investContribution} for tracking net worth over time
- **Investment Types**: Array of {name, color} — drives the Investment Allocation chart
- **Debts & Goals**: Simple arrays of {id, name, balance} and {id, name, target, current}
- **Profile**: {age, retireAge, income, inflation} — drives all calculations and guidance
- **Targets**: {savings, invest} — optional custom monthly targets; falls back to auto-suggested (50/30/20 rule)
- **Settings**: {dark} — persists dark mode preference

### Storage & Sync Architecture
- **Local**: All data cached in `localStorage` (keys: `ft.expenses`, `ft.categories`, etc.) via `safeGet()` / `safeSet()` wrapper that falls back to in-memory object if localStorage unavailable
- **Cloud**: Firebase Firestore (`financeTrackerUsers` collection, keyed by user.uid) syncs entire state object on ~700ms debounce after any change
- **Auth**: Firebase Google OAuth — login gate blocks entire app until authenticated
- **Sync indicator**: Dot in top-right (green = synced, orange = syncing)

### UI & Tabs
Six tabs, all in a single `index.html`:
1. **Dashboard**: Net worth, emergency fund, retirement corpus, yearly summary, charts (net worth trend, income vs expense, category spending, investment allocation), auto-generated guidance
2. **Expenses**: Add/edit transactions, categories, budget, CSV import, transaction list (filterable by date range, searchable, sortable)
3. **Savings & Investments**: Monthly records, gold quick-add (splits expense/investment), investment types, monthly targets, history table
4. **Debts & Goals**: Add/edit debts, savings goals with progress bars
5. **Profile & Targets**: Age, retirement age, income, inflation rate; displays resulting guidance
6. **Settings**: Dark mode, backup export/restore (JSON), erase all data (confirmation required)

### Key Behaviors (Defined in BEHAVIOR.md)
- **Refunds**: Refunded amount excluded from totals, budget, and charts. Partial refunds allowed.
- **Budget**: Orange at 80%, red once spending > budget. Applies only to current month.
- **Net worth**: savings + investments - debts
- **Monthly records**: Holds total balances (not amounts added); changes calculated against previous month
- **Market growth**: If "amount invested this month" filled in, rest of balance increase = market growth
- **Emergency fund**: 6 × average monthly spending (from expense history or income × 0.5 if no history)
- **Retirement corpus**: 25 × annual expenses, shown in today's money and inflation-adjusted
- **Gold quick-add**: Splits bill — % to Expenses (Jewellery category), rest to Gold investment balance
- **Category deletion**: Past expenses moved to "Other"
- **CSV import**: Columns are date, category, description, amount (with/without header)

### Code Organization (in index.html)
1. **Storage keys** (top): `STORAGE_KEY`, `CAT_KEY`, etc.
2. **Default data**: `DEFAULT_CATEGORIES`, `DEFAULT_INVEST_TYPES`
3. **Firebase setup**: Config, auth listener, cloud sync functions
4. **Data loading**: `loadFromCloud()`, `resetStateToDefaults()`, `cacheAllLocally()`
5. **Utility functions**: `fmt()`, `fmt2()` (formatting), `uid()` (ID gen), `todayStr()`, `currentMonthStr()`, `prevMonthStr()`
6. **Feature modules**: Categories, investments, expenses (add/edit/refund/CSV), budget, monthly records, debts, goals, profile, settings, dashboard (charts, calculations)
7. **UI rendering**: `render*()` functions update DOM for each feature
8. **Modal & form handling**: Edit modal, refund prompt, form validation
9. **Chart.js integration**: Four charts (net worth trend, income/expense bars, category doughnut, investment allocation pie)

## Test Generation Workflow

Use the **test-generator skill** to generate E2E test cases:

1. **Define behavior**: Create or verify `BEHAVIOR.md` in the tool folder with intended behavior for the feature
2. **Run skill**: Invoke `/test-generator` with feature name (e.g., "Expenses: Refunds")
3. **Output**: Test cases saved to `<tool>/finance-tracker-test-cases.md` with columns:
   - ID, Priority (P0-P3), Suite (Smoke or Regression), Category (positive/negative/boundary/calculation/etc.), Steps, Expected result, Assumption
4. **Smoke suite**: Max 3 critical happy-path cases per feature (must pass every build)
5. **P0 priority**: Only for money calculations or data loss/corruption (~25% of cases)
6. **Open questions**: List clarifications needed on behavior intent

### Test Case Rules (from SKILL.md)
- Only test behavior that exists in code or BEHAVIOR.md — never invent
- Every case must have exact steps, exact inputs, and specific checkable outcomes
- Mark cases P0 only if failure breaks a money calculation or loses/corrupts data
- Smoke cases are critical happy paths only (no negative/boundary cases in Smoke)
- Before generating, list distinct behaviors; write the minimal set of cases covering each

## Development Notes

### No build/lint/test commands
This is a single-file HTML app designed to run directly in a browser. No build step, no npm, no linting or test runner. To develop:
- Open `finance-tracker/index.html` in a web browser to test locally
- Edit directly in the HTML file
- Use `localStorage` + browser DevTools to inspect data
- Test against Firebase Firestore for cloud sync behavior

### Firebase Credentials
Firebase config is inline in the HTML (public config for client-side auth, not a secret). Project is `pocket-finance-tracker-c1386`.

### Refund UI Details
The ↩ button (refund) appears on hover over transactions. Opens a prompt asking for refund amount. Refund amount is stored in `expense.refundAmount`. UI shows original amount struck-through with net amount below.

### Date Handling
All dates are ISO format (YYYY-MM-DD), stored as strings. Month strings are YYYY-MM. No timezone conversion — dates assumed in user's local timezone.

### Adding New Features
- Update `BEHAVIOR.md` with intended behavior
- Add UI (form fields, buttons) to relevant tab in the HTML
- Add data structure (new field or array) in the storage section
- Add save function (e.g., `saveExpenses()`) to persist to cloud
- Add render function (e.g., `renderExpenses()`) to update UI
- Generate test cases with `/test-generator` skill

### CSV Import Format
Expected columns: date, category, description, amount. With or without header. Dates must be YYYY-MM-DD. Unrecognized dates and non-numeric amounts are skipped with a toast showing count.

## Project Rules

- **Never commit or push**: Tell the user which files changed so they can review and commit
- **Use sample data only**: No real personal or financial data in the codebase
- **No secrets in code**: No API keys, tokens, credentials in files or prompts
- **Test case labeling**: Generated cases must be labeled with date and "Status: unreviewed" until reviewed
- **Test case integrity**: Never invent behavior the code doesn't have; use BEHAVIOR.md as source of truth
- **Open questions**: When unsure what code does, list it as an open question rather than guessing