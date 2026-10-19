import { humanitarianDatabase } from './databases/day12/humanitarian.js';

export const reliefSql = humanitarianDatabase.setupSql;
export const requestsSql = `CREATE TABLE Requests (
  request_id TEXT PRIMARY KEY,
  camp_id INTEGER NOT NULL,
  camp_name TEXT,
  category TEXT,
  qty_requested INTEGER NOT NULL
);`;
// Nine columns, 16 records, 15 unique ids. Preserve the intentional defects.
export const requestsCsv = `request_id,camp_id,camp_name,item_id,item_name,category,qty_requested,requested_on,priority
R001,1,Riverbend,10,Water,Essential,80,2026-08-24,high
R002,1,Riverbend,13,Food Packs,Nutrition,420,2026-08-24,high
R003,2,Hilltop,13,Food Packs,Nutrition,260,2026-08-24,high
R004,3,Lakeside ,11,Blankets,Shelter,100,2026-08-24,medium
R005,3,Lakeside,13,Food Packs,Nutrition,720,2026-08-24,high
R006,2,Hilltop,12,Medical Kits,Medical,130,2026-08-24,high
R007,3,Lakeside,10,Water,Essential,160,2026-08-24,high
R007,3,Lakeside,10,Water,Essential,160,2026-08-24,high
R008,4,Dry Springs,10,Water,Essential,90,2026-08-24,high
R009,4,Dry Springs,11,Blankets,,120,2026-08-24,medium
R010,1,Riverbend,11,Blankets,Shelter,45,2026-08-24,medium
R011,2,Hilltop,11,Blankets,Shelter,110,2026-08-24,medium
R012,1,Riverbend,12,Medical Kits,Medical,70,2026-08-24,high
R013,3,Lakeside,11,Blankets,Shelter,90,2026-08-24,medium
R014,4,Dry Springs,13,Food Packs,Nutrition,300,2026-08-24,high
R015,5,Pine Valley,10,Water,Essential,60,2026-08-24,high
`;

const query = `import sqlite3
con = sqlite3.connect("relief.db")
cur = con.cursor()
cur.execute("SELECT name, capacity FROM Camps WHERE region = 'North' ORDER BY camp_id")
print(cur.fetchall())
con.close()`;
const fetches = `import sqlite3
con = sqlite3.connect("relief.db")
cur = con.cursor()
rows = cur.execute("SELECT name, capacity FROM Camps ORDER BY camp_id").fetchall()
print(rows)
print("First row:", rows[0])
print("First capacity:", rows[0][1])
print("Count tuple:", cur.execute("SELECT COUNT(*) FROM Camps").fetchone())
for name, capacity in cur.execute("SELECT name, capacity FROM Camps ORDER BY camp_id"):
    print(name, capacity)
con.close()`;
const parameters = `import sqlite3
con = sqlite3.connect("relief.db")
cur = con.cursor()
region = "North"
sql = "SELECT name, capacity FROM Camps WHERE region = ? ORDER BY camp_id"
print(cur.execute(sql, (region,)).fetchall())
con.close()`;
const quote = `import sqlite3
con = sqlite3.connect("relief.db")
cur = con.cursor()
name = "O'Hara"
sql = "SELECT region FROM Regions WHERE coordinator = '" + name + "'"
print("Concatenated SQL:", sql)
try:
    print(cur.execute(sql).fetchall())
except sqlite3.OperationalError as error:
    print(type(error).__name__ + ":", error)
print("Parameterized SQL: SELECT region FROM Regions WHERE coordinator = ?")
print("Parameters:", (name,))
print(cur.execute("SELECT region FROM Regions WHERE coordinator = ?", (name,)).fetchone())
con.close()`;
const commitStart = `import sqlite3
con = sqlite3.connect("intake.db")
con2 = sqlite3.connect("intake.db")
cur = con.cursor()
cur2 = con2.cursor()
count = "SELECT COUNT(*) FROM Requests"
cur.execute("INSERT INTO Requests VALUES (?, ?, ?, ?, ?)",
            ("R001", 1, "Riverbend", "Essential", 80))
print("Connection A:", cur.execute(count).fetchone())
print("Connection B:", cur2.execute(count).fetchone())
# Keep both connections open. Complete the commit and count checks below.`;
const load = `import csv
import sqlite3
con = sqlite3.connect("intake.db")
cur = con.cursor()
cur.execute("DELETE FROM Requests")  # Allows a repeatable load.
refused = []
with open("camp_requests.csv", newline="") as f:
    for row in csv.DictReader(f):
        try:
            cur.execute("INSERT INTO Requests VALUES (?, ?, ?, ?, ?)",
                        (row["request_id"], int(row["camp_id"]), row["camp_name"],
                         row["category"], int(row["qty_requested"])))
        except sqlite3.IntegrityError as error:
            refused.append((row["request_id"], str(error)))
con.commit()
con.close()
print("Refused:", refused)
# Verify through a new connection.
check = sqlite3.connect("intake.db")
print("Stored count:", check.execute("SELECT COUNT(*) FROM Requests").fetchone()[0])
print("Camp 3 names:", check.execute(
    "SELECT DISTINCT camp_name FROM Requests WHERE camp_id = 3").fetchall())
print("Blank category:", check.execute(
    "SELECT request_id, category FROM Requests WHERE category = ''").fetchall())
check.close()`;
const pandas = `import sqlite3
import pandas as pd
con = sqlite3.connect("intake.db")
df = pd.read_sql_query("""SELECT request_id, camp_id, qty_requested
                          FROM Requests WHERE category = ? ORDER BY request_id""",
                       con, params=("Shelter",))
print(df)
print("Shape (rows, columns):", df.shape)
con.close()`;

const originalExercises = [
  { id: 'python-query', title: 'Run SQL through Python', time: '0-5 min',
    prompt: 'Find North camp names and capacities. Run the SQL comparison, then the Python program. Which calls connect, execute, fetch, and close? What changes for South?',
    prediction: 'Will Python return the same two rows as the SQL query?',
    starter: query, solution: query,
    explanation: 'The same SELECT returns Riverbend (1200) and Hilltop (800). SQL shows a table; fetchall() gives Python a list of tuples.',
    tables: ['Camps'], comparisonSql: "SELECT name, capacity FROM Camps WHERE region = 'North' ORDER BY camp_id;" },
  { id: 'python-fetch', title: 'Read the returned rows', time: '5-10 min',
    prompt: 'Run fetchall(), inspect rows[0] and rows[0][1], and compare a count from fetchone() with a loop. Edit the query to select only name. How does each tuple change?',
    prediction: 'What will the first row, first capacity, and count tuple contain?',
    starter: fetches, solution: fetches,
    explanation: "rows[0] is ('Riverbend', 1200); rows[0][1] is 1200. COUNT returns (5,), not just 5. A one-column result still has tuples, such as ('Riverbend',).",
    tables: ['Camps'] },
  { id: 'python-parameters', title: 'Parameters and common errors', time: '10-16 min',
    prompt: "Change North to South without changing the SQL. Remove the comma from (region,) and run to see the error; repair it. Then try the quoted-name example with O'Hara.",
    prediction: 'Why must a single parameter keep its trailing comma?',
    starter: parameters, solution: parameters + '\n\n' + quote,
    explanation: '(region,) is a one-value tuple. (region) is a string, so its characters are treated as separate bindings. A placeholder handles an apostrophe as part of the value.',
    snippets: [{ label: 'Region query', code: parameters }, { label: "Quoted name: O'Hara", code: quote }], tables: ['Camps', 'Regions'] },
  { id: 'python-commit', title: 'See what commit changes', time: '16-21 min',
    prompt: 'Run Insert with A. Read through B, commit with A, then read B again. Reset Example and repeat using Close A without commit. Reset before inserting the same request again.',
    prediction: 'A sees one row before commit. Will B see zero or one?',
    starter: commitStart, solution: commitStart + '\ncon.commit()\nprint("B after commit:", cur2.execute(count).fetchone())\ncon.close()\ncon2.close()',
    explanation: 'Before commit: A sees (1,) and B sees (0,). After commit B sees (1,). In a fresh example, closing A without committing leaves B at (0,).',
    actions: [ { label: '1. Insert with A', code: commitStart },
      { label: '2. Read B', code: 'print("Connection B:", cur2.execute(count).fetchone())' },
      { label: '3. Commit A', code: 'con.commit()\nprint("Committed through A")' },
      { label: 'Close A without commit', code: 'con.close()\nprint("Closed A; any uncommitted insert was discarded")' } ], tables: ['Requests'] },
  { id: 'python-csv', title: 'Load a CSV and verify it', time: '21-28 min',
    prompt: 'Inspect the CSV and predict the accepted count. Run the importer and inspect the refused records. Did a trailing space or blank category break a table constraint? Verify the count through a new connection.',
    prediction: 'There are 16 records and a repeated request id. How many rows will be stored?',
    starter: load, solution: load,
    explanation: "15 rows are stored; the second R007 is refused by the primary key. 'Lakeside ' and the empty category pass because the schema has no rules rejecting them. CSV numeric fields arrive as text and are converted with int().",
    snippets: [{ label: 'CSV importer', code: load }, { label: 'CSV text versus numbers', code: `import csv
with open("camp_requests.csv", newline="") as f:
    rows = list(csv.DictReader(f))
print("Records:", len(rows))
print(rows[0])
print("As text:", rows[0]["qty_requested"] > rows[4]["qty_requested"])
print("As numbers:", int(rows[0]["qty_requested"]) > int(rows[4]["qty_requested"]))` }], tables: ['Requests'], csv: true },
  { id: 'python-pandas', title: 'Read a query into pandas', time: '28-30 min',
    prompt: 'Read Shelter requests into a DataFrame. Predict df.shape. Change the category and run again. Which part selects the rows, and which part presents them as a Python table?',
    prediction: 'How many Shelter requests and selected columns are there?',
    starter: pandas, solution: pandas,
    explanation: 'The Shelter result has shape (4, 3): four rows and three selected columns. SQL selects the records; pandas holds the returned table. This exercise starts with 15 committed requests already loaded.',
    tables: ['Requests'], csv: true, preload: true },
];


const singleRow = `import sqlite3
con = sqlite3.connect("relief.db")
cur = con.cursor()
row = cur.execute("SELECT COUNT(*) FROM Camps WHERE capacity > ?", (900,)).fetchone()
print("Count tuple:", row)
print("Count value:", row[0])
print("Missing camp:", cur.execute("SELECT name FROM Camps WHERE camp_id = ?", (99,)).fetchone())
print("Missing rows:", cur.execute("SELECT name FROM Camps WHERE camp_id = ?", (99,)).fetchall())
print("SQL NULL:", cur.execute("SELECT overflow_camp_id FROM Camps WHERE camp_id = ?", (3,)).fetchone())
con.close()`;
const loop = `import sqlite3
con = sqlite3.connect("relief.db")
for name, capacity in con.execute("SELECT name, capacity FROM Camps ORDER BY camp_id"):
    if capacity > 900:
        print(name, "has", capacity, "places")
con.close()`;
const twoValues = `import sqlite3
con = sqlite3.connect("relief.db")
sql = "SELECT name, capacity FROM Camps WHERE region = ? AND capacity > ? ORDER BY camp_id"
region = "North"
minimum = 1000
print(con.execute(sql, (region, minimum)).fetchall())
con.close()`;
const csvTypes = `import csv
with open("camp_requests.csv", newline="") as f:
    rows = list(csv.DictReader(f))
first = rows[0]["qty_requested"]
fifth = rows[4]["qty_requested"]
print("Records:", len(rows))
print("Values:", repr(first), repr(fifth))
print("Type:", type(first).__name__)
print("As text:", first > fifth)
print("As integers:", int(first) > int(fifth))`;
const clean = `import sqlite3
con = sqlite3.connect("intake.db")
print("Before:", con.execute("SELECT DISTINCT camp_name FROM Requests WHERE camp_id = 3").fetchall())
con.execute("UPDATE Requests SET camp_name = TRIM(camp_name)")
con.commit()
print("After:", con.execute("SELECT DISTINCT camp_name FROM Requests WHERE camp_id = 3").fetchall())
print("Needs review:", con.execute("SELECT request_id, category FROM Requests WHERE category = ''").fetchall())
print("Count:", con.execute("SELECT COUNT(*) FROM Requests").fetchone()[0])
con.close()`;
const debugStarter = `import sqlite3
con = sqlite3.connect("relief.db")
region = "North"
rows = con.execute("SELECT name FROM Camps WHERE region = ?", (region)).fetchall()
total = con.execute("SELECT SUM(capacity) FROM Camps WHERE region = ?", (region,)).fetchone()
print("Camp count:", len(rows))
print("Total capacity:", total)
con.close()`;
const debugSolution = debugStarter.replace('(region)).fetchall()', '(region,)).fetchall()')
  .replace('print("Total capacity:", total)', 'print("Total capacity:", total[0])');
const extraExercises = [
  { id: 'python-single-row', title: 'One row, no row, and NULL',
    prompt: 'Count camps with capacity above 900. Print the tuple and the number inside it. Query an unknown camp, then Lakeside\'s NULL overflow value. How do None, [], and (None,) differ?',
    prediction: 'Does fetchone() return 3 or (3,)? Is an absent row the same as a row containing NULL?',
    starter: singleRow, solution: singleRow,
    explanation: 'The count is (3,), with value 3 at index 0. No matching row gives None from fetchone() and [] from fetchall(). A matching row whose selected value is SQL NULL gives (None,).',
    tables: ['Camps'] },
  { id: 'python-row-loop', title: 'Use Python to act on each row',
    prompt: 'Print a message for each camp with capacity above 900. Predict which three camps appear. Change the threshold to 1200, then change > to >=. Explain which work SQL does and which work Python does.',
    prediction: 'Will a camp at exactly the threshold pass the > condition?',
    starter: loop, solution: loop,
    explanation: 'At 900, Riverbend, Lakeside, and Pine Valley print. At > 1200 only Lakeside prints; at >= 1200 Riverbend also prints. SQL supplies rows and Python applies an if and prints each message.',
    tables: ['Camps'] },
  { id: 'python-two-values', title: 'Bind two values in the right order',
    prompt: 'Find North camps with capacity above 1000. Change the minimum to 700. Remove a value to see the binding-count error; restore it. Why must the tuple follow the placeholder order?',
    prediction: 'How many ? marks and tuple values are needed? Which camp appears at 1000?',
    starter: twoValues, solution: twoValues,
    explanation: 'Two placeholders require two values, in order: region then capacity. At 1000 only Riverbend appears; at 700 both North camps appear. A missing parameter raises ProgrammingError.',
    tables: ['Camps'] },
  { id: 'python-csv-types', title: 'CSV values are text',
    prompt: 'Read the CSV without loading it into the database. Inspect qty_requested for R001 and R005. Compare the values as text and then as integers. Why is numeric conversion necessary?',
    prediction: 'Will "80" > "720" give the same result as 80 > 720?',
    starter: csvTypes, solution: csvTypes,
    explanation: 'DictReader returns strings. Text comparison gives True because 8 comes after 7; integer comparison gives False because 80 is less than 720. Convert numeric fields with int() before numeric operations.',
    tables: ['Requests'], csv: true },
  { id: 'python-clean-check', title: 'A successful load still needs checks',
    prompt: 'This example starts with the 15 imported requests. Inspect camp 3\'s two name spellings. Run a targeted TRIM update, commit, and verify the names and row count. List the blank category for review without guessing its value.',
    prediction: 'Will trimming a camp name reduce the 15 stored rows? Should a missing category be invented?',
    starter: clean, solution: clean,
    explanation: 'TRIM removes the trailing space without deleting a request: the count stays 15. R009 still has an empty category. Loading successfully only proves that the declared constraints passed; missing information still needs review.',
    tables: ['Requests'], csv: true, preload: true },
  { id: 'python-debug-recap', title: 'Debug the final program',
    prompt: 'Repair two issues. First, make the parameterized query run. Then print the total capacity as a number, rather than a tuple. The corrected program should print a camp count of 2 and total capacity of 2000.',
    prediction: 'Which issue raises an exception, and which only produces the wrong output format?',
    starter: debugStarter, solution: debugSolution,
    explanation: 'Use (region,) to pass one parameter, and total[0] to extract SUM from its one-value tuple. The missing comma raises a binding error; printing the tuple runs but gives (2000,) rather than 2000.',
    tables: ['Camps'] },
];

// Preserve existing exercise ids so previously saved code remains available.
const orderedExercises = [
  originalExercises[0], extraExercises[0], originalExercises[1], extraExercises[1],
  originalExercises[2], extraExercises[2], originalExercises[3], extraExercises[3],
  originalExercises[4], extraExercises[4], originalExercises[5], extraExercises[5],
];
const timeSlots = ['0-3 min', '3-5 min', '5-7 min', '7-9 min', '9-12 min', '12-14 min',
  '14-18 min', '18-20 min', '20-24 min', '24-26 min', '26-28 min', '28-30 min'];

// Starters are exact solution skeletons with only TODO blocks removed.
const practiceSolutions = {
  "python-fetch": "import sqlite3\ncon = sqlite3.connect(\"relief.db\")\ncur = con.cursor()\ncur.execute(\"SELECT name, capacity FROM Camps ORDER BY camp_id\")\nrows = cur.fetchall()\nprint(rows)\nprint(\"First row:\", rows[0])\nprint(\"First capacity:\", rows[0][1])\ncur.execute(\"SELECT COUNT(*) FROM Camps\")\nprint(\"Count tuple:\", cur.fetchone())\ncon.close()",
  "python-parameters": "import sqlite3\ncon = sqlite3.connect(\"relief.db\")\ncur = con.cursor()\nregion = \"North\"\nsql = \"SELECT name, capacity FROM Camps WHERE region = ? ORDER BY camp_id\"\nprint(cur.execute(sql, (region,)).fetchall())\ncon.close()",
  "python-two-values": "import sqlite3\ncon = sqlite3.connect(\"relief.db\")\nsql = \"SELECT name, capacity FROM Camps WHERE region = ? AND capacity > ? ORDER BY camp_id\"\nregion = \"North\"\nminimum = 1000\nvalues = (region, minimum)\nprint(con.execute(sql, values).fetchall())\ncon.close()"
};
const practiceStarters = {
  "python-fetch": "import sqlite3\ncon = sqlite3.connect(\"relief.db\")\ncur = con.cursor()\ncur.execute(\"SELECT name, capacity FROM Camps ORDER BY camp_id\")\n# TODO 1: Fetch all returned rows into a variable called rows.\nprint(rows)\n# TODO 2: Print the first row, then its capacity, using rows.\ncur.execute(\"SELECT COUNT(*) FROM Camps\")\n# TODO 3: Retrieve and print the count tuple using fetchone().\ncon.close()",
  "python-row-loop": "import sqlite3\ncon = sqlite3.connect(\"relief.db\")\nfor name, capacity in con.execute(\"SELECT name, capacity FROM Camps ORDER BY camp_id\"):\n    # TODO: Add an if statement for capacity > 900 and print the camp message.\ncon.close()",
  "python-parameters": "import sqlite3\ncon = sqlite3.connect(\"relief.db\")\ncur = con.cursor()\nregion = \"North\"\nsql = \"SELECT name, capacity FROM Camps WHERE region = ? ORDER BY camp_id\"\n# TODO: Execute sql with region as a one-value tuple, fetch all rows, and print.\ncon.close()",
  "python-two-values": "import sqlite3\ncon = sqlite3.connect(\"relief.db\")\nsql = \"SELECT name, capacity FROM Camps WHERE region = ? AND capacity > ? ORDER BY camp_id\"\nregion = \"North\"\nminimum = 1000\n# TODO 1: Store region and minimum in a tuple called values, in SQL order.\n# TODO 2: Execute sql using values, fetch all rows, and print.\ncon.close()",
  "python-commit": "import sqlite3\ncon = sqlite3.connect(\"intake.db\")\ncon2 = sqlite3.connect(\"intake.db\")\ncur = con.cursor()\ncur2 = con2.cursor()\ncount = \"SELECT COUNT(*) FROM Requests\"\ncur.execute(\"INSERT INTO Requests VALUES (?, ?, ?, ?, ?)\",\n            (\"R001\", 1, \"Riverbend\", \"Essential\", 80))\n# TODO 1: Print counts through cur (A) and cur2 (B) before commit.\n# Keep both connections open. Complete the commit and count checks below.\n# TODO 2: Commit the write through connection A.\n# TODO 3: Query and print the count through cur2 again.\ncon.close()\ncon2.close()",
  "python-csv-types": "import csv\nwith open(\"camp_requests.csv\", newline=\"\") as f:\n    # TODO 1: Use csv.DictReader to collect the CSV records into rows.\nfirst = rows[0][\"qty_requested\"]\nfifth = rows[4][\"qty_requested\"]\nprint(\"Records:\", len(rows))\nprint(\"Values:\", repr(first), repr(fifth))\nprint(\"Type:\", type(first).__name__)\nprint(\"As text:\", first > fifth)\n# TODO 2: Convert both values to integers, compare them, and print.",
  "python-csv": "import csv\nimport sqlite3\ncon = sqlite3.connect(\"intake.db\")\ncur = con.cursor()\ncur.execute(\"DELETE FROM Requests\")  # Allows a repeatable load.\nrefused = []\nwith open(\"camp_requests.csv\", newline=\"\") as f:\n    for row in csv.DictReader(f):\n        try:\n            # TODO 1: INSERT five values with placeholders; convert both numeric fields.\n            # Order: request_id, camp_id, camp_name, category, qty_requested.\n        except sqlite3.IntegrityError as error:\n            # TODO 2: Append the request id and error message to refused.\n# TODO 3: Commit the accepted records once, after the loop.\ncon.close()\nprint(\"Refused:\", refused)\n# Verify through a new connection.\ncheck = sqlite3.connect(\"intake.db\")\n# TODO 4: Query and print the stored request count through check.\nprint(\"Camp 3 names:\", check.execute(\n    \"SELECT DISTINCT camp_name FROM Requests WHERE camp_id = 3\").fetchall())\nprint(\"Blank category:\", check.execute(\n    \"SELECT request_id, category FROM Requests WHERE category = ''\").fetchall())\ncheck.close()",
  "python-clean-check": "import sqlite3\ncon = sqlite3.connect(\"intake.db\")\nprint(\"Before:\", con.execute(\"SELECT DISTINCT camp_name FROM Requests WHERE camp_id = 3\").fetchall())\n# TODO 1: Execute an UPDATE to trim camp_name, then commit.\nprint(\"After:\", con.execute(\"SELECT DISTINCT camp_name FROM Requests WHERE camp_id = 3\").fetchall())\n# TODO 2: Query and print request_id and category where category is empty text.\nprint(\"Count:\", con.execute(\"SELECT COUNT(*) FROM Requests\").fetchone()[0])\ncon.close()",
  "python-pandas": "import sqlite3\nimport pandas as pd\ncon = sqlite3.connect(\"intake.db\")\n# TODO 1: Create df with pd.read_sql_query, selecting request_id, camp_id,\n# and qty_requested from Requests for category Shelter, ordered by request_id.\n# Use a ? placeholder and params for the category value.\nprint(df)\n# TODO 2: Print the DataFrame shape as (rows, columns).\ncon.close()"
};
const practicePrompts = {
  'python-fetch': 'Complete the three TODOs: retrieve all camp rows, print the first row and its capacity, and retrieve the count tuple. Write your code below each TODO comment, then run.',
  'python-row-loop': 'Complete the loop with an if statement and a print message for camps with capacity above 900. Write your code below the TODO comment. Then test > 1200 and >= 1200.',
  'python-parameters': 'Complete execute and fetchall using the one-value tuple for region. Start with North, then change region to South without changing the SQL. Try removing the tuple comma to observe the error.',
  'python-two-values': 'Fill the two TODOs: build the tuple in placeholder order, then execute and print the rows. Test a minimum of 1000 and then 700. Remove one tuple value to observe the binding error.',
  'python-commit': 'Complete all three TODOs: print counts through A and B before commit, commit with A, then print B again. Reset Example before each full rerun. For a second experiment, replace commit with con.close() and predict B.',
  'python-csv-types': 'Complete DictReader and the integer comparison. Predict the two comparison results before running. Write your code below both TODO comments.',
  'python-csv': 'Complete the INSERT, refusal logging, final commit, and verification count. Use five placeholders and convert both numeric fields. Inspect the CSV first, then complete all four TODO blocks and run.',
  'python-clean-check': 'The 15 accepted requests are preloaded. Complete the trimming UPDATE and commit, then query blank categories for review. Keep all requests and do not invent a category value.',
  'python-pandas': 'The 15 accepted requests are preloaded. Complete the DataFrame query with a parameter tuple and print its shape. Complete both TODO blocks, then test another category.',
};
const expectedResults = [
  'North returns Riverbend (1200) and Hilltop (800).',
  'Count: (3,) and 3. Missing row: None or []; selected NULL value: (None,).',
  "Five camp rows; first row ('Riverbend', 1200); first capacity 1200; count tuple (5,).",
  'At > 900: Riverbend, Lakeside, and Pine Valley. At > 1200: Lakeside only.',
  'North: two rows. South: Lakeside (2000).',
  'North above 1000: Riverbend only. Above 700: Riverbend and Hilltop.',
  'Before commit: A (1,), B (0,). After commit: B (1,). Close without commit: B (0,).',
  '16 records; values are str; text comparison True; integer comparison False.',
  '15 stored requests; the repeated R007 is refused with a UNIQUE constraint message.',
  "Camp 3 has one spelling after trimming; R009 still needs category review; count stays 15.",
  'Shelter returns four rows and three selected columns: shape (4, 3).',
  'After repair: Camp count: 2 and Total capacity: 2000 (a number, not a tuple).',
];
export const day15Exercises = orderedExercises.map((exercise, index) => ({
  ...exercise,
  time: timeSlots[index],
  mode: index < 2 ? 'demo' : index === 11 ? 'debug' : 'practice',
  starter: practiceStarters[exercise.id] ?? exercise.starter,
  solution: practiceSolutions[exercise.id] ?? exercise.solution,
  prompt: practicePrompts[exercise.id] ?? exercise.prompt,
  expected: expectedResults[index],
  // Completed programs and transaction shortcuts belong under Show Solution.
  snippets: index < 2 ? exercise.snippets : undefined,
  actions: undefined,
}));
