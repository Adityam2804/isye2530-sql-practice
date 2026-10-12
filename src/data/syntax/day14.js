export const day14Syntax = [
  {
    title: "Aggregate Functions",
    description:
      "COUNT, SUM, AVG, MIN, and MAX collapse multiple rows into summary values.",
    syntax: `SELECT COUNT(*) AS shipments,
       SUM(s.qty) AS total_qty,
       AVG(s.qty) AS average_qty,
       MIN(s.qty) AS minimum_qty,
       MAX(s.qty) AS maximum_qty
FROM Shipments AS s;`,
  },
  {
    title: "COUNT(*) vs COUNT(column)",
    description:
      "COUNT(*) counts every row. COUNT(column) counts only rows where that column is not NULL.",
    syntax: `SELECT COUNT(*) AS all_rows,
       COUNT(s.ship_date) AS recorded_dates
FROM Shipments AS s;`,
  },
  {
    title: "GROUP BY",
    description:
      "GROUP BY creates one result row per distinct grouping value or combination of values.",
    syntax: `SELECT s.status,
       COUNT(*) AS shipments,
       SUM(s.qty) AS total_qty
FROM Shipments AS s
GROUP BY s.status;`,
  },
  {
    title: "HAVING",
    description:
      "HAVING filters finished groups, so aggregate conditions belong here rather than in WHERE.",
    syntax: `SELECT s.camp_id,
       SUM(s.qty) AS total_qty
FROM Shipments AS s
GROUP BY s.camp_id
HAVING SUM(s.qty) > 900;`,
  },
  {
    title: "WHERE Before HAVING",
    description:
      "WHERE filters rows first; GROUP BY creates groups; HAVING then filters those groups.",
    syntax: `SELECT s.camp_id,
       COUNT(*) AS delivered
FROM Shipments AS s
WHERE s.status = 'delivered'
GROUP BY s.camp_id
HAVING COUNT(*) >= 3;`,
  },
  {
    title: "Joins Before GROUP BY",
    description:
      "One or more joins can add labels, regions, or categories before the resulting rows are grouped.",
    syntax: `SELECT r.coordinator,
       i.category,
       SUM(s.qty) AS total_qty
FROM Regions AS r
JOIN Camps AS c
  ON c.region = r.region
JOIN Shipments AS s
  ON s.camp_id = c.camp_id
JOIN Items AS i
  ON i.item_id = s.item_id
GROUP BY r.coordinator, i.category;`,
  },
  {
    title: "LEFT JOIN + True Zero",
    description:
      "Preserve every left-side row and count a right-table key so an unmatched group shows zero.",
    syntax: `SELECT i.name,
       COUNT(s.shipment_id) AS shipments
FROM Items AS i
LEFT JOIN Shipments AS s
  ON s.item_id = i.item_id
GROUP BY i.item_id, i.name;`,
  },
  {
    title: "Zero for a Missing SUM",
    description:
      "SUM over no matching values is NULL. COALESCE can display that missing total as zero.",
    syntax: `SELECT i.name,
       COALESCE(SUM(s.qty), 0) AS total_qty
FROM Items AS i
LEFT JOIN Shipments AS s
  ON s.item_id = i.item_id
GROUP BY i.item_id, i.name;`,
  },
  {
    title: "CREATE VIEW",
    description:
      "A view saves a query under a name. Querying the view reruns its saved query on the current rows.",
    syntax: `CREATE VIEW CampTotals AS
SELECT c.name AS camp,
       COUNT(s.shipment_id) AS shipments,
       SUM(s.qty) AS total_qty
FROM Camps AS c
LEFT JOIN Shipments AS s
  ON s.camp_id = c.camp_id
GROUP BY c.camp_id, c.name;

SELECT *
FROM CampTotals;`,
  },
  {
    title: "Grouped Query Run Order",
    description:
      "Think in this order: FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT.",
    syntax: `-- Rows first:
-- FROM / JOIN -> WHERE
-- Groups next:
-- GROUP BY -> HAVING
-- Finish the result:
-- SELECT -> DISTINCT -> ORDER BY -> LIMIT`,
  },
  {
    title: "Alias Convention",
    description:
      "Keep aliases tied to table names: Regions r, Camps c, Shipments s, Items i; Facilities f, Visits v; Warehouses w, Products p.",
    syntax: `SELECT c.name,
       SUM(s.qty) AS total_qty
FROM Camps AS c
JOIN Shipments AS s
  ON s.camp_id = c.camp_id
GROUP BY c.camp_id, c.name;`,
  },
];
