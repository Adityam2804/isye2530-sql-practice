const shared = {
  humanitarian: {
    locationTable: "Camps",
    locationAlias: "c",
    locationId: "camp_id",
    locationName: "name",
    locationRegion: "region",

    regionTable: "Regions",
    regionAlias: "r",
    regionId: "region",
    regionRole: "coordinator",
    regionRoleLabel: "coordinator",
    regionRoleTitle: "Coordinator",

    itemTable: "Items",
    itemAlias: "i",
    itemId: "item_id",
    itemName: "name",
    itemCategory: "category",

    transactionTable: "Shipments",
    transactionAlias: "s",
    transactionAlias2: "s2",
    transactionId: "shipment_id",
    transactionLocationId: "camp_id",
    transactionItemId: "item_id",
    amount: "qty",
    date: "ship_date",
    status: "status",

    completedStatus: "delivered",
    plannedStatus: "planned",
    delayedStatus: "delayed",

    highVolumeThreshold: 500,
    viewName: "CampCategorySummary",

    locationLabel: "camp",
    itemLabel: "item",
    transactionLabel: "shipment",
    amountLabel: "units",
    dateLabel: "ship date",
  },

  supply: {
    locationTable: "Warehouses",
    locationAlias: "w",
    locationId: "warehouse_id",
    locationName: "name",
    locationRegion: "region",

    regionTable: "Regions",
    regionAlias: "r",
    regionId: "region",
    regionRole: "manager",
    regionRoleLabel: "manager",
    regionRoleTitle: "Manager",

    itemTable: "Products",
    itemAlias: "p",
    itemId: "product_id",
    itemName: "name",
    itemCategory: "category",

    transactionTable: "Shipments",
    transactionAlias: "s",
    transactionAlias2: "s2",
    transactionId: "shipment_id",
    transactionLocationId: "warehouse_id",
    transactionItemId: "product_id",
    amount: "qty",
    date: "ship_date",
    status: "status",

    completedStatus: "delivered",
    plannedStatus: "planned",
    delayedStatus: "delayed",

    highVolumeThreshold: 500,
    viewName: "WarehouseCategorySummary",

    locationLabel: "warehouse",
    itemLabel: "product",
    transactionLabel: "shipment",
    amountLabel: "units",
    dateLabel: "ship date",
  },

  healthcare: {
    locationTable: "Facilities",
    locationAlias: "f",
    locationId: "facility_id",
    locationName: "name",
    locationRegion: "region",

    regionTable: "Regions",
    regionAlias: "r",
    regionId: "region",
    regionRole: "director",
    regionRoleLabel: "director",
    regionRoleTitle: "Director",

    itemTable: "Services",
    itemAlias: "s",
    itemId: "service_id",
    itemName: "name",
    itemCategory: "category",

    transactionTable: "Visits",
    transactionAlias: "v",
    transactionAlias2: "v2",
    transactionId: "visit_id",
    transactionLocationId: "facility_id",
    transactionItemId: "service_id",
    amount: "patient_count",
    date: "visit_date",
    status: "status",

    completedStatus: "completed",
    plannedStatus: "planned",
    delayedStatus: "delayed",

    highVolumeThreshold: 50,
    viewName: "FacilityCategorySummary",

    locationLabel: "facility",
    itemLabel: "service",
    transactionLabel: "visit",
    amountLabel: "patients",
    dateLabel: "visit date",
  },
};

export function buildDay14Questions(domainKey) {
  const d = shared[domainKey];

  const l = d.locationAlias;
  const r = d.regionAlias;
  const i = d.itemAlias;
  const t = d.transactionAlias;
  const t2 = d.transactionAlias2;

  return [
    {
      id: "q58",
      title: `${d.completedStatus[0].toUpperCase()}${d.completedStatus.slice(1)} ${d.transactionTable} Snapshot`,
      topic: "AGGREGATE FUNCTIONS · WHERE",
      prompt: `Considering only '${d.completedStatus}' ${d.transactionTable}, return one summary row containing the number of ${d.transactionTable}, total ${d.amountLabel}, average ${d.amount}, smallest ${d.amount}, and largest ${d.amount}. Give the calculated columns meaningful names.`,
      starterSql: `-- Question 58: Filter the rows first, then summarize them with aggregates\n\n`,
      solutionSql: `SELECT COUNT(*) AS completed_count,
       SUM(${t}.${d.amount}) AS total_amount,
       AVG(${t}.${d.amount}) AS average_amount,
       MIN(${t}.${d.amount}) AS minimum_amount,
       MAX(${t}.${d.amount}) AS maximum_amount
FROM ${d.transactionTable} AS ${t}
WHERE ${t}.${d.status} = '${d.completedStatus}';`,
    },

    {
      id: "q59",
      title: `Extension: Audit Missing ${d.dateLabel}s by Status`,
      topic: "CHALLENGE · COUNT · NULL · GROUP BY",
      prompt: `For each ${d.transactionLabel} status, show the total number of ${d.transactionTable}, how many have a recorded ${d.dateLabel}, and how many are still missing a ${d.dateLabel}. Order the statuses by the number of missing dates, largest first.`,
      starterSql: `-- Question 59: Compare COUNT(*) with COUNT(date_column) inside each group\n\n`,
      solutionSql: `SELECT ${t}.${d.status} AS status,
       COUNT(*) AS transactions,
       COUNT(${t}.${d.date}) AS recorded_dates,
       COUNT(*) - COUNT(${t}.${d.date}) AS missing_dates
FROM ${d.transactionTable} AS ${t}
GROUP BY ${t}.${d.status}
ORDER BY missing_dates DESC, status;`,
    },

    {
      id: "q60",
      title: `${d.transactionTable} Workload by Status`,
      topic: "GROUP BY · COUNT · SUM · AVG",
      prompt: `For each ${d.transactionLabel} status, show the number of ${d.transactionTable}, total ${d.amountLabel}, and average ${d.amount}. Order the groups from largest total amount to smallest.`,
      starterSql: `-- Question 60: One distinct status should become one result row\n\n`,
      solutionSql: `SELECT ${t}.${d.status} AS status,
       COUNT(*) AS transactions,
       SUM(${t}.${d.amount}) AS total_amount,
       AVG(${t}.${d.amount}) AS average_amount
FROM ${d.transactionTable} AS ${t}
GROUP BY ${t}.${d.status}
ORDER BY total_amount DESC, status;`,
    },

    {
      id: "q61",
      title: `Extension: ${d.locationLabel[0].toUpperCase()}${d.locationLabel.slice(1)} and ${d.itemLabel}-Category Summary`,
      topic: "CHALLENGE · 3 TABLES · JOIN + GROUP BY",
      prompt: `For every ${d.locationLabel} and ${d.itemLabel} category combination that actually occurs, show the ${d.locationLabel} name, category, number of ${d.transactionTable}, and total ${d.amountLabel}. Order each ${d.locationLabel}'s categories from the largest total amount to the smallest.`,
      starterSql: `-- Question 61: Join location + transaction + item, then group by location and category\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName} AS location,
       ${i}.${d.itemCategory} AS category,
       COUNT(*) AS transactions,
       SUM(${t}.${d.amount}) AS total_amount
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
JOIN ${d.itemTable} AS ${i}
  ON ${i}.${d.itemId} = ${t}.${d.transactionItemId}
GROUP BY ${l}.${d.locationId}, ${l}.${d.locationName}, ${i}.${d.itemCategory}
ORDER BY ${l}.${d.locationId}, total_amount DESC, category;`,
    },

    {
      id: "q62",
      title: `Extension: ${d.regionRoleTitle} Workload by ${d.transactionLabel} Status`,
      topic: "CHALLENGE · 3 TABLES · MULTIPLE GROUPING COLUMNS",
      prompt: `For each regional ${d.regionRoleLabel} and ${d.transactionLabel} status, show the number of ${d.transactionTable} and total ${d.amountLabel} handled in that ${d.regionRoleLabel}'s region. Keep separate rows for the different statuses.`,
      starterSql: `-- Question 62: Regions + locations + transactions; group by regional role and status\n\n`,
      solutionSql: `SELECT ${r}.${d.regionRole} AS ${d.regionRole},
       ${t}.${d.status} AS status,
       COUNT(*) AS transactions,
       SUM(${t}.${d.amount}) AS total_amount
FROM ${d.regionTable} AS ${r}
JOIN ${d.locationTable} AS ${l}
  ON ${l}.${d.locationRegion} = ${r}.${d.regionId}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
GROUP BY ${r}.${d.regionRole}, ${t}.${d.status}
ORDER BY ${r}.${d.regionRole}, status;`,
    },

    {
      id: "q63",
      title: `Frequently Used ${d.itemTable}`,
      topic: "HAVING · GROUP FILTER",
      prompt: `Show ${d.itemTable} appearing in at least five ${d.transactionTable}. For each qualifying ${d.itemLabel}, display its name, ${d.transactionLabel} count, and total ${d.amountLabel}. Show the most frequently used ${d.itemTable} first.`,
      starterSql: `-- Question 63: A condition on COUNT(*) belongs in HAVING\n\n`,
      solutionSql: `SELECT ${i}.${d.itemName} AS item,
       COUNT(*) AS transactions,
       SUM(${t}.${d.amount}) AS total_amount
FROM ${d.itemTable} AS ${i}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
GROUP BY ${i}.${d.itemId}, ${i}.${d.itemName}
HAVING COUNT(*) >= 5
ORDER BY transactions DESC, total_amount DESC, item;`,
    },

    {
      id: "q64",
      title: `Extension: High-Volume ${d.completedStatus} Regions`,
      topic: "CHALLENGE · 3 TABLES · WHERE + HAVING",
      prompt: `Considering only '${d.completedStatus}' ${d.transactionTable}, show each region, its regional ${d.regionRoleLabel} when one exists, the number of matching ${d.transactionTable}, and total ${d.amountLabel}. Keep only regions with at least three matching ${d.transactionTable} and more than ${d.highVolumeThreshold} total ${d.amountLabel}. Order by total amount, largest first.`,
      starterSql: `-- Question 64: WHERE filters transactions; HAVING filters the regional groups\n\n`,
      solutionSql: `SELECT ${l}.${d.locationRegion} AS region,
       ${r}.${d.regionRole} AS ${d.regionRole},
       COUNT(*) AS completed_count,
       SUM(${t}.${d.amount}) AS completed_amount
FROM ${d.locationTable} AS ${l}
LEFT JOIN ${d.regionTable} AS ${r}
  ON ${r}.${d.regionId} = ${l}.${d.locationRegion}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
WHERE ${t}.${d.status} = '${d.completedStatus}'
GROUP BY ${l}.${d.locationRegion}, ${r}.${d.regionRole}
HAVING COUNT(*) >= 3
   AND SUM(${t}.${d.amount}) > ${d.highVolumeThreshold}
ORDER BY completed_amount DESC, region;`,
    },

    {
      id: "q65",
      title: `Extension: Delayed ${d.transactionTable} Count for Every ${d.locationLabel}`,
      topic: "CHALLENGE · LEFT JOIN · TRUE ZERO",
      prompt: `Return every ${d.locationLabel} with its number of '${d.delayedStatus}' ${d.transactionTable}. ${d.locationTable} with no delayed ${d.transactionLabel} must remain in the result and display zero.`,
      starterSql: `-- Question 65: Preserve every location and count the right-table key\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName} AS location,
       COUNT(${t}.${d.transactionId}) AS delayed_count
FROM ${d.locationTable} AS ${l}
LEFT JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
 AND ${t}.${d.status} = '${d.delayedStatus}'
GROUP BY ${l}.${d.locationId}, ${l}.${d.locationName}
ORDER BY delayed_count DESC, location;`,
    },

    {
      id: "q66",
      title: `Extension: ${d.regionRoleTitle} × ${d.itemLabel} Category Activity Brief`,
      topic: "CHALLENGE · 4 TABLES · MULTI-TABLE AGGREGATION",
      prompt: `For each regional ${d.regionRoleLabel} and ${d.itemLabel} category, show the number of ${d.transactionTable} and total ${d.amountLabel} sent to ${d.locationTable} in that ${d.regionRoleLabel}'s region. Order each ${d.regionRoleLabel}'s categories from largest total amount to smallest.`,
      starterSql: `-- Question 66: Regions + locations + transactions + items\n\n`,
      solutionSql: `SELECT ${r}.${d.regionRole} AS ${d.regionRole},
       ${i}.${d.itemCategory} AS category,
       COUNT(*) AS transactions,
       SUM(${t}.${d.amount}) AS total_amount
FROM ${d.regionTable} AS ${r}
JOIN ${d.locationTable} AS ${l}
  ON ${l}.${d.locationRegion} = ${r}.${d.regionId}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
JOIN ${d.itemTable} AS ${i}
  ON ${i}.${d.itemId} = ${t}.${d.transactionItemId}
GROUP BY ${r}.${d.regionRole}, ${i}.${d.itemCategory}
ORDER BY ${r}.${d.regionRole}, total_amount DESC, category;`,
    },

    {
      id: "q67",
      title: `Extension: Missing-${d.dateLabel} Audit for Each ${d.locationLabel}`,
      topic: "CHALLENGE · JOIN + GROUPED NULL AUDIT",
      prompt: `For every ${d.locationLabel}, show its name, total number of ${d.transactionTable}, number with a recorded ${d.dateLabel}, and number still missing a ${d.dateLabel}. Sort ${d.locationTable} by missing-date count, largest first.`,
      starterSql: `-- Question 67: Compare all rows in each group with the recorded non-NULL dates\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName} AS location,
       COUNT(*) AS total_transactions,
       COUNT(${t}.${d.date}) AS recorded_dates,
       COUNT(*) - COUNT(${t}.${d.date}) AS missing_dates
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
GROUP BY ${l}.${d.locationId}, ${l}.${d.locationName}
ORDER BY missing_dates DESC, location;`,
    },

    {
      id: "q68",
      title: `Extension: Planned Activity by ${d.itemLabel}, Including Zero`,
      topic: "CHALLENGE · LEFT JOIN · COUNT · SUM · COALESCE",
      prompt: `Return every ${d.itemLabel} with its number of '${d.plannedStatus}' ${d.transactionTable} and total planned ${d.amountLabel}. ${d.itemTable} with no planned ${d.transactionLabel} must still appear with zero ${d.transactionTable} and zero ${d.amountLabel}.`,
      starterSql: `-- Question 68: Keep every item and display a true zero for missing planned activity\n\n`,
      solutionSql: `SELECT ${i}.${d.itemName} AS item,
       COUNT(${t}.${d.transactionId}) AS planned_count,
       COALESCE(SUM(${t}.${d.amount}), 0) AS planned_amount
FROM ${d.itemTable} AS ${i}
LEFT JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
 AND ${t}.${d.status} = '${d.plannedStatus}'
GROUP BY ${i}.${d.itemId}, ${i}.${d.itemName}
ORDER BY planned_amount DESC, item;`,
    },

    {
      id: "q69",
      title: `Extension: Top Three High-Activity Categories by Average ${d.transactionLabel} Size`,
      topic: "CHALLENGE · HAVING + ORDER BY + LIMIT",
      prompt: `Among ${d.itemLabel} categories represented by at least four ${d.transactionTable}, return the three categories with the largest average ${d.amount}. Show category, ${d.transactionLabel} count, and average amount.`,
      starterSql: `-- Question 69: Keep eligible category groups, then rank and limit the finished result\n\n`,
      solutionSql: `SELECT ${i}.${d.itemCategory} AS category,
       COUNT(*) AS transactions,
       AVG(${t}.${d.amount}) AS average_amount
FROM ${d.itemTable} AS ${i}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
GROUP BY ${i}.${d.itemCategory}
HAVING COUNT(*) >= 4
ORDER BY average_amount DESC, category
LIMIT 3;`,
    },

    {
      id: "q70",
      title: "Real Challenge Question 1",
      topic: "CHALLENGE · AGGREGATION + SCALAR SUBQUERY",
      prompt: `Compute each ${d.locationLabel}'s average ${d.amount}. Return only ${d.locationTable} whose average is greater than the average ${d.amount} across all ${d.transactionTable} in the database. Rank the qualifying ${d.locationTable} from highest average to lowest.`,
      starterSql: `-- Real Challenge Question 1
-- Compare a per-location aggregate with one database-wide aggregate

`,
      solutionSql: `SELECT ${l}.${d.locationName} AS location,
       AVG(${t}.${d.amount}) AS average_amount
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
GROUP BY ${l}.${d.locationId}, ${l}.${d.locationName}
HAVING AVG(${t}.${d.amount}) > (
  SELECT AVG(${t2}.${d.amount})
  FROM ${d.transactionTable} AS ${t2}
)
ORDER BY average_amount DESC, location;`,
    },

    {
      id: "q71",
      title: "Real Challenge Question 2",
      topic: "CHALLENGE · 3 TABLES · CREATE VIEW",
      prompt: `Create a reusable view named ${d.viewName} with one row per ${d.locationLabel} and ${d.itemLabel} category containing the ${d.locationLabel} name, category, ${d.transactionLabel} count, and total ${d.amountLabel}. Then use the view to return only ${d.locationLabel}/category groups having at least two ${d.transactionTable}, ordered by total amount from largest to smallest.`,
      starterSql: `-- Real Challenge Question 2
-- Create the grouped view first, then query the saved result.
-- If the view already exists from an earlier attempt, use Reset Database before recreating it.

`,
      solutionSql: `CREATE VIEW ${d.viewName} AS
SELECT ${l}.${d.locationName} AS location,
       ${i}.${d.itemCategory} AS category,
       COUNT(*) AS transactions,
       SUM(${t}.${d.amount}) AS total_amount
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
JOIN ${d.itemTable} AS ${i}
  ON ${i}.${d.itemId} = ${t}.${d.transactionItemId}
GROUP BY ${l}.${d.locationId}, ${l}.${d.locationName}, ${i}.${d.itemCategory};

SELECT *
FROM ${d.viewName}
WHERE transactions >= 2
ORDER BY total_amount DESC, location, category;`,
    },

    {
      id: "q72",
      title: "Real Challenge Question 3",
      topic: "CHALLENGE · 3 TABLES · DEBUG LEFT JOIN + COUNT",
      prompt: `The query below is intended to list every ${d.locationLabel}, its regional ${d.regionRoleLabel} when one exists, and its '${d.delayedStatus}'-${d.transactionLabel} count, including ${d.locationTable} with no delayed ${d.transactionTable}. Instead, ${d.locationTable} with zero delayed activity disappear. Repair the query so all ${d.locationTable} remain and a true zero is reported correctly, then explain the two mistakes.`,
      starterSql: `-- Real Challenge Question 3
-- The WHERE condition removes zero-activity locations.
-- Simply moving that condition is not enough: COUNT(*) would then count the NULL-padded row.

SELECT ${l}.${d.locationName} AS location,
       ${r}.${d.regionRole} AS ${d.regionRole},
       COUNT(*) AS delayed_count
FROM ${d.locationTable} AS ${l}
LEFT JOIN ${d.regionTable} AS ${r}
  ON ${r}.${d.regionId} = ${l}.${d.locationRegion}
LEFT JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
WHERE ${t}.${d.status} = '${d.delayedStatus}'
GROUP BY ${l}.${d.locationId}, ${l}.${d.locationName}, ${r}.${d.regionRole}
ORDER BY ${l}.${d.locationId};
`,
      solutionSql: `SELECT ${l}.${d.locationName} AS location,
       ${r}.${d.regionRole} AS ${d.regionRole},
       COUNT(${t}.${d.transactionId}) AS delayed_count
FROM ${d.locationTable} AS ${l}
LEFT JOIN ${d.regionTable} AS ${r}
  ON ${r}.${d.regionId} = ${l}.${d.locationRegion}
LEFT JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
 AND ${t}.${d.status} = '${d.delayedStatus}'
GROUP BY ${l}.${d.locationId}, ${l}.${d.locationName}, ${r}.${d.regionRole}
ORDER BY ${l}.${d.locationId};`,
    },
  ];
}
