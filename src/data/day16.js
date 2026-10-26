import { humanitarianDatabase } from './databases/day12/humanitarian.js';

export const day16ReliefSql = humanitarianDatabase.setupSql;

const q73Starter = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT shipment_id, camp_id, item_id, qty, ship_date, status
    FROM Shipments
    WHERE status = 'delivered'
    ORDER BY shipment_id
""", con)

# TODO 1: print the DataFrame shape.
# TODO 2: print the column names as a Python list.
# TODO 3: print the first five rows without the pandas index.

con.close()
`;

const q73Solution = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT shipment_id, camp_id, item_id, qty, ship_date, status
    FROM Shipments
    WHERE status = 'delivered'
    ORDER BY shipment_id
""", con)

print("shape:", delivered.shape)
print("columns:", list(delivered.columns))
print(delivered.head(5).to_string(index=False))

con.close()
`;

const q74Starter = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, qty, status
    FROM Shipments
    ORDER BY shipment_id
""", con)

# TODO: keep delivered shipments with qty >= 150.
# Then keep only shipment_id, qty, and status and print the result.

con.close()
`;

const q74Solution = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, qty, status
    FROM Shipments
    ORDER BY shipment_id
""", con)

filtered = shipments[
    (shipments["qty"] >= 150) & (shipments["status"] == "delivered")
][["shipment_id", "qty", "status"]]

print(filtered.to_string(index=False))
con.close()
`;

const q75Starter = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT shipment_id, item_id, qty
    FROM Shipments
    WHERE status = 'delivered'
""", con)
items = pd.read_sql_query("""
    SELECT item_id, name, category
    FROM Items
""", con)

# TODO 1: merge delivered with items on item_id.
# TODO 2: print shipment_id, name, category, and qty.

con.close()
`;

const q75Solution = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT shipment_id, item_id, qty
    FROM Shipments
    WHERE status = 'delivered'
""", con)
items = pd.read_sql_query("""
    SELECT item_id, name, category
    FROM Items
""", con)

merged = delivered.merge(items, on="item_id")
print(
    merged[["shipment_id", "name", "category", "qty"]]
    .sort_values("shipment_id")
    .to_string(index=False)
)

con.close()
`;

const q76Starter = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, item_id, qty
    FROM Shipments
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)
merged = shipments.merge(items, on="item_id")

# TODO: make one row per category with:
#   shipment_count = number of shipments
#   total_qty = total quantity
# Sort largest total_qty first and print the summary.

con.close()
`;

const q76Solution = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, item_id, qty
    FROM Shipments
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)
merged = shipments.merge(items, on="item_id")

summary = (
    merged.groupby("category")
    .agg(
        shipment_count=("shipment_id", "count"),
        total_qty=("qty", "sum"),
    )
    .sort_values("total_qty", ascending=False)
)

print(summary)
con.close()
`;

const q77Starter = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT item_id, qty
    FROM Shipments
    WHERE status = 'delivered'
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)

# TODO 1: merge delivered with items.
# TODO 2: total delivered qty by category, largest first.
# TODO 3: print the totals and create a bar chart.
# Add a useful title and y-axis label.

con.close()
`;

const q77Solution = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT item_id, qty
    FROM Shipments
    WHERE status = 'delivered'
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)

merged = delivered.merge(items, on="item_id")
totals = (
    merged.groupby("category")["qty"]
    .sum()
    .sort_values(ascending=False)
)

print(totals)
totals.plot(kind="bar", rot=0)
plt.title("Delivered quantity by item category")
plt.xlabel("item category")
plt.ylabel("delivered units")
plt.tight_layout()

con.close()
`;

const q78Starter = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, status
    FROM Shipments
""", con)

# TODO 1: count shipments in each status.
# TODO 2: sort the counts largest first and print them.
# TODO 3: make a bar chart of the status counts.

con.close()
`;

const q78Solution = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, status
    FROM Shipments
""", con)

counts = shipments["status"].value_counts()
print(counts)

counts.plot(kind="bar", rot=0)
plt.title("Shipment count by status")
plt.xlabel("shipment status")
plt.ylabel("number of shipments")
plt.tight_layout()

con.close()
`;

const q79Starter = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, ship_date, status
    FROM Shipments
    ORDER BY shipment_id
""", con)

# TODO 1: keep only rows whose ship_date is missing.
# TODO 2: count the missing-date rows by status, largest first.
# Print the missing rows and the status summary.

con.close()
`;

const q79Solution = `import sqlite3
import pandas as pd

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, ship_date, status
    FROM Shipments
    ORDER BY shipment_id
""", con)

missing = shipments[shipments["ship_date"].isna()]
by_status = missing.groupby("status").size().sort_values(ascending=False)

print("Missing-date shipments:")
print(missing.to_string(index=False))
print("\\nMissing dates by status:")
print(by_status)
con.close()
`;

const q80Starter = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, ship_date, status
    FROM Shipments
""", con)

# TODO 1: keep only rows with a missing ship_date.
# TODO 2: count missing dates by status.
# TODO 3: print the counts and make a bar chart.
# The chart should make it easy to see which status explains the most gaps.

con.close()
`;

const q80Solution = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, ship_date, status
    FROM Shipments
""", con)

missing = shipments[shipments["ship_date"].isna()]
by_status = missing["status"].value_counts()

print(by_status)

by_status.plot(kind="bar", rot=0)
plt.title("Missing ship dates by status")
plt.xlabel("shipment status")
plt.ylabel("missing ship dates")
plt.tight_layout()

con.close()
`;

const q81Starter = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT ship_date, qty
    FROM Shipments
    WHERE status = 'delivered'
      AND ship_date IS NOT NULL
    ORDER BY ship_date
""", con)

# TODO 1: total delivered qty by ship_date.
# TODO 2: use cumsum() to create a running delivered total.
# TODO 3: print the cumulative series and plot it as a line chart.

con.close()
`;

const q81Solution = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT ship_date, qty
    FROM Shipments
    WHERE status = 'delivered'
      AND ship_date IS NOT NULL
    ORDER BY ship_date
""", con)

by_day = delivered.groupby("ship_date")["qty"].sum().sort_index()
cumulative = by_day.cumsum()

print(cumulative)

cumulative.plot(kind="line", marker="o", rot=45)
plt.title("Cumulative delivered quantity")
plt.xlabel("delivery date")
plt.ylabel("cumulative delivered units")
plt.tight_layout()

con.close()
`;

const q82Starter = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, camp_id
    FROM Shipments
""", con)
camps = pd.read_sql_query("""
    SELECT camp_id, name, capacity
    FROM Camps
""", con)

# TODO 1: merge the two frames.
# TODO 2: create one row per camp with capacity and shipment_count.
# TODO 3: print the summary and create a scatter plot:
#         x = capacity, y = shipment_count.

con.close()
`;

const q82Solution = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT shipment_id, camp_id
    FROM Shipments
""", con)
camps = pd.read_sql_query("""
    SELECT camp_id, name, capacity
    FROM Camps
""", con)

merged = shipments.merge(camps, on="camp_id")
per_camp = (
    merged.groupby(["camp_id", "name", "capacity"], as_index=False)
    .agg(shipment_count=("shipment_id", "count"))
)

print(per_camp.to_string(index=False))

per_camp.plot(
    kind="scatter",
    x="capacity",
    y="shipment_count",
)
plt.title("Camp capacity vs shipment count")
plt.xlabel("camp capacity")
plt.ylabel("number of shipments")
plt.tight_layout()

con.close()
`;

const q83Starter = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT item_id, qty
    FROM Shipments
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)

# TODO 1: merge shipments with items.
# TODO 2: calculate average shipment qty by category.
# TODO 3: rank the categories largest first, print the result,
#         and make a bar chart.

con.close()
`;

const q83Solution = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
shipments = pd.read_sql_query("""
    SELECT item_id, qty
    FROM Shipments
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)

merged = shipments.merge(items, on="item_id")
averages = (
    merged.groupby("category")["qty"]
    .mean()
    .sort_values(ascending=False)
    .round(1)
)

print(averages)

averages.plot(kind="bar", rot=0)
plt.title("Average shipment size by item category")
plt.xlabel("item category")
plt.ylabel("average units per shipment")
plt.tight_layout()

con.close()
`;

const q84Starter = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT item_id, qty
    FROM Shipments
    WHERE status = 'delivered'
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)

# Real challenge:
# Which item category receives the largest share of delivered supply?
#
# 1) Merge delivered with items.
# 2) Total delivered qty by category.
# 3) Add delivered_share_pct so the category shares sum to 100.
# 4) Rank the categories and print the summary.
# 5) Choose an appropriate chart and plot the shares.
# 6) Write one sentence interpreting the largest and smallest shares.

con.close()
`;

const q84Solution = `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("relief.db")
delivered = pd.read_sql_query("""
    SELECT item_id, qty
    FROM Shipments
    WHERE status = 'delivered'
""", con)
items = pd.read_sql_query("""
    SELECT item_id, category
    FROM Items
""", con)

merged = delivered.merge(items, on="item_id")

summary = (
    merged.groupby("category", as_index=False)["qty"]
    .sum()
    .rename(columns={"qty": "delivered_qty"})
)

summary["delivered_share_pct"] = (
    summary["delivered_qty"] / summary["delivered_qty"].sum() * 100
).round(1)

summary = summary.sort_values("delivered_share_pct", ascending=False)
print(summary.to_string(index=False))

summary.plot(
    kind="bar",
    x="category",
    y="delivered_share_pct",
    legend=False,
    rot=0,
)
plt.title("Share of delivered supply by item category")
plt.xlabel("item category")
plt.ylabel("share of delivered supply (%)")
plt.tight_layout()

con.close()
`;

export const day16Exercises = [
  {
    id: 'q73',
    number: 73,
    title: 'Inspect a Filtered DataFrame',
    topic: 'DATAFRAME · SHAPE · COLUMNS · HEAD',
    prompt: 'Load only delivered shipments into a DataFrame. Report its shape, column names, and first five rows. The goal is to verify the frame before using any of its numbers.',
    starter: q73Starter,
    solution: q73Solution,
    explanation: 'SQL selects the delivered rows; pandas holds the returned table. Check shape and columns immediately, then inspect a few rows.',
    tables: ['Shipments'],
  },
  {
    id: 'q74',
    number: 74,
    title: 'Filter Rows with Two Conditions',
    topic: 'BOOLEAN FILTER · COLUMN SELECTION',
    prompt: 'From all shipments, keep only delivered rows with quantity at least 150. Display only shipment_id, qty, and status.',
    starter: q74Starter,
    solution: q74Solution,
    explanation: 'The two Boolean tests are combined with &, and the second bracket list chooses the three output columns.',
    tables: ['Shipments'],
  },
  {
    id: 'q75',
    number: 75,
    title: 'Merge Delivered Shipments with Items',
    topic: 'MERGE · SHARED KEY',
    prompt: 'Put each delivered shipment beside its item name and category. Merge the two frames on item_id, then display shipment_id, name, category, and qty.',
    starter: q75Starter,
    solution: q75Solution,
    explanation: 'merge(..., on="item_id") is the pandas version of pairing rows on the shared key.',
    tables: ['Shipments', 'Items'],
  },
  {
    id: 'q76',
    number: 76,
    title: 'Summarize Activity by Item Category',
    topic: 'GROUPBY · AGG',
    prompt: 'Using Shipments and Items, create one row per item category with shipment count and total quantity. Sort the categories from largest total quantity to smallest.',
    starter: q76Starter,
    solution: q76Solution,
    explanation: 'After the merge adds category to each shipment, groupby creates the category groups and agg computes two measures for each group.',
    tables: ['Shipments', 'Items'],
  },
  {
    id: 'q77',
    number: 77,
    title: 'Bar Chart: Delivered Quantity by Item Category',
    topic: 'MATPLOTLIB · BAR · GROUPBY',
    prompt: 'Considering only delivered shipments, total the quantity by item category and create a bar chart. Print the grouped values first so every bar can be checked against a number.',
    starter: q77Starter,
    solution: q77Solution,
    explanation: 'This uses the lecture’s category-comparison idea without repeating its camp-total example. The grouped Series provides the values behind the bars.',
    tables: ['Shipments', 'Items'],
    chart: true,
  },
  {
    id: 'q78',
    number: 78,
    title: 'Bar Chart: Shipment Workload by Status',
    topic: 'VALUE_COUNTS · MATPLOTLIB · BAR',
    prompt: 'Count how many shipments are in each status and visualize the workload with a bar chart. Print the counts before plotting.',
    starter: q78Starter,
    solution: q78Solution,
    explanation: 'Status is categorical, so a bar chart makes the differences in shipment counts easy to compare.',
    tables: ['Shipments'],
    chart: true,
  },
  {
    id: 'q79',
    number: 79,
    title: 'Audit Missing Ship Dates',
    topic: 'ISNA · GROUPBY',
    prompt: 'Find shipments whose ship_date is missing, then count those missing-date rows by status. Which status contributes the most missing dates?',
    starter: q79Starter,
    solution: q79Solution,
    explanation: 'isna() identifies missing values. Grouping only the missing rows turns the data-quality issue into an operational summary.',
    tables: ['Shipments'],
  },
  {
    id: 'q80',
    number: 80,
    title: 'Bar Chart: Visualize the Missing-Date Audit',
    topic: 'DATA QUALITY · MATPLOTLIB · BAR',
    prompt: 'Turn the missing-date audit into a chart: count missing ship dates by status, print the counts, and plot them so the largest source of missing dates is immediately visible.',
    starter: q80Starter,
    solution: q80Solution,
    explanation: 'The chart is built from the same defensible counts found in the data-quality audit rather than from raw rows.',
    tables: ['Shipments'],
    chart: true,
  },
  {
    id: 'q81',
    number: 81,
    title: 'Line Chart: Cumulative Delivered Quantity',
    topic: 'CUMSUM · MATPLOTLIB · LINE',
    prompt: 'For delivered shipments with dates, total quantity by delivery date, convert the daily totals into a cumulative running total with cumsum(), and plot the result over time.',
    starter: q81Starter,
    solution: q81Solution,
    explanation: 'The lecture uses a line for daily shipment quantity. This extension keeps time on the x-axis but asks for a running total instead of copying the slide example.',
    tables: ['Shipments'],
    chart: true,
  },
  {
    id: 'q82',
    number: 82,
    title: 'Scatter Plot: Camp Capacity vs Shipment Count',
    topic: 'MATPLOTLIB · SCATTER · RELATIONSHIP',
    prompt: 'Create one row per camp with its capacity and number of shipments. Plot capacity against shipment count and inspect whether larger camps appear to receive shipments more frequently.',
    starter: q82Starter,
    solution: q82Solution,
    explanation: 'The lecture relates capacity to total quantity. This question keeps the scatter-plot concept but changes the second measure to shipment frequency.',
    tables: ['Shipments', 'Camps'],
    chart: true,
    interpretation: true,
  },
  {
    id: 'q83',
    number: 83,
    title: 'Bar Chart: Average Shipment Size by Item Category',
    topic: 'AVERAGE · RANK · MATPLOTLIB',
    prompt: 'Calculate average shipment quantity by item category, rank the categories largest first, print the averages, and create a bar chart.',
    starter: q83Starter,
    solution: q83Solution,
    explanation: 'This combines merge, groupby, an average rather than a sum, ranking, and visualization in one compact analysis.',
    tables: ['Shipments', 'Items'],
    chart: true,
  },
  {
    id: 'q84',
    number: 84,
    title: 'Real Challenge: Share of Delivered Supply by Category',
    topic: 'REAL CHALLENGE · DERIVE · CHOOSE A CHART · INTERPRET',
    prompt: 'Which item category receives the largest share of delivered supply? Build the grouped totals, derive each category’s percentage share, rank the categories, choose an appropriate chart, and write one sentence naming the largest and smallest shares.',
    starter: q84Starter,
    solution: q84Solution,
    explanation: 'This is an end-to-end analysis: query a useful frame, merge, group, derive percentages, visualize the result, and interpret the values in plain language.',
    tables: ['Shipments', 'Items'],
    chart: true,
    interpretation: true,
  },
];
