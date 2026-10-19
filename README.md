# ISE 2530 — SQL Practice Platform

Browser-based SQL practice for live classroom exercises. SQLite runs in the student's browser through `sql.js`; no backend database server is required.

## Current behavior

The current release contains both:

- **Day 10 — Creating & Populating Tables** (Questions 1–15)
- **Day 11 — Filtering and NULL Logic** (Questions 16–30)

for:

- Supply Chain
- Healthcare
- Humanitarian Operations

The UI includes question pagination, a full-code hint for each question, a dynamic Syntax Guide modal, RPI branding, table/schema previews, and real SQLite execution.

## Project structure

```text
src/
├── data/
│   ├── courseDays.js             # current day + registered course days
│   ├── databases/
│   │   ├── day10/                # canonical DB setup for Day 10
│   │   └── day11/                # canonical DB setup for Day 11
│   ├── questions/
│   │   ├── day10.js
│   │   └── day11.js
│   └── syntax/
│       ├── day10.js
│       └── day11.js
├── db/
│   └── databaseService.js        # SQLite load/save/reset/run logic
├── storage/
│   └── browserStorage.js         # localStorage keys and persistence
├── ui/
│   ├── appView.js
│   └── syntaxModal.js
├── styles/
│   └── app.css
└── main.js
```

## Browser persistence

Both student SQL and SQLite database state are saved in browser `localStorage`.

Student code is stored by:

```text
day + domain + question
```

Example:

```text
code:day10:humanitarian:q1
```

The SQLite database is stored by:

```text
day + domain + database version
```

Example:

```text
db:day10:humanitarian:v1
```

This prevents one class day's modified database from leaking into another class day.

### What happens on refresh?

For the same day/domain/version:

- student SQL returns;
- their modified SQLite database returns;
- their current question returns.

### What happens when Day 11 is released?

Day 11 gets its own canonical database and its own storage namespace. A student's modified Day 10 database remains available if they revisit Day 10, but Day 11 starts from the instructor-provided Day 11 database.

## Database versioning

Each day has a `databaseVersion` in:

```text
src/data/courseDays.js
```

Example:

```js
databaseVersion: 1
```

If you change a released day's canonical starter database and need every student to receive the corrected database, increment it:

```js
databaseVersion: 2
```

The app then looks for a new browser key such as:

```text
db:day10:humanitarian:v2
```

Because that key does not exist yet, it automatically builds the new canonical database. No student has to clear browser storage manually.

## Day 11 implementation

Day 11 is registered in `src/data/courseDays.js` and is the current default day. It uses its own canonical database namespace and includes Questions 16–30 plus a Day 11-specific Syntax Guide.

The Day 11 databases intentionally start from a clean canonical snapshot, even if a student changed or dropped tables during Day 10. Students can switch back to Day 10 without losing their Day 10 code or database state.

To release a future day, repeat the same pattern with a new database folder, questions file, syntax file, and `courseDays.js` registration.

## Reset Database

**Reset Database** resets only the current:

```text
day + domain + database version
```

It keeps the student's saved SQL code.

## Current data volume

Each domain contains:

- 5 master/location rows
- 5 item/service/product rows
- 25 transaction rows

The data are large enough for later filtering, joins, subqueries, aggregation, and views while remaining manageable for class demonstrations.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Render

`render.yaml` is included.

You can deploy as a Render Blueprint, or as a Static Site with:

```text
Build Command: npm install && npm run build
Publish Directory: dist
```

No backend, environment variables, or external database service are required.


## Day 15: Python + SQLite lab (30 minutes)

Day 15 is the default day; Days 10-14 remain available in the day tabs.
The 12 humanitarian questions provide a 30-minute guided route, using short
prediction and debugging activities alongside the main demonstrations.

| Question | Topic | Time |
| --- | --- | --- |
| 1 | Run SQL through Python | 0-3 min |
| 2 | One row, no row, and NULL | 3-5 min |
| 3 | Read the returned rows | 5-7 min |
| 4 | Use Python to act on each row | 7-9 min |
| 5 | Parameters and common errors | 9-12 min |
| 6 | Bind two values in the right order | 12-14 min |
| 7 | See what commit changes | 14-18 min |
| 8 | CSV values are text | 18-20 min |
| 9 | Load a CSV and verify it | 20-24 min |
| 10 | A successful load still needs checks | 24-26 min |
| 11 | Read a query into pandas | 26-28 min |
| 12 | Debug the final program | 28-30 min |

The timings assume prepared code with brief predictions and targeted edits.
Use the added questions for follow-up practice if a longer discussion takes time.

Python runs in a dedicated browser worker using Pyodide 0.27.7, SQLite,
and pandas. No backend or Python installation is required. The runtime and
packages download from https://cdn.jsdelivr.net/pyodide/v0.27.7/full/.
Internet access to that origin is required; allow it in any site CSP.
Open Day 15 before class, and run question 11 once to warm the pandas cache.
A fresh worker is used when changing exercises or resetting; cached downloads
are normally reused. pandas loads only for code that imports it.

- Code is saved locally per exercise. Practice databases are temporary browser
  files: they last within the current exercise, across Run clicks and selected-line
  runs, but reset on exercise/day changes or page reload. These are separate from
  the persistent SQL.js databases used by earlier days.
- Reset Example restores starter code, closes the worker, and recreates the data.
- Stop terminates the worker, including an infinite loop. Reset Example restarts it.
  Requests time out after two minutes; output is limited to 60,000 characters.
- Questions 1-2 are complete demonstrations. Questions 3-11 have explicit TODOs
  comments marking the missing code blocks. All surrounding lines match the
  corresponding solution exactly; no exception placeholders are included.
  Question 12 contains two bugs to repair. Each question states expected results.
- Students add code below the TODO comments. Show Solution stays collapsed
  and offers the same program with the missing blocks filled. Incomplete code
  reports normal Python errors when run. No completed snippet/action shortcuts
  are shown.
- Practice and debugging answers use a new storage scope so complete examples saved by the
  earlier release do not overwrite comment-only TODO starters. Existing work stays stored.
- Question 7 now requires student-written count checks and commit in the editor.
  Reset before a full rerun to avoid duplicate-key errors. For the no-commit
  experiment, reset and replace the commit line with `con.close()`.
- Show Tables reads committed rows through a separate connection. Strings are
  quoted to expose empty values and trailing spaces. It does not show uncommitted
  changes through A; the explicit A/B print statements show those.
- Question 9 starts empty. Its CSV has 16 records, 15 unique request ids, a
  duplicate R007, a trailing space in R004, and a blank category in R009.
  Only the primary-key duplicate is rejected. Questions 10 and 11 preload the 15 accepted
  rows so it works independently. Download CSV provides the same teaching file.
- The comparison SQL editor in question 1 executes real SQLite via Python and
  displays its rows as a table; the Python editor prints tuples from the same data.

Apply the supplied patch from the project root, then use the usual `npm install`
and `npm run build`. Hosting settings do not otherwise change.


### Python editor indentation

- Enter keeps the current line indentation and adds four spaces after a block
  colon (including a colon followed by an inline comment).
- Tab inserts four spaces at the caret, or indents selected lines.
- Shift+Tab removes up to four leading spaces (or one leading tab) from the
  current line or selected lines.
- Ctrl/Cmd+Enter still runs the selection or full program. Edits are saved.

This is typing assistance; it does not reformat existing or pasted Python code.
