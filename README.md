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
