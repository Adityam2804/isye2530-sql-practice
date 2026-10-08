const shared = {
  humanitarian: {
    locationTable: "Camps",
    locationAlias: "c",
    locationAlias2: "c2",
    locationId: "camp_id",
    locationName: "name",
    locationCapacity: "capacity",
    relationId: "overflow_camp_id",
    itemTable: "Items",
    itemAlias: "i",
    itemAlias2: "i2",
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
    status: "status",
    plannedStatus: "planned",
    completedStatus: "delivered",
    middleStatus: "in transit",
    delayedStatus: "delayed",
    categoryA: "Essential",
    categoryB: "Medical",
    targetLocation: "Pine Valley",
    scalarReferenceLocation: "Hilltop",
    differenceReferenceLocation: "Dry Springs",
    capacityThreshold: 700,
    largeAmountThreshold: 150,
    locationLabel: "camp",
    itemLabel: "item",
    transactionLabel: "shipment",
  },

  supply: {
    locationTable: "Warehouses",
    locationAlias: "w",
    locationAlias2: "w2",
    locationId: "warehouse_id",
    locationName: "name",
    locationCapacity: "capacity",
    relationId: "backup_warehouse_id",
    itemTable: "Products",
    itemAlias: "p",
    itemAlias2: "p2",
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
    status: "status",
    plannedStatus: "planned",
    completedStatus: "delivered",
    middleStatus: "in transit",
    delayedStatus: "delayed",
    categoryA: "Equipment",
    categoryB: "Packaging",
    targetLocation: "Rochester Logistics Hub",
    scalarReferenceLocation: "Troy Fulfillment Hub",
    differenceReferenceLocation: "Syracuse Storage Center",
    capacityThreshold: 700,
    largeAmountThreshold: 150,
    locationLabel: "warehouse",
    itemLabel: "product",
    transactionLabel: "shipment",
  },

  healthcare: {
    locationTable: "Facilities",
    locationAlias: "f",
    locationAlias2: "f2",
    locationId: "facility_id",
    locationName: "name",
    locationCapacity: "capacity",
    relationId: "referral_facility_id",
    itemTable: "Services",
    itemAlias: "s",
    itemAlias2: "s2",
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
    status: "status",
    plannedStatus: "planned",
    completedStatus: "completed",
    middleStatus: "scheduled",
    delayedStatus: "delayed",
    categoryA: "Outpatient",
    categoryB: "Diagnostic",
    targetLocation: "Westview Health Center",
    scalarReferenceLocation: "Hilltop Medical Center",
    differenceReferenceLocation: "Eastside Community Clinic",
    capacityThreshold: 70,
    largeAmountThreshold: 15,
    locationLabel: "facility",
    itemLabel: "service",
    transactionLabel: "visit",
  },
};

export function buildDay13Questions(domainKey) {
  const d = shared[domainKey];

  const l = d.locationAlias;
  const l2 = d.locationAlias2;
  const i = d.itemAlias;
  const i2 = d.itemAlias2;
  const t = d.transactionAlias;
  const t2 = d.transactionAlias2;

  return [
    {
      id: "q43",
      title: `Find ${d.locationTable} with Planned ${d.transactionTable}`,
      topic: "IN · SUBQUERY",
      prompt: `Return the names of ${d.locationTable} that have at least one '${d.plannedStatus}' ${d.transactionLabel}. A ${d.locationLabel} should appear only once even if it has multiple matching ${d.transactionTable}.`,
      starterSql: `-- Question 43: Use IN with a one-column subquery\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName}
FROM ${d.locationTable} AS ${l}
WHERE ${l}.${d.locationId} IN (
  SELECT ${t}.${d.transactionLocationId}
  FROM ${d.transactionTable} AS ${t}
  WHERE ${t}.${d.status} = '${d.plannedStatus}'
)
ORDER BY ${l}.${d.locationId};`,
    },

    {
      id: "q44",
      title: `Extension: Find ${d.locationTable} Linked to '${d.categoryA}' ${d.itemTable}`,
      topic: "CHALLENGE · IN · JOIN INSIDE SUBQUERY",
      prompt: `Return the ${d.locationLabel} names associated with at least one ${d.itemLabel} in the '${d.categoryA}' category. Let the inner query determine which ${d.locationId} values qualify by combining ${d.transactionTable} and ${d.itemTable}.`,
      starterSql: `-- Question 44: Join inside the subquery, then use its one-column result\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName}
FROM ${d.locationTable} AS ${l}
WHERE ${l}.${d.locationId} IN (
  SELECT ${t}.${d.transactionLocationId}
  FROM ${d.transactionTable} AS ${t}
  JOIN ${d.itemTable} AS ${i}
    ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
  WHERE ${i}.${d.itemCategory} = '${d.categoryA}'
)
ORDER BY ${l}.${d.locationId};`,
    },

    {
      id: "q45",
      title: `Find ${d.itemTable} Never Used at ${d.targetLocation}`,
      topic: "NOT IN · NESTED SUBQUERY",
      prompt: `Return the ${d.itemLabel} names that never appear in a ${d.transactionLabel} for ${d.targetLocation}. Use the ${d.itemId} values associated with ${d.targetLocation} as the list to exclude.`,
      starterSql: `-- Question 45: Build the exclusion list with subqueries\n\n`,
      solutionSql: `SELECT ${i}.${d.itemName}
FROM ${d.itemTable} AS ${i}
WHERE ${i}.${d.itemId} NOT IN (
  SELECT ${t}.${d.transactionItemId}
  FROM ${d.transactionTable} AS ${t}
  WHERE ${t}.${d.transactionLocationId} = (
    SELECT ${l}.${d.locationId}
    FROM ${d.locationTable} AS ${l}
    WHERE ${l}.${d.locationName} = '${d.targetLocation}'
  )
)
ORDER BY ${i}.${d.itemId};`,
    },

    {
      id: "q46",
      title: `Extension: Find Large ${d.locationTable} That Are Not Relationship Destinations`,
      topic: "CHALLENGE · NOT IN · NULL",
      prompt: `Return ${d.locationTable} with ${d.locationCapacity} greater than ${d.capacityThreshold} that are not named by another row's ${d.relationId}. Handle NULL values inside the subquery safely.`,
      starterSql: `-- Question 46: NOT IN is safe only after removing NULL from its list\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName}, ${l}.${d.locationCapacity}
FROM ${d.locationTable} AS ${l}
WHERE ${l}.${d.locationCapacity} > ${d.capacityThreshold}
  AND ${l}.${d.locationId} NOT IN (
    SELECT ${l2}.${d.relationId}
    FROM ${d.locationTable} AS ${l2}
    WHERE ${l2}.${d.relationId} IS NOT NULL
  )
ORDER BY ${l}.${d.locationId};`,
    },

    {
      id: "q47",
      title: `Find ${d.locationTable} with a Large Planned ${d.transactionLabel}`,
      topic: "EXISTS · CORRELATED SUBQUERY",
      prompt: `Return ${d.locationTable} that have at least one '${d.plannedStatus}' ${d.transactionLabel} with ${d.amount} at least ${d.largeAmountThreshold}. Use a correlated EXISTS test.`,
      starterSql: `-- Question 47: Ask the existence question once for each location\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName}
FROM ${d.locationTable} AS ${l}
WHERE EXISTS (
  SELECT 1
  FROM ${d.transactionTable} AS ${t}
  WHERE ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
    AND ${t}.${d.status} = '${d.plannedStatus}'
    AND ${t}.${d.amount} >= ${d.largeAmountThreshold}
)
ORDER BY ${l}.${d.locationId};`,
    },

    {
      id: "q48",
      title: `Extension: Find ${d.itemTable} That Have Never Been Completed`,
      topic: "CHALLENGE · NOT EXISTS",
      prompt: `Return ${d.itemTable} for which no '${d.completedStatus}' ${d.transactionLabel} exists. The ${d.itemLabel} may still appear in other ${d.transactionLabel} statuses.`,
      starterSql: `-- Question 48: Use NOT EXISTS for a conditional missing relationship\n\n`,
      solutionSql: `SELECT ${i}.${d.itemName}
FROM ${d.itemTable} AS ${i}
WHERE NOT EXISTS (
  SELECT 1
  FROM ${d.transactionTable} AS ${t}
  WHERE ${t}.${d.transactionItemId} = ${i}.${d.itemId}
    AND ${t}.${d.status} = '${d.completedStatus}'
)
ORDER BY ${i}.${d.itemId};`,
    },

    {
      id: "q49",
      title: `Find ${d.locationTable} Larger Than ${d.scalarReferenceLocation}`,
      topic: "SCALAR SUBQUERY",
      prompt: `Return names and capacities for ${d.locationTable} whose ${d.locationCapacity} is greater than ${d.scalarReferenceLocation}. Look up the comparison value with a scalar subquery rather than typing the capacity directly.`,
      starterSql: `-- Question 49: Use a one-row, one-column subquery as a value\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName}, ${l}.${d.locationCapacity}
FROM ${d.locationTable} AS ${l}
WHERE ${l}.${d.locationCapacity} > (
  SELECT ${l2}.${d.locationCapacity}
  FROM ${d.locationTable} AS ${l2}
  WHERE ${l2}.${d.locationName} = '${d.scalarReferenceLocation}'
)
ORDER BY ${l}.${d.locationCapacity} DESC, ${l}.${d.locationId};`,
    },

    {
      id: "q50",
      title: `Extension: Compare Every ${d.locationLabel} with ${d.differenceReferenceLocation}`,
      topic: "CHALLENGE · SCALAR SUBQUERY IN SELECT",
      prompt: `For every ${d.locationLabel}, display its name, ${d.locationCapacity}, and the capacity difference relative to ${d.differenceReferenceLocation}. Obtain the reference capacity with a scalar subquery.`,
      starterSql: `-- Question 50: Put a scalar subquery inside a calculated result column\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName},
       ${l}.${d.locationCapacity},
       ${l}.${d.locationCapacity} - (
         SELECT ${l2}.${d.locationCapacity}
         FROM ${d.locationTable} AS ${l2}
         WHERE ${l2}.${d.locationName} = '${d.differenceReferenceLocation}'
       ) AS capacity_difference
FROM ${d.locationTable} AS ${l}
ORDER BY ${l}.${d.locationId};`,
    },

    {
      id: "q51",
      title: "Build One Combined Deduplicated Item List",
      topic: "UNION",
      prompt: `Create one deduplicated list containing ${d.itemTable} in the '${d.categoryA}' category or ${d.itemTable} that appear in a '${d.plannedStatus}' ${d.transactionLabel}.`,
      starterSql: `-- Question 51: UNION two compatible result sets\n\n`,
      solutionSql: `SELECT ${i}.${d.itemName} AS name
FROM ${d.itemTable} AS ${i}
WHERE ${i}.${d.itemCategory} = '${d.categoryA}'
UNION
SELECT ${i}.${d.itemName} AS name
FROM ${d.itemTable} AS ${i}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
WHERE ${t}.${d.status} = '${d.plannedStatus}'
ORDER BY name;`,
    },

    {
      id: "q52",
      title: "Extension: Keep Repeated Items Across Two Lists",
      topic: "CHALLENGE · UNION ALL",
      prompt: `Combine ${d.itemLabel} names from '${d.plannedStatus}' ${d.transactionTable} with ${d.itemLabel} names from '${d.completedStatus}' ${d.transactionTable}, keeping repeated names. Use UNION ALL.`,
      starterSql: `-- Question 52: UNION ALL keeps every row, including repeats\n\n`,
      solutionSql: `SELECT ${i}.${d.itemName} AS name
FROM ${d.itemTable} AS ${i}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
WHERE ${t}.${d.status} = '${d.plannedStatus}'
UNION ALL
SELECT ${i}.${d.itemName} AS name
FROM ${d.itemTable} AS ${i}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
WHERE ${t}.${d.status} = '${d.completedStatus}'
ORDER BY name;`,
    },

    {
      id: "q53",
      title: `Find ${d.itemTable} Used in Both Planned and Completed Work`,
      topic: "INTERSECT",
      prompt: `Return ${d.itemTable} that appear in at least one '${d.plannedStatus}' ${d.transactionLabel} and also in at least one '${d.completedStatus}' ${d.transactionLabel}.`,
      starterSql: `-- Question 53: Keep values present in both result sets\n\n`,
      solutionSql: `SELECT ${i}.${d.itemName} AS name
FROM ${d.itemTable} AS ${i}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
WHERE ${t}.${d.status} = '${d.plannedStatus}'
INTERSECT
SELECT ${i}.${d.itemName} AS name
FROM ${d.itemTable} AS ${i}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
WHERE ${t}.${d.status} = '${d.completedStatus}'
ORDER BY name;`,
    },

    {
      id: "q54",
      title: `Find ${d.locationTable} with Planned but No Completed ${d.transactionTable}`,
      topic: "EXCEPT",
      prompt: `Return ${d.locationTable} that appear in the set with '${d.plannedStatus}' ${d.transactionTable} but not in the set with '${d.completedStatus}' ${d.transactionTable}. An empty result is possible if every planned location also has completed activity.`,
      starterSql: `-- Question 54: Subtract the second finished result from the first\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName} AS name
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
WHERE ${t}.${d.status} = '${d.plannedStatus}'
EXCEPT
SELECT ${l}.${d.locationName} AS name
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
WHERE ${t}.${d.status} = '${d.completedStatus}'
ORDER BY name;`,
    },

    {
      id: "q55",
      title: "Real Challenge Question 1",
      topic: "CHALLENGE · EXISTS + NOT EXISTS",
      prompt: `Return ${d.locationTable} that have at least one ${d.itemLabel} in category '${d.categoryA}' but no ${d.itemLabel} in category '${d.categoryB}'. Evaluate both conditions for each ${d.locationLabel}.`,
      starterSql: `-- Real Challenge Question 1\n-- Require one relationship and forbid another\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName}
FROM ${d.locationTable} AS ${l}
WHERE EXISTS (
  SELECT 1
  FROM ${d.transactionTable} AS ${t}
  JOIN ${d.itemTable} AS ${i}
    ON ${t}.${d.transactionItemId} = ${i}.${d.itemId}
  WHERE ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
    AND ${i}.${d.itemCategory} = '${d.categoryA}'
)
AND NOT EXISTS (
  SELECT 1
  FROM ${d.transactionTable} AS ${t2}
  JOIN ${d.itemTable} AS ${i2}
    ON ${t2}.${d.transactionItemId} = ${i2}.${d.itemId}
  WHERE ${t2}.${d.transactionLocationId} = ${l}.${d.locationId}
    AND ${i2}.${d.itemCategory} = '${d.categoryB}'
)
ORDER BY ${l}.${d.locationId};`,
    },

    {
      id: "q56",
      title: "Real Challenge Question 2",
      topic: "CHALLENGE · INTERSECT + EXCEPT",
      prompt: `Return ${d.locationTable} that have at least one '${d.plannedStatus}' ${d.transactionLabel} and at least one '${d.middleStatus}' ${d.transactionLabel}, but no '${d.delayedStatus}' ${d.transactionLabel}. Build the result with set operators.`,
      starterSql: `-- Real Challenge Question 2\n-- Combine two required sets, then subtract the forbidden set\n\n`,
      solutionSql: `SELECT ${l}.${d.locationName} AS name
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
WHERE ${t}.${d.status} = '${d.plannedStatus}'
INTERSECT
SELECT ${l}.${d.locationName} AS name
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
WHERE ${t}.${d.status} = '${d.middleStatus}'
EXCEPT
SELECT ${l}.${d.locationName} AS name
FROM ${d.locationTable} AS ${l}
JOIN ${d.transactionTable} AS ${t}
  ON ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
WHERE ${t}.${d.status} = '${d.delayedStatus}'
ORDER BY name;`,
    },

    {
      id: "q57",
      title: "Real Challenge Question 3",
      topic: "CHALLENGE · DEBUG A CORRELATED SUBQUERY",
      prompt: `The query below is intended to find ${d.locationTable} with no '${d.delayedStatus}' ${d.transactionLabel}, but the inner query is not connected to the outer row. Repair the missing correlation so each ${d.locationLabel} is tested separately.`,
      starterSql: `-- Real Challenge Question 3
-- This checks whether ANY delayed transaction exists globally.
-- Repair it so the subquery checks the current location.

SELECT ${l}.${d.locationName}
FROM ${d.locationTable} AS ${l}
WHERE NOT EXISTS (
  SELECT 1
  FROM ${d.transactionTable} AS ${t}
  WHERE ${t}.${d.status} = '${d.delayedStatus}'
);
`,
      solutionSql: `SELECT ${l}.${d.locationName}
FROM ${d.locationTable} AS ${l}
WHERE NOT EXISTS (
  SELECT 1
  FROM ${d.transactionTable} AS ${t}
  WHERE ${t}.${d.transactionLocationId} = ${l}.${d.locationId}
    AND ${t}.${d.status} = '${d.delayedStatus}'
)
ORDER BY ${l}.${d.locationId};`,
    },
  ];
}
