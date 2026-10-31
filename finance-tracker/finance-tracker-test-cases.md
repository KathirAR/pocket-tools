# Finance Tracker E2E Test Cases

Generated: 2026-10-31 | Status: unreviewed

---

## Authentication & Login

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-001 | P0 | positive | Click "Sign in with Google" button → complete Google sign-in flow with a test account → observe app behavior | Login overlay closes, app root displays with user name and photo in top-right user bar, and Dashboard tab is active | App requires Google authentication gate before showing main interface |
| TC-002 | P0 | positive | User is logged in → click "Sign out" button in user bar → confirm logout in modal dialog | User is logged out, login overlay displays again, all app data is cleared from view, sync dot disappears | Sign-out requires user confirmation |
| TC-003 | P1 | access | Close browser tab and reopen the app URL while still logged in to Google → observe page load | User is automatically re-authenticated without manual sign-in, Dashboard displays with their saved data, user bar shows their profile | Cloud sync loads user data on auth state change |
| TC-004 | P0 | security | Load the app in a private/incognito browser window → attempt to access app without Google sign-in | Login overlay remains visible, no data is accessible until user signs in | App blocks all functionality behind authentication gate |
| TC-005 | P2 | negative | Start sign-in but close the Google sign-in popup before completing → observe app state | Sign-in button becomes enabled again, login message returns to original text, app remains on login screen | Failed sign-in is handled gracefully |

---

## Dashboard

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-006 | P0 | positive | Log in with a profile (age 30, retirement age 60, income ₹100,000, inflation 6%) and monthly records with savings ₹500,000 and investments ₹300,000 and debts ₹100,000 → view Dashboard | Net Worth displays ₹700,000 (500k + 300k - 100k), stat cards show "Savings + Investments − Debts" label | Net worth = savings + investments - debts |
| TC-007 | P0 | calculation | Save profile with age 30, retirement 60, income ₹100,000 → save monthly record with income ₹100,000 and no savings/investment/debt records yet → view Dashboard | Emergency fund target displays "6 × ₹66,667 (average monthly spending) = ₹400,000" or similar message indicating 0% progress | Emergency fund = 6x avg monthly spending; if no expenses exist, use profile income * 0.5 as fallback |
| TC-008 | P0 | calculation | Save profile with age 30, income ₹100,000, retirement 60, inflation 6% → view Dashboard retirement corpus card | Retirement corpus shows "25 × ₹1,200,000 (annual expenses) = ₹30,000,000 (today's money)" and inflation-adjusted future amount | Retirement = 25x annual expenses, shown in today's money and inflation-adjusted |
| TC-009 | P1 | positive | Add 3 months of expenses (Jan ₹10k, Feb ₹12k, Mar ₹11k) and 3 monthly records (Jan savings ₹50k, Feb ₹55k, Mar ₹60k) → view Dashboard Net Worth Trend chart | Line chart displays 3 data points with savings trending up and net worth calculated correctly for each month | Dashboard charts render monthly data trends |
| TC-010 | P1 | positive | Add monthly records for 6 months with varying income and expenses → click "6M" filter on "Income vs Expense vs Savings" chart → then click "12M" | Chart updates to show last 6 months, then updates to show 12 months; bar chart displays all periods | Dashboard income/expense chart is filterable by time window |
| TC-011 | P0 | positive | Add expenses for March (Food ₹5k, Transport ₹2k, Other ₹1k) → view Dashboard "This Month's Spending by Category" doughnut chart | Doughnut chart displays 3 slices with colors and percentages: Food (≈55%), Transport (≈22%), Other (≈11%) | Dashboard category breakdown is based on current calendar month |
| TC-012 | P1 | positive | Add monthly record with investment balances (Equity ₹200k, Debt/FD ₹100k, Gold ₹50k) → view Dashboard "Investment Allocation" pie chart | Pie chart shows 3 slices with correct percentages and a total of ₹350k displayed | Investment allocation pie is built from latest monthly record |
| TC-013 | P0 | positive | Add 12 months of records with income ₹100k each month → view Dashboard "Yearly Summary" table | Table displays one row per calendar year with Year, Income (₹1.2M), Expenses (total from that year), Saved+Invested (calculated), with delete buttons per row | Yearly summary aggregates monthly records and expenses by calendar year |
| TC-014 | P1 | positive | Save profile with guidance criteria (age 25, income ₹150k, average monthly spending ₹20k) → view Dashboard Guidance card | Card displays auto-generated advice items based on age and spending rules (e.g., "Your emergency fund is low" or "You're saving well") | Dashboard generates guidance from profile and expense history |
| TC-015 | P2 | boundary | Save profile with minimum values (age 15, retirement 30, income ₹0, inflation 0%) → view Dashboard | All stats display without errors, calculations show 0 where income-dependent | Minimum profile values are handled gracefully |
| TC-016 | P2 | boundary | Save profile with maximum values (age 100, retirement 100, income ₹10,000,000, inflation 50%) → view Dashboard | All stats display with large numbers formatted correctly, retirement corpus shows massive inflation-adjusted amount | Maximum profile values don't cause calculation errors |

---

## Expenses: Add & Edit

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-017 | P0 | positive | Go to Expenses tab → enter Amount: 500, Category: Food, Description: "Groceries", Date: today → click "Add Expense" | Toast shows "✓ Expense added", form clears, total amount on right updates to include ₹500, transaction appears in list | Expenses are added to storage and UI updates immediately |
| TC-018 | P1 | positive | Add expense with amount ₹0.01 → view transaction list | Expense is added and displays as "₹0.01" | Very small decimal amounts are supported |
| TC-019 | P1 | positive | Add expense with amount ₹9,999,999.99 → view transaction | Expense is added and displays formatted with thousands separator | Large amounts are formatted correctly |
| TC-020 | P0 | negative | Go to Expenses tab → leave Amount blank → click "Add Expense" | Toast shows "⚠ Please enter a valid amount.", expense is not added | Amount field is required |
| TC-021 | P0 | negative | Enter Amount: -500 → click "Add Expense" | Toast shows "⚠ Please enter a valid amount.", expense is not added | Negative amounts are rejected |
| TC-022 | P0 | negative | Enter Amount: 500, Category: (empty) → attempt to click "Add Expense" | Category dropdown always has a default selected (first category), expense can be added | Category is required with default selection |
| TC-023 | P1 | positive | Add expense with Description: "" (leave blank) → view transaction | Transaction displays "(no description)" | Empty description is replaced with placeholder text |
| TC-024 | P0 | positive | Add expense with Date: "2025-12-31" (past date) → view Transactions with "All Time" range selected | Expense appears in the transaction list | Past dates are allowed |
| TC-025 | P1 | positive | Add expense with today's date → click "Today" filter → expense displays; switch to "This Week" and expense still displays | Expense is filtered correctly into both Today and This Week ranges | Date filtering works correctly for today and week ranges |
| TC-026 | P0 | positive | Add expense on 2026-10-15 → go to Expenses → view transaction sorted "Newest first" → the newest (today's) expense appears first | Newer expenses appear above older ones | Default sort order is newest first |
| TC-027 | P1 | positive | Add 3 expenses with amounts ₹100, ₹500, ₹50 → sort by "Amount: high to low" | Expenses display in order: ₹500, ₹100, ₹50 | Amount sort works in both directions |
| TC-028 | P0 | positive | Add expense, then hover over it in transaction list → Edit and Delete buttons become visible → click Edit button → modal opens with pre-filled data | Modal shows "Edit Expense" title and all fields match the original expense (Amount, Category, Description, Date, Refund field) | Edit modal pre-fills with current expense data |
| TC-029 | P0 | positive | Open edit modal for an expense → change Amount to ₹750, Category to "Transport" → click "Save" → close modal | Toast shows "✓ Expense updated", transaction list updates, total amount reflects new value | Edited expenses persist and UI updates |
| TC-030 | P0 | negative | Open edit modal → clear Amount field → click "Save" | Toast shows "⚠ Please enter a valid amount.", modal stays open | Validation is enforced in edit mode |
| TC-031 | P1 | negative | Open edit modal → enter Amount ₹500, Refund ₹600 (more than original) → click "Save" | Toast shows "⚠ Refund can't be more than the original amount.", modal stays open | Refund validation prevents refunds exceeding original amount |
| TC-032 | P1 | positive | Open edit modal → cancel with Cancel button → modal closes without saving | No changes are made to the expense | Cancel discards unsaved edits |

---

## Expenses: Refunds

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-033 | P0 | positive | Add expense ₹1000 (Food) → hover and click ↩ button → prompt shows "Refund amount for [description]" → enter ₹1000 → confirm | Toast shows "✓ Refund recorded", transaction shows original ₹1000 struck through and net ₹0 below, total excludes this amount | Full refund records original amount struck through with ₹0 net amount |
| TC-034 | P1 | positive | Add expense ₹1000 → click ↩ → enter ₹400 (partial refund) → confirm | Transaction shows struck through ₹1000 and net ₹600, total is reduced by ₹400, pie chart excludes the ₹400 | Partial refunds reduce the net amount by the refund value |
| TC-035 | P0 | negative | Add expense ₹1000 → click ↩ → enter ₹1500 (more than original) | Toast shows "⚠ Refund can't be more than the original amount." | Refund validation prevents amounts exceeding original |
| TC-036 | P1 | positive | Add expense ₹500 with refund ₹200 → set currentRange to "month" with budget ₹1000 → total displayed should be ₹300 (not ₹500) | Budget progress bar and totals exclude refunded amounts | Refunds are excluded from budget calculations |
| TC-037 | P1 | positive | Add 3 expenses totaling ₹1000, record 1 refund of ₹200 → view "By Category" breakdown → pie chart total excludes the ₹200 | Category breakdown total is ₹800 (net after refund) | Refunds are excluded from category breakdowns |
| TC-038 | P1 | positive | Add expense with refund ₹100 → open Edit modal → Refund field shows "100" | Edit modal displays refund amount | Edit modal shows current refund value |
| TC-039 | P0 | positive | Add expense with refund ₹200 → click ↩ again → change refund to ₹300 (partial return) → confirm | Transaction updates to show net ₹700, total adjusts | Clicking ↩ again allows editing the refund amount |
| TC-040 | P1 | positive | Add expense ₹500 → click ↩ → enter ₹500 → confirm → view transaction list with date-based grouping → day total excludes the ₹500 | Day header total is ₹0 (or excludes this transaction if there are others) | Refunded amounts are excluded from day totals |

---

## Expenses: Categories

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-041 | P0 | positive | Go to Expenses tab → add new category "Entertainment" → view category chips | New category appears in the category chip list below "Categories" card with a color-coded chip | Categories are added and visible in chip list |
| TC-042 | P0 | positive | Add custom category → view Expenses "Add Expense" dropdown → new category appears in the Category select options | Custom category is selectable in the dropdown | New categories appear in expense form dropdown |
| TC-043 | P0 | negative | Try to add category with blank name → click + button | No category is added, no change in chip list | Empty category names are rejected |
| TC-044 | P0 | negative | Add category "Food" → try to add another "Food" (case-insensitive) → attempt to add | Toast shows "⚠ Category already exists.", duplicate is not added | Duplicate categories (case-insensitive) are rejected |
| TC-045 | P0 | positive | Add expenses in categories "Food" (₹500) and "Transport" (₹300) → remove "Food" category → confirm removal dialog → view category chips | "Food" category is gone, expenses are moved to "Other" category, total for "Other" is ₹500 | Removing a category moves its expenses to "Other" |
| TC-046 | P1 | positive | Remove "Food" category with expenses → view "By Category" breakdown → "Other" shows ₹500 | Category breakdown includes the moved expenses under "Other" | Moved expenses appear in "Other" category in breakdown |
| TC-047 | P0 | negative | Try to remove the last remaining category → error or confirmation dialog appears | Toast shows "⚠ You need at least one category.", category is not removed | App requires at least one category |
| TC-048 | P1 | positive | Add custom category "Shopping" → add expense → remove "Shopping" → the expense now shows category "Other" in transaction list | Transaction category label updates to "Other" | Category changes are reflected in transaction list |

---

## Expenses: CSV Import

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-049 | P0 | positive | Create CSV file with header and 3 rows: (date, category, description, amount) + (2026-10-15, Food, Lunch, 200) + (2026-10-16, Transport, Taxi, 150) + (2026-10-17, Food, Dinner, 300) → import file | Toast shows "✓ Imported 3 expenses", expenses appear in transaction list | CSV import with header row works correctly |
| TC-050 | P0 | positive | Import CSV without header row: (2026-10-15, Food, Lunch, 200) + (2026-10-16, Transport, Taxi, 150) → check transaction list | Toast shows "✓ Imported 2 expenses", expenses are added | CSV import without header row is supported |
| TC-051 | P1 | positive | Import CSV with amounts containing decimals: (2026-10-15, Food, Lunch, 200.50) → view expense | Expense displays "₹200.50" | Decimal amounts in CSV are parsed correctly |
| TC-052 | P0 | negative | Import CSV with 4 rows where one row has only 2 columns → check import result | Toast shows "✓ Imported 3 expenses, skipped 1", only valid rows are added | Invalid rows (missing columns) are skipped |
| TC-053 | P0 | negative | Import CSV with invalid date format (e.g., "15/10/2026" instead of "2026-10-15") in one row → result | Toast shows skip count for invalid date rows | Non-ISO date formats are rejected as invalid |
| TC-054 | P1 | negative | Import CSV with amount = "abc" (non-numeric) in one row | Toast shows skip count for invalid amount | Non-numeric amounts cause row to be skipped |
| TC-055 | P0 | positive | Import CSV with empty category field (,,description,100) → check imported expense | Expense is added with category "Other" | Empty category in CSV defaults to "Other" |
| TC-056 | P1 | positive | Import CSV with new category "Utilities" not in current categories → result | Toast shows import count, new category "Utilities" is added automatically | CSV import creates new categories as needed |
| TC-057 | P1 | positive | Import same CSV twice → check for duplicates | Expenses are added twice (duplicates are allowed) | CSV import does not check for existing duplicates |
| TC-058 | P0 | negative | Attempt to import non-CSV file (e.g., .txt or .json) | File picker should only accept .csv; if non-CSV is selected, error on parsing | File input restricts to .csv files |

---

## Budget

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-059 | P0 | positive | Go to Expenses tab → enter Budget amount: ₹10,000 → click "Save Budget" | Toast shows "✓ Budget saved", budget section appears below "This Month" total | Budget is saved and section becomes visible |
| TC-060 | P0 | positive | Set budget ₹10,000 → add expense ₹5,000 (50% of budget) in current month → view Expenses tab | Progress bar is green, displays "₹5,000 left of ₹10,000 budget (50% used)" | Progress bar is green when spending is under 80% |
| TC-061 | P0 | positive | Set budget ₹10,000 → add expenses totaling ₹8,000 (80% exactly) in current month | Progress bar turns orange, displays "₹2,000 left of ₹10,000 budget (80% used)" | Progress bar is orange at exactly 80% |
| TC-062 | P0 | positive | Set budget ₹10,000 → add expenses totaling ₹9,999 (99.99% of budget) | Progress bar is orange (>80% but <100%) | Progress bar stays orange until 100% |
| TC-063 | P0 | positive | Set budget ₹10,000 → add expenses totaling ₹10,000 (100% of budget) | Progress bar turns red, displays "₹0 left of ₹10,000 budget (100% used)" | Progress bar is red at exactly 100% |
| TC-064 | P0 | positive | Set budget ₹10,000 → add expenses totaling ₹12,000 (120% of budget, overspent) | Progress bar is red, displays "₹2,000 over your ₹10,000 budget!" in red text | Progress bar is red when over budget, message shows overage amount |
| TC-065 | P1 | positive | Set budget ₹10,000 → add expenses in current month totaling ₹8,000 → switch to "This Week" filter | Budget section disappears (budget only shows for "month" range) | Budget bar only displays when range is "month" |
| TC-066 | P1 | positive | Set budget ₹10,000 → add expenses totaling ₹8,000 in previous month → view current month (₹0 spent) | Budget progress bar shows green and "₹10,000 left", previous month's spending doesn't affect current budget | Budget resets for each calendar month |
| TC-067 | P0 | positive | Set budget ₹10,000 → clear budget input → click "Save Budget" | Budget is set to ₹0 (or cleared), budget section disappears | Clearing budget input disables the budget |
| TC-068 | P2 | boundary | Set budget ₹0 → add expense ₹1 → view progress | Progress bar shows 100% (or undefined behavior) | Budget of ₹0 is allowed but may cause division issues |
| TC-069 | P1 | negative | Try to set budget to negative amount (e.g., ₹-1000) | Input step/min prevents negative values, or negative is treated as 0 | Negative budgets are rejected |

---

## Monthly Records & Savings/Investments

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-070 | P0 | positive | Go to Savings & Investments tab → enter Month: "2026-10", Income: ₹100,000, Savings balance: ₹500,000, (Equity: ₹200k, Debt/FD: ₹100k, Gold: ₹50k) → click "Save Record" | Toast shows "✓ Record saved", record appears in History table with correct values | Monthly records are added to history |
| TC-071 | P0 | positive | View History table for saved record → check format | Table displays: Month, Income, Savings, Investments (sum of all invest types), Contributed (blank if not set), delete button | History table displays monthly record data |
| TC-072 | P1 | positive | Save record for month "2026-10" with Savings ₹500k, no previous month record → Dashboard Net Worth shows ₹500k | Net worth calculation starts from this month's record | Net worth is calculated from latest monthly record |
| TC-073 | P0 | positive | Save record for "2026-09" with Savings ₹400k and Investments ₹100k → save record for "2026-10" with Savings ₹500k and Investments ₹120k → Dashboard shows Net Worth Trend chart with both months | Chart displays 2 data points showing trend from month 1 to month 2 | Monthly records create trend data |
| TC-074 | P1 | calculation | Save record "2026-09" with Savings ₹500k, Investments ₹100k → save record "2026-10" with Savings ₹550k, Investments ₹130k, Contributed ₹20k → view Dashboard "This Month Invested" | Investment increase is ₹30k total, ₹20k is contributed, ₹10k is market growth | Market growth = balance increase - contribution |
| TC-075 | P0 | positive | Save record "2026-10" with Savings ₹500k → save same month again with Savings ₹600k → History table shows only one record for 2026-10 with ₹600k | Re-saving the same month overwrites the previous record | Saving same month overwrites previous value |
| TC-076 | P1 | positive | Save record "2026-10" with Contributed ₹30k → view History table | "Contributed" column shows "₹30k" for that record | Contributed field displays in history when filled |
| TC-077 | P1 | positive | Save record "2026-10" without filling Contributed field → view History table | "Contributed" column is empty or shows "—" | Contributed field is optional |
| TC-078 | P0 | negative | Try to save record with negative Savings balance | Input type="number" min="0" prevents negative values | Negative balances are rejected |
| TC-079 | P2 | boundary | Save record with ₹0 savings, ₹0 investments, ₹0 contributed → Dashboard displays correctly | Net worth shows ₹0, charts include this month with ₹0 values | Zero balances are allowed |
| TC-080 | P1 | positive | Save 2 months of records → delete one from History table → check remaining record | Toast shows "✓ Record deleted", only one record remains, Dashboard recalculates | Records can be deleted from history |

---

## Investment Types

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-081 | P0 | positive | Go to Savings & Investments → add Investment Type "Crypto" → view Investment Types chip list | "Crypto" appears in the chip list with a unique color | Custom investment types are added |
| TC-082 | P0 | positive | Add custom investment type "Crypto" → scroll down to "Add Monthly Record" section | Input field "Crypto" appears in the investment inputs | New investment types appear in monthly record form |
| TC-083 | P0 | negative | Try to add investment type with blank name | No type is added, chip list unchanged | Empty investment type names are rejected |
| TC-084 | P0 | negative | Add type "Equity" → try to add another "Equity" (case-insensitive) | Toast shows "⚠ Type already exists." | Duplicate investment types are rejected |
| TC-085 | P0 | positive | Add investment type "Crypto" → save monthly record with Crypto: ₹50k → view Dashboard Investment Allocation chart | Pie chart includes "Crypto" slice with ₹50k | Investment allocation includes custom types |
| TC-086 | P0 | positive | Add investment type "Crypto", save monthly record with it, then remove "Crypto" type | Toast shows "⚠ Confirm: Remove investment type "Crypto"? Past records keep their saved amounts, but new entries won't include it." → click confirm | Type is removed, Investment Allocation chart still shows the ₹50k from past record, new monthly records don't have Crypto field | Removing investment type preserves historical data |
| TC-087 | P0 | negative | Try to remove the last investment type | Toast shows "⚠ You need at least one investment type." | App requires at least one investment type |

---

## Gold Quick Add

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-088 | P0 | positive | Go to Savings & Investments → enter Gold bill amount: ₹10,000, Expense %: 20, Date: today → preview shows "Will add ₹2,000 as a Jewellery expense, and ₹8,000 to your Gold investment balance" → click "Split & Add" | Toast shows "✓ Record saved", Expenses tab shows new "Jewellery" expense for ₹2,000, monthly record for this month includes Gold ₹8,000 added to balance | Gold split allocates expense % to Jewellery and rest to Gold investment |
| TC-089 | P1 | positive | Enter gold amount ₹10,000 and clear the preview field → preview updates to show split calculation | Preview text updates in real-time | Gold split preview updates as you type |
| TC-090 | P0 | positive | Add gold ₹10,000 with default 20% → result shows expense ₹2,000 and investment ₹8,000 | Values are split exactly as: 20% of ₹10,000 = ₹2,000 expense, rest = ₹8,000 to Gold | Calculation: expense = amount × % / 100, invest = amount - expense |
| TC-091 | P1 | positive | Add gold ₹50,000 with 10% → expense ₹5,000, invest ₹45,000 | Both values are correctly calculated | Variable expense % works in calculation |
| TC-092 | P1 | positive | Add gold ₹100, % 50 → expense ₹50, invest ₹50 → view Expenses and Savings tab → both show the split | Both Jewellery expense and Gold investment are recorded | Small amounts are calculated correctly |
| TC-093 | P0 | positive | Add gold for past month (e.g., 2026-09-15) → monthly record exists for 2026-09 → Gold amount is added to existing 2026-09 record | Gold investment is added to that month's balance | Gold can be added to past months with existing records |
| TC-094 | P0 | positive | Add gold for month with no existing record (e.g., 2026-08) → result | Monthly record is created for 2026-08 with only Gold balance set (other investments and savings are ₹0) | Gold add creates a monthly record if none exists |
| TC-095 | P1 | positive | Add gold when "Jewellery" category doesn't exist yet → result | "Jewellery" category is created automatically, expense is added to it | Gold add auto-creates Jewellery category if missing |
| TC-096 | P1 | positive | Add gold when "Gold" investment type doesn't exist → result | "Gold" investment type is created automatically, balance is updated | Gold add auto-creates Gold investment type if missing |
| TC-097 | P0 | negative | Enter gold amount ₹0 → try to click "Split & Add" | Toast shows "⚠ Enter a valid bill amount.", no record is added | Zero gold amount is rejected |
| TC-098 | P1 | negative | Enter gold amount ₹10,000 with % 101 → clamp to 100% or reject | Expense % is clamped to 0-100 range, or input prevents >100 | Expense percentage is bounded to 0-100% |
| TC-099 | P2 | boundary | Enter gold amount ₹10,000 with % 0 → expense ₹0, invest ₹10,000 | Full amount goes to investment | 0% expense allocation is allowed |
| TC-100 | P2 | boundary | Enter gold amount ₹10,000 with % 100 → expense ₹10,000, invest ₹0 | Full amount goes to expense, Gold investment receives ₹0 | 100% expense allocation is allowed |

---

## Debts & Goals

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-101 | P0 | positive | Go to Debts & Goals tab → add Debt: Name "Car Loan", Balance ₹500,000 → click "Add Debt" | Toast shows "✓ Debt added", debt appears in Debts table with balance and delete button | Debts are added and displayed |
| TC-102 | P0 | positive | Add debt ₹500k → view Dashboard Net Worth (with savings ₹1M, investments ₹200k) | Net Worth = ₹1,000k + ₹200k - ₹500k = ₹700k | Debts reduce net worth calculation |
| TC-103 | P0 | positive | Add 2 debts (₹500k and ₹300k) → view Debts table → "Total" row shows ₹800k | Total debt balance is displayed at bottom | Debts total is calculated and shown |
| TC-104 | P1 | positive | Add debt with name "Home Loan", delete it, then add another "Home Loan" → app allows duplicate names | Duplicate debt names are permitted | Debts can have duplicate names |
| TC-105 | P0 | positive | Add debt with balance ₹500k → delete it by clicking delete button in table → confirm | Toast shows "✓ Debt deleted", debt is removed from table and Dashboard net worth updates | Debts can be deleted |
| TC-106 | P0 | positive | Add Savings Goal: Name "Vacation Fund", Target ₹100,000, Current ₹25,000 → click "Add Goal" | Toast shows "✓ Goal added", goal appears in Goals card with progress bar | Savings goals are added and displayed |
| TC-107 | P0 | positive | Add goal with Target ₹100k, Current ₹25k → view progress bar | Progress bar shows 25% filled (green or default color) | Goal progress is visualized as percentage |
| TC-108 | P1 | positive | Add goal with Target ₹100k, Current ₹100k (goal met) → view progress bar | Progress bar shows 100% filled, goal is visually complete | 100% progress is displayed |
| TC-109 | P1 | positive | Add goal with Target ₹100k, Current ₹150k (exceeded) → view progress bar | Progress bar shows 100% or overflows (depends on implementation) | Goals can be exceeded |
| TC-110 | P0 | positive | Add goal, update "Current amount" via modal/edit → current amount changes | Goals can be edited (assuming edit functionality exists) | Goal progress updates reflect new current amount |
| TC-111 | P0 | positive | Add goal and delete it → goal is removed from Goals list | Goals can be deleted | Deleted goals are removed from display |
| TC-112 | P0 | negative | Try to add debt with blank name | Input field is required or validation blocks blank names | Blank debt names are rejected |
| TC-113 | P0 | negative | Try to add goal with Target ₹0 | Goal with ₹0 target is allowed or rejected (depends on logic) | Zero target goals may be rejected |

---

## Profile & Targets

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-114 | P0 | positive | Go to Profile & Targets tab → enter Age: 30, Retirement Age: 60, Income: ₹100,000, Inflation: 6% → click "Save Profile" | Toast shows "✓ Profile saved", values are persisted and used for Dashboard calculations | Profile is saved and applied to all calculations |
| TC-115 | P0 | positive | Save profile → view Dashboard Emergency Fund card | Emergency fund target = 6 × average monthly spending (or profile income × 0.5 if no expense data) | Emergency fund calculation uses profile income as fallback |
| TC-116 | P0 | positive | Save profile with age 30, retirement 60, income ₹100k → view Dashboard Retirement Corpus | "Retirement Corpus: 25 × annual expenses (₹1,200,000) = ₹30,000,000 (today's money)" | Retirement corpus = 25 × annual income (simplified) |
| TC-117 | P1 | positive | Save profile with age 25, retirement 65 → view Dashboard Guidance card | Guidance includes age-appropriate advice (e.g., "You have 40 years to retirement, focus on growth assets") | Guidance changes based on years to retirement |
| TC-118 | P0 | positive | Save profile with inflation 6% and another with inflation 10% → compare Retirement Corpus "future money" value | Higher inflation results in higher inflation-adjusted retirement corpus | Inflation rate affects retirement corpus future value calculation |
| TC-119 | P1 | positive | Go to Savings & Investments tab → leave Monthly Targets blank → save record → Dashboard shows "(Auto-suggested) targets" hint | If targets are not set, auto-suggested targets from profile are used | Profile drives auto-suggested targets via 50/30/20 rule |
| TC-120 | P0 | positive | Set Monthly Targets: Savings ₹50,000, Investments ₹30,000 → view Dashboard "This Month Saved" and "This Month Invested" progress bars | Progress bars show against target (if month's savings < target, bar is smaller) | Custom monthly targets override auto-suggested values |
| TC-121 | P1 | positive | Leave Monthly Targets blank → save custom targets → clear them and save blank → targets revert to auto-suggested | Custom targets can be cleared to revert to auto-suggested | Custom targets can be unset |
| TC-122 | P0 | negative | Try to set Age > Retirement Age (e.g., Age 65, Retirement 60) → save | App allows (or validates and prevents) illogical ages | Age > retirement age validation (if enforced) |
| TC-123 | P2 | boundary | Set Age 15 (minimum), Retirement 100 (maximum) → save and verify calculations | No errors, calculations proceed | Boundary profile ages are handled |

---

## Targets: Emergency Fund & Retirement Corpus

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-124 | P0 | calculation | Add 3 months of expenses (Jan ₹10k, Feb ₹12k, Mar ₹11k) → Emergency Fund target = 6 × (₹10k + ₹12k + ₹11k) / 3 = 6 × ₹11k = ₹66k | Dashboard Emergency Fund shows target ₹66,000 | Emergency fund = 6 × average monthly spending from all expenses |
| TC-125 | P1 | calculation | Add monthly record with Savings ₹50k, Investments ₹20k (total ₹70k) → Emergency Fund bar shows 70/66 = ~106% progress | Progress bar shows 106% (green, may display as 100% capped) | Emergency fund progress = (savings + investments) / (6 × avg monthly) |
| TC-126 | P0 | calculation | Profile income ₹100k/month, expenses average ₹30k/month → Retirement Corpus = 25 × (₹30k × 12 months) = 25 × ₹360k = ₹9M | Dashboard Retirement Corpus shows ₹9,000,000 in today's money | Retirement corpus = 25 × annual expenses |
| TC-127 | P1 | calculation | Retirement Corpus ₹9M, inflation 6%, years to retirement 30 → Future value ≈ ₹9M × (1.06)^30 ≈ ₹51.7M | Dashboard shows both ₹9M (today's money) and ₹51.7M (inflation-adjusted, future) | Retirement corpus inflation adjustment: FV = PV × (1 + inflation_rate) ^ years |
| TC-128 | P0 | calculation | Save monthly record with Savings ₹2M, Investments ₹1M, Debt ₹500k → Retirement Corpus progress = (₹2M + ₹1M - ₹500k) / ₹9M = ~28% | Dashboard Retirement Corpus bar shows 28% progress | Retirement corpus progress = net worth / target |
| TC-129 | P2 | boundary | Save expenses averaging ₹0/month (no expenses) → Emergency Fund uses fallback (profile income × 0.5) | Emergency fund target = 6 × (income × 0.5) = 3 × income | Fallback emergency fund when no expenses exist |

---

## Transactions: Search, Filter & Sort

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-130 | P0 | positive | Add 5 expenses with descriptions "Lunch", "Taxi", "Groceries", "Movie", "Gas" → search "Lunch" → only "Lunch" displays | Search filters by description substring match | Search is case-insensitive substring match on description |
| TC-131 | P1 | positive | Add expenses in "Food" and "Transport" categories → search "Food" → only "Food" category expenses display | Search also matches category names | Search matches both description and category fields |
| TC-132 | P0 | positive | Add 3 expenses, view "This Month" → switch to "This Week" → only this week's expenses display | Date range filters correctly | Range filter works for day/week/month/all |
| TC-133 | P1 | positive | Add 5 expenses on different dates → sort by "Oldest first" → oldest appears first | Reverse chronological sort works | Sort direction is reversible |
| TC-134 | P0 | positive | Add expenses with amounts ₹100, ₹50, ₹200 → sort "Amount: low to high" → displays ₹50, ₹100, ₹200 | Amount sort in ascending order | Amount sort works correctly |
| TC-135 | P1 | positive | Search returns 0 results → "No transactions to show." message displays | Empty state is handled | No-results message is shown for empty search |
| TC-136 | P1 | positive | Set range "All Time" with 24 months of data → sort by "date_desc" → expenses grouped by date, newest dates first | Grouping by date respects sort order | Date grouping respects sort direction |
| TC-137 | P0 | positive | Select range "This Month", add 2 expenses today and 1 last week → range shows only today's and this week's (current month) | Correct date boundaries for month range | Week-to-week boundaries are calculated correctly |

---

## Cloud Sync & Data Persistence

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-138 | P0 | positive | User logged in → add expense → observe sync dot → changes to orange (syncing) then back to green | Sync dot indicates syncing status | Sync dot animates on data change |
| TC-139 | P0 | positive | User logged in → add expense → wait 1-2 seconds → sync dot shows green (synced) → logout and login again → expense is still there | Data syncs to cloud and persists across sessions | Cloud sync persists user data |
| TC-140 | P1 | positive | Offline: add expense (if app supports offline) → go online → expense syncs | Expense is persisted and synced when online | Offline-first behavior (if supported) |
| TC-141 | P0 | negative | Cloud sync fails (simulate network error) → toast shows "⚠ Cloud sync failed: [error message]" | Sync failures are shown to user | Sync errors are communicated |
| TC-142 | P1 | positive | User A logs in on Device 1, saves data → User A logs in on Device 2 → data from cloud is loaded → both devices show same data | Multi-device sync works | Cloud data is shared across devices |
| TC-143 | P1 | positive | Add expense on Device 1, wait for sync → Device 2 listener detects change and updates UI | Real-time or near-real-time sync across devices | Cloud updates propagate to other devices |

---

## Settings: Dark Mode

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-144 | P0 | positive | Go to Settings tab → click "Toggle Dark Mode" button → page background changes to dark | Dark mode is applied immediately | Dark mode toggle works |
| TC-145 | P0 | positive | Click dark mode toggle → toggle moon icon at top-right → both trigger dark mode | Dark mode can be toggled from Settings or top-right button | Dark mode toggle is accessible from multiple locations |
| TC-146 | P1 | positive | Enable dark mode → logout → login again → dark mode remains enabled | Dark mode preference is persisted | Dark mode setting is saved to storage |
| TC-147 | P1 | positive | Enable dark mode → all text remains readable, contrast is good | Dark mode has accessible contrast ratios | Dark mode colors meet accessibility standards |
| TC-148 | P2 | positive | Open in dark mode → charts (Chart.js) render correctly with proper colors | Charts adapt to dark mode | Charts are visible in dark mode |

---

## Settings: Data Export & Import

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-149 | P0 | positive | Go to Settings tab → click "Download Backup (JSON)" → browser downloads a JSON file with filename like "backup-[timestamp].json" | JSON backup file is downloaded with all app data (expenses, categories, budget, profile, records, etc.) | Backup export downloads JSON file |
| TC-150 | P0 | positive | Export backup, then clear all data, then import the backup file → all data is restored | Import replaces current data with backup contents | Backup import restores all data |
| TC-151 | P1 | positive | Export backup with special characters in descriptions (e.g., "café ☕") → export JSON contains escaped characters → import and verify | Special characters survive export/import | JSON encoding handles Unicode correctly |
| TC-152 | P0 | negative | Try to import invalid JSON file → toast shows "⚠ Could not parse backup file." | Invalid JSON is rejected | JSON validation prevents corruption |
| TC-153 | P0 | negative | Import backup missing required fields (e.g., expenses array is missing) → import proceeds or errors | Partial backups may be handled gracefully | Incomplete backup imports are handled |
| TC-154 | P1 | positive | Export 2 backups → import first backup → import second backup → data is replaced with second backup contents | Each import overwrites with new backup | Import is a full replace operation |

---

## Settings: Clear Data

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-155 | P0 | positive | Go to Settings → click "Erase All Data" → confirmation modal appears asking to confirm | Erase requires user confirmation | Erase operation requires confirmation |
| TC-156 | P0 | positive | Click "Erase All Data" → click "Confirm" → all expenses, categories, records, debts, goals deleted → Dashboard shows "No records yet" or empty states | All local data is deleted | Erase clears all data from storage |
| TC-157 | P0 | negative | Click "Erase All Data" → click "Cancel" → data is unchanged | Canceling erase preserves data | Cancel discards erase operation |
| TC-158 | P1 | positive | Export backup → erase data → import backup → data is restored | Data can be recovered after erase via backup | Erase is reversible via backup import |

---

## Dashboard: Gap Warning

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-159 | P1 | positive | Save monthly records with gaps (e.g., Jan, Mar, Jun — skipping Feb, Apr, May) → view Dashboard → warning appears | Gap warning alerts user to missing months | Gap warning is shown for non-contiguous months |
| TC-160 | P2 | positive | Save monthly records with no gaps → no warning appears | Continuous monthly records show no warning | Gap warning only shows for actual gaps |

---

## Guidance & Advice

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-161 | P1 | positive | Save profile (age 25, ₹150k income) with low savings (₹10k) → view Dashboard Guidance card | Advice includes "Your emergency fund is low. Aim for ₹400k (6x expenses)" or similar | Guidance reacts to emergency fund status |
| TC-162 | P1 | positive | Save profile with high debt (₹1M) vs. net worth (₹500k) → view Guidance | Advice warns about high debt-to-wealth ratio | Guidance identifies unhealthy debt levels |
| TC-163 | P1 | positive | Save profile with age 50, retirement 60 → view Guidance | Advice emphasizes near-term retirement (10 years) | Age-based guidance is generated |
| TC-164 | P2 | positive | Save profile with spending ₹20k/month, income ₹100k → view Guidance | Advice follows 50/30/20 rule and compares actual spending | Guidance uses 50/30/20 budget heuristic |

---

## UI & UX

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-165 | P1 | positive | Add expense, wait 2+ seconds → no unseen changes → refresh page → expense persists | Page refresh does not lose data | Data persists across page reloads |
| TC-166 | P1 | positive | Add expense on mobile (simulated responsive view) → form, tabs, and transaction list are readable and functional | Responsive design works on small screens | App is mobile-responsive |
| TC-167 | P1 | positive | Toast notifications display for 2.2 seconds then fade out → new toast replaces old one | Toast messages auto-dismiss and don't stack indefinitely | Toast notifications are auto-dismissed |
| TC-168 | P0 | positive | Open modals (Edit Expense) → click outside the modal or Cancel button → modal closes without saving | Modal dismissal is possible | Modals can be closed |
| TC-169 | P1 | positive | Disable JavaScript in browser settings (or simulate) → attempt to use app | App requires JavaScript (or gracefully degraded) | JavaScript is required (no fallback assumed) |

---

## Calculation Edge Cases

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-170 | P2 | boundary | Add very large expense amount ₹999,999,999.99 → save record with ₹1,000,000,000 → all calculations proceed | No integer overflow or precision loss | Large numbers are handled correctly |
| TC-171 | P2 | boundary | Record with investment contribution ₹999,999,999 but balance is ₹1,000,000,000 → market growth = ₹1 | Calculation handles minimal growth | Market growth calculation is precise to ₹1 |
| TC-172 | P1 | boundary | Average monthly spending = ₹1, Emergency fund = 6 × ₹1 = ₹6 → compare progress bar | Very small amounts are calculated correctly | Small-value calculations are accurate |
| TC-173 | P2 | boundary | Add 500+ transactions in one month → transaction list renders without performance degradation | Large transaction volumes don't freeze UI | App scales to large datasets |

---

## Date & Time Zone Handling

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-174 | P1 | date | Add expense with date 2026-02-29 (leap year) → save successfully | Leap year dates are accepted | Leap year dates are valid |
| TC-175 | P1 | date | Add expense with date 2026-02-30 (invalid) → try to save | Date validation rejects invalid dates | Invalid dates are rejected |
| TC-176 | P1 | date | User in IST timezone (UTC+5:30) → add expense at 23:55 today → switch to UTC→-5 timezone (EDT) → check transaction date | Date is stored in UTC or user's timezone | Date handling respects timezones (or assumes UTC) |
| TC-177 | P1 | date | Add monthly record for 2026-01, 2026-02, 2026-03 → query by month displays correctly | Month boundaries are calculated correctly | Monthly grouping respects month boundaries |

---

## Form Validation & Error Handling

| ID | Priority | Category | Steps | Expected result | Assumption |
|---|---|---|---|---|---|
| TC-178 | P0 | negative | Submit forms with XSS payload in description (e.g., `<script>alert('xss')</script>`) → no alert appears, content is escaped | Inputs are sanitized (or displayed safely) | User input is safely handled |
| TC-179 | P1 | negative | Fill form with extremely long description (1000+ characters) → save | Long descriptions are accepted or truncated gracefully | Long inputs are handled |
| TC-180 | P0 | positive | Required fields (Amount, etc.) show validation feedback | Required field validation is clear to user | Required fields are validated |

---

## Open Questions

1. **Gold split intent (BEHAVIOR.md):** Is the split (expense % to Jewellery, rest to Gold investment) the intended behavior? BEHAVIOR.md says "OPEN QUESTION: is this split what I intend? Decide, then check the code."

2. **Budget behavior for past months:** Does the budget only apply to "This Month" range, or is there month-specific budget support?

3. **Guidance generation rules:** What are the specific heuristics for the auto-generated Guidance card? (50/30/20 rule is mentioned, but exact thresholds are unclear.)

4. **Offline support:** Does the app support offline mode, or does it require always-on cloud connectivity?

5. **Cloud sync conflicts:** If a user edits on Device A and Device B simultaneously, how are conflicts resolved? Last-write-wins? Merge?

6. **Investment type deletion:** When an investment type is removed, are the historical records updated or preserved as-is in the backend?

7. **Category move-to-Other:** When a category is deleted, are the associated expenses moved to "Other" in the UI and backend, or is this just a display behavior?

8. **Refund UI placement:** The ↩ button on transactions appears on hover. Is this accessible on touch devices (mobile)?

9. **Email/sharing:** Is there any feature to email reports or share data with others? (Not seen in code, but clarify if it's intentional.)

10. **Recurring expenses:** Does the app support recurring/subscription tracking, or is every expense manually entered?

11. **Targets recalculation:** When Monthly Targets are cleared, do they immediately revert to auto-suggested values, or is there a confirmation step?

12. **Time-zone aware dates:** Are all dates stored in UTC in the backend, or is the user's local timezone assumed throughout?

---

## Summary

**File saved:** `c:\Users\aarka\Projects\pocket-tools\finance-tracker\finance-tracker-test-cases.md`

**Test cases added:** 180 test cases across 19 feature areas
- Authentication & Login: 5 cases
- Dashboard: 11 cases
- Expenses: Add & Edit: 16 cases
- Expenses: Refunds: 8 cases
- Expenses: Categories: 8 cases
- Expenses: CSV Import: 10 cases
- Budget: 11 cases
- Monthly Records & Savings/Investments: 11 cases
- Investment Types: 7 cases
- Gold Quick Add: 13 cases
- Debts & Goals: 12 cases
- Profile & Targets: 9 cases
- Targets: Emergency Fund & Retirement Corpus: 6 cases
- Transactions: Search, Filter & Sort: 8 cases
- Cloud Sync & Data Persistence: 6 cases
- Settings: Dark Mode: 5 cases
- Settings: Data Export & Import: 6 cases
- Settings: Clear Data: 4 cases
- Dashboard: Gap Warning: 2 cases
- Guidance & Advice: 4 cases
- UI & UX: 5 cases
- Calculation Edge Cases: 4 cases
- Date & Time Zone Handling: 4 cases
- Form Validation & Error Handling: 3 cases

**Test cases skipped:** 0 (first generation)

**Open questions:** 12 clarifications needed on behavior intent, conflict resolution, offline support, and accessibility.