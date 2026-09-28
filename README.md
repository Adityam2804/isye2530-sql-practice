# ISE 2530 — SQL Practice Platform

Browser-based SQL practice for live classroom exercises. SQLite runs in the student's browser through `sql.js`; no backend database server is required.

## Current behavior

The current release contains **Day 10 — Creating & Populating Tables** for:

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
│   │   └── day10/                # canonical DB setup for Day 10
│   │       ├── humanitarian.js
│   │       ├── healthcare.js
│   │       ├── supplyChain.js
│   │       └── index.js
│   ├── questions/
│   │   └── day10.js
│   └── syntax/
│       └── day10.js
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

## Adding Day 11

Recommended workflow:

1. Add Day 11 canonical database files:

```text
src/data/databases/day11/
├── humanitarian.js
├── healthcare.js
├── supplyChain.js
└── index.js
```

2. Add:

```text
src/data/questions/day11.js
src/data/syntax/day11.js
```

3. Register Day 11 in `src/data/courseDays.js` with its own `databaseVersion`.

4. Add `day11` to `dayOrder`.

5. Set:

```js
export const CURRENT_DAY_KEY = "day11";
```

On the next page load, students land on Day 11 automatically. Their Day 10 code and Day 10 database remain stored separately.

If more than one day is registered, the UI automatically shows day navigation so students can revisit older work.

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
Build Command: npm ci && npm run build
Publish Directory: dist
```

No backend, environment variables, or external database service are required.
