const shared = {
  humanitarian: {
    entity: "Partners",
    id: "partner_id",
    name: "name",
    type: "type",
    nullable: "country",
    row1: "1 | Global Relief Fund | NGO | USA",
    row2: "2 | Northern Logistics Co | transport | NULL",
    temp: "3 | Test Org | test | NULL",
    updateValue: "Canada",
    firstName: "Global Relief Fund",
    firstType: "NGO",
    firstNullable: "USA",
    secondName: "Northern Logistics Co",
    secondType: "transport",
    tempName: "Test Org",
    tempType: "test",
    duplicateName: "Duplicate Org",
    duplicateType: "NGO",
    missingNameType: "NGO",
    missingNameNullable: "USA",
  },
  supply: {
    entity: "Suppliers",
    id: "supplier_id",
    name: "name",
    type: "supplier_type",
    nullable: "country",
    row1: "1 | Global Components Co | manufacturer | USA",
    row2: "2 | Northern Logistics Co | transport | NULL",
    temp: "3 | Test Supplier | test | NULL",
    updateValue: "Canada",
    firstName: "Global Components Co",
    firstType: "manufacturer",
    firstNullable: "USA",
    secondName: "Northern Logistics Co",
    secondType: "transport",
    tempName: "Test Supplier",
    tempType: "test",
    duplicateName: "Duplicate Supplier",
    duplicateType: "manufacturer",
    missingNameType: "manufacturer",
    missingNameNullable: "USA",
  },
  healthcare: {
    entity: "Providers",
    id: "provider_id",
    name: "name",
    type: "specialty",
    nullable: "region",
    row1: "1 | Community Health Group | Primary Care | North",
    row2: "2 | Mobile Care Partners | Outreach | NULL",
    temp: "3 | Test Provider | test | NULL",
    updateValue: "Central",
    firstName: "Community Health Group",
    firstType: "Primary Care",
    firstNullable: "North",
    secondName: "Mobile Care Partners",
    secondType: "Outreach",
    tempName: "Test Provider",
    tempType: "test",
    duplicateName: "Duplicate Provider",
    duplicateType: "Primary Care",
    missingNameType: "Primary Care",
    missingNameNullable: "North",
  },
};

export function buildDay10Questions(domainKey) {
  const d = shared[domainKey];

  return [
    {
      id: "q1",
      title: `Create ${d.entity}`,
      topic: "CREATE TABLE",
      prompt: `Create a table called ${d.entity}.`,
      details: [
        [d.id, "INTEGER", "PRIMARY KEY"],
        [d.name, "TEXT", "NOT NULL"],
        [d.type, "TEXT", "NOT NULL"],
        [d.nullable, "TEXT", "may be NULL"],
      ],
      starterSql: `-- Question 1: Create ${d.entity}\n\n`,
      solutionSql: `CREATE TABLE ${d.entity} (
  ${d.id} INTEGER PRIMARY KEY,
  ${d.name} TEXT NOT NULL,
  ${d.type} TEXT NOT NULL,
  ${d.nullable} TEXT
);`,
    },

    {
      id: "q2",
      title: "Insert the first row",
      topic: "INSERT",
      prompt: `Insert this complete row into ${d.entity}:`,
      examples: [d.row1],
      starterSql: `-- Question 2: Insert the first row\n\n`,
      solutionSql: `INSERT INTO ${d.entity}
VALUES (1, '${d.firstName}', '${d.firstType}', '${d.firstNullable}');`,
    },

    {
      id: "q3",
      title: "Insert with named columns",
      topic: "INSERT + NULL",
      prompt: `Insert the second row, but omit ${d.nullable} so SQLite stores NULL. Then inspect the table.`,
      examples: [d.row2],
      starterSql: `-- Question 3: Use a named-column INSERT\n\n\n-- Inspect the table after inserting\nSELECT * FROM ${d.entity};\n`,
      solutionSql: `INSERT INTO ${d.entity} (${d.id}, ${d.name}, ${d.type})
VALUES (2, '${d.secondName}', '${d.secondType}');

SELECT * FROM ${d.entity};`,
    },

    {
      id: "q4",
      title: "Trigger a primary-key error",
      topic: "CONSTRAINTS",
      prompt: `Try to insert another ${d.entity} row with ${d.id} = 1. Run the invalid statement and read the SQLite error.`,
      starterSql: `-- Question 4: Deliberately duplicate the primary key\n\n`,
      solutionSql: `INSERT INTO ${d.entity} (${d.id}, ${d.name}, ${d.type}, ${d.nullable})
VALUES (1, '${d.duplicateName}', '${d.duplicateType}', '${d.firstNullable}');`,
    },

    {
      id: "q5",
      title: "Trigger a NOT NULL error",
      topic: "CONSTRAINTS",
      prompt: `Try to insert a row that omits the required ${d.name} value.`,
      starterSql: `-- Question 5: Deliberately omit the required name\n\n`,
      solutionSql: `INSERT INTO ${d.entity} (${d.id}, ${d.type}, ${d.nullable})
VALUES (4, '${d.missingNameType}', '${d.missingNameNullable}');`,
    },

    // =========================================================
    // REAL CHALLENGE QUESTIONS
    // =========================================================

    {
      id: "q6",
      title: "Real Challenge Question 1",
      topic: "CHALLENGE · NULL + UPDATE",
      prompt: `Some database rows may have missing values. Find rows in ${d.entity} where ${d.nullable} is NULL, then change those missing values to 'Unknown'. Finally, display the updated rows.`,
      starterSql: `-- Real Challenge Question 1\n-- Find missing values, update them, then verify\n\n`,
      solutionSql: `SELECT *
FROM ${d.entity}
WHERE ${d.nullable} IS NULL;

UPDATE ${d.entity}
SET ${d.nullable} = 'Unknown'
WHERE ${d.nullable} IS NULL;

SELECT *
FROM ${d.entity};`,
    },

    {
      id: "q7",
      title: "Real Challenge Question 2",
      topic: "CHALLENGE · INSERT FROM SELECT",
      prompt: `Create a new row by copying the data from ${d.entity} row 1. Give the copied row ${d.id} = 5 and append " Copy" to its name. Do this without manually retyping the original row's values.`,
      starterSql: `-- Real Challenge Question 2\n-- Copy an existing row using INSERT ... SELECT\n\n`,
      solutionSql: `INSERT INTO ${d.entity} (
  ${d.id},
  ${d.name},
  ${d.type},
  ${d.nullable}
)
SELECT
  5,
  ${d.name} || ' Copy',
  ${d.type},
  ${d.nullable}
FROM ${d.entity}
WHERE ${d.id} = 1;

SELECT *
FROM ${d.entity};`,
    },

    {
      id: "q8",
      title: "Real Challenge Question 3",
      topic: "CHALLENGE · CREATE TABLE AS",
      prompt: `Before making more changes, create a backup table named ${d.entity}_Backup containing the current rows from ${d.entity}. Then verify that the backup was created.`,
      starterSql: `-- Real Challenge Question 3\n-- Create a backup table from the current data\n\n`,
      solutionSql: `CREATE TABLE ${d.entity}_Backup AS
SELECT *
FROM ${d.entity};

SELECT *
FROM ${d.entity}_Backup;`,
    },

    // =========================================================
    // NORMAL DAY 10 FLOW CONTINUES
    // =========================================================

    {
      id: "q9",
      title: "Preview before UPDATE",
      topic: "SELECT BEFORE UPDATE",
      prompt: `Before changing row 2, SELECT it using ${d.id} = 2.`,
      starterSql: `-- Question 9: Preview the row first\n\n`,
      solutionSql: `SELECT *
FROM ${d.entity}
WHERE ${d.id} = 2;`,
    },

    {
      id: "q10",
      title: "Update the row",
      topic: "UPDATE",
      prompt: `Set row 2's ${d.nullable} value to '${d.updateValue}', then SELECT it again.`,
      starterSql: `-- Question 10: UPDATE, then verify with SELECT\n\n`,
      solutionSql: `UPDATE ${d.entity}
SET ${d.nullable} = '${d.updateValue}'
WHERE ${d.id} = 2;

SELECT *
FROM ${d.entity}
WHERE ${d.id} = 2;`,
    },

    {
      id: "q11",
      title: "Insert a temporary row",
      topic: "INSERT",
      prompt: `Insert a temporary row that we will delete next.`,
      examples: [d.temp],
      starterSql: `-- Question 11: Insert the temporary row\n\n`,
      solutionSql: `INSERT INTO ${d.entity} (${d.id}, ${d.name}, ${d.type})
VALUES (3, '${d.tempName}', '${d.tempType}');`,
    },

    {
      id: "q12",
      title: "Preview before DELETE",
      topic: "SELECT BEFORE DELETE",
      prompt: `SELECT the temporary row using ${d.id} = 3 before deleting it.`,
      starterSql: `-- Question 12: Preview the row before DELETE\n\n`,
      solutionSql: `SELECT *
FROM ${d.entity}
WHERE ${d.id} = 3;`,
    },

    {
      id: "q13",
      title: "Delete safely",
      topic: "DELETE",
      prompt: `Delete the temporary row using the same WHERE condition, then inspect what remains.`,
      starterSql: `-- Question 13: DELETE, then verify\n\n\nSELECT * FROM ${d.entity};\n`,
      solutionSql: `DELETE FROM ${d.entity}
WHERE ${d.id} = 3;

SELECT *
FROM ${d.entity};`,
    },

    {
      id: "q14",
      title: "Add a column",
      topic: "ALTER TABLE",
      prompt: `Add a new column named contact with type TEXT to ${d.entity}, then inspect the updated schema.`,
      starterSql: `-- Question 14: Add contact TEXT\n\n\n-- Inspect the schema\nPRAGMA table_info(${d.entity});\n`,
      solutionSql: `ALTER TABLE ${d.entity}
ADD COLUMN contact TEXT;

PRAGMA table_info(${d.entity});`,
    },

    {
      id: "q15",
      title: "DROP versus DELETE",
      topic: "DROP TABLE",
      prompt: `DROP ${d.entity}. Observe that the table itself disappears, then use Reset Database to restore the original database.`,
      starterSql: `-- Question 15: DROP the whole table\n\n`,
      solutionSql: `DROP TABLE ${d.entity};

SELECT name
FROM sqlite_master
WHERE type = 'table'
ORDER BY name;`,
    },
  ];
}
