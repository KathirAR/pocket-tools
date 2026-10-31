# Pocket Tracker: intended behavior

Source: written from the descriptions shown in the app. Verify each rule against the code and edit.

## Expenses
- Refunds: a returned amount is excluded from totals, the budget, and charts. A partial refund is allowed.
- Categories: removing a category moves its past expenses into "Other".
- CSV import: columns are date, category, description, amount, with or without a header row.

## Budget
- The monthly budget bar turns orange at 80% and red once spending goes over the budget.

## Savings, investments and debts
- Net worth = savings + investments - debts.
- A monthly record holds total balances, not amounts added. Changes are worked out against the previous month's record.
- If "amount invested this month" is filled in, the rest of an investment balance increase is treated as market growth.
- Saving the same month again overwrites it.

## Targets
- Emergency fund target = 6 x average monthly spending, compared against savings + investments.
- Retirement corpus = 25 x annual expenses, shown in today's money and inflation-adjusted.

## Gold quick add
- A gold bill is split. A set percentage goes to Expenses as "Jewellery" (making charges, wastage, GST), and the rest is added to the Gold investment balance for that month.
- OPEN QUESTION: is this split what I intend? Decide, then check the code.