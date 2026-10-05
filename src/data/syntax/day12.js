export const day12Syntax = [
  {
    title: "JOIN ... ON",
    description: "Combine rows from two tables when the pairing condition is true.",
    syntax: `SELECT a.column1, b.column2
FROM table_a AS a
JOIN table_b AS b
  ON a.foreign_key = b.primary_key;`,
  },
  {
    title: "Qualified Names + Aliases",
    description: "Use table aliases to keep joined-column references clear and short.",
    syntax: `SELECT t.id, l.name
FROM transactions AS t
JOIN locations AS l
  ON t.location_id = l.location_id;`,
  },
  {
    title: "JOIN + WHERE",
    description: "ON pairs tables; WHERE filters the joined rows afterward.",
    syntax: `SELECT t.id, l.name
FROM transactions AS t
JOIN locations AS l
  ON t.location_id = l.location_id
WHERE l.capacity > 1000;`,
  },
  {
    title: "Chained Joins",
    description: "Add one JOIN and one ON condition for each additional table.",
    syntax: `SELECT t.id, l.name, i.name
FROM transactions AS t
JOIN locations AS l
  ON t.location_id = l.location_id
JOIN items AS i
  ON t.item_id = i.item_id;`,
  },
  {
    title: "LEFT JOIN",
    description: "Keep every row from the left table even when no right-side row matches.",
    syntax: `SELECT l.name, r.leader
FROM locations AS l
LEFT JOIN regions AS r
  ON l.region = r.region;`,
  },
  {
    title: "Find Missing Relationships",
    description: "LEFT JOIN followed by IS NULL finds left-side rows with no match.",
    syntax: `SELECT i.id, i.name
FROM items AS i
LEFT JOIN transactions AS t
  ON i.id = t.item_id
WHERE t.id IS NULL;`,
  },
  {
    title: "LEFT JOIN: ON vs WHERE",
    description: "Put a right-table matching condition in ON when unmatched left rows must survive.",
    syntax: `SELECT l.name, t.id
FROM locations AS l
LEFT JOIN transactions AS t
  ON t.location_id = l.location_id
 AND t.status = 'planned';`,
  },
  {
    title: "Self-Join",
    description: "Read one table twice under two aliases to follow a relationship within the table.",
    syntax: `SELECT a.name, b.name
FROM locations AS a
JOIN locations AS b
  ON a.related_location_id = b.location_id;`,
  },
  {
    title: "Avoid Accidental Cartesian Products",
    description: "A comma-separated FROM without a pairing condition returns every possible pair.",
    syntax: `-- Risky: every pair
SELECT *
FROM table_a, table_b;

-- Preferred: state the relationship
SELECT *
FROM table_a AS a
JOIN table_b AS b
  ON a.key = b.key;`,
  },
];
