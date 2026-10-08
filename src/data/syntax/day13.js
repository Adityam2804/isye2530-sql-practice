export const day13Syntax = [
  {
    title: "IN with a Subquery",
    description: "Use a one-column query result as the list tested by IN.",
    syntax: `SELECT c.name
FROM Camps AS c
WHERE c.camp_id IN (
  SELECT s.camp_id
  FROM Shipments AS s
  WHERE s.status = 'planned'
);`,
  },
  {
    title: "NOT IN + NULL Safety",
    description:
      "If the subquery column can contain NULL, filter NULL out before using NOT IN.",
    syntax: `SELECT c.name
FROM Camps AS c
WHERE c.camp_id NOT IN (
  SELECT c2.overflow_camp_id
  FROM Camps AS c2
  WHERE c2.overflow_camp_id IS NOT NULL
);`,
  },
  {
    title: "EXISTS",
    description:
      "EXISTS is true when the correlated subquery returns at least one row.",
    syntax: `SELECT c.name
FROM Camps AS c
WHERE EXISTS (
  SELECT 1
  FROM Shipments AS s
  WHERE s.camp_id = c.camp_id
);`,
  },
  {
    title: "NOT EXISTS",
    description:
      "NOT EXISTS keeps an outer row when no matching inner row exists.",
    syntax: `SELECT c.name
FROM Camps AS c
WHERE NOT EXISTS (
  SELECT 1
  FROM Shipments AS s
  WHERE s.camp_id = c.camp_id
);`,
  },
  {
    title: "Scalar Subquery",
    description:
      "A one-row, one-column subquery can be used wherever SQL expects a value.",
    syntax: `SELECT c.name, c.capacity
FROM Camps AS c
WHERE c.capacity > (
  SELECT c2.capacity
  FROM Camps AS c2
  WHERE c2.name = 'Hilltop'
);`,
  },
  {
    title: "UNION",
    description:
      "Combine two compatible query results and remove duplicates.",
    syntax: `SELECT column_name FROM table_a
UNION
SELECT column_name FROM table_b;`,
  },
  {
    title: "UNION ALL",
    description:
      "Combine two compatible query results and keep duplicate rows.",
    syntax: `SELECT column_name FROM table_a
UNION ALL
SELECT column_name FROM table_b;`,
  },
  {
    title: "INTERSECT",
    description:
      "Keep rows that appear in both compatible query results.",
    syntax: `SELECT column_name FROM table_a
INTERSECT
SELECT column_name FROM table_b;`,
  },
  {
    title: "EXCEPT",
    description:
      "Keep rows from the first query that do not appear in the second.",
    syntax: `SELECT column_name FROM table_a
EXCEPT
SELECT column_name FROM table_b;`,
  },
  {
    title: "Alias Convention",
    description:
      "Use aliases that follow table names: Camps c, Shipments s, Items i, Regions r.",
    syntax: `SELECT c.name, s.shipment_id
FROM Camps AS c
JOIN Shipments AS s
  ON s.camp_id = c.camp_id;`,
  },
];
