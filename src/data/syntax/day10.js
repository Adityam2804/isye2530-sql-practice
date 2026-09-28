export const day10Syntax = [
  {
    title: "CREATE TABLE",
    description: "Create a new table and define its columns.",
    syntax: `CREATE TABLE table_name (
    column_name DATA_TYPE CONSTRAINT,
    column_name DATA_TYPE
);`,
  },

  {
    title: "INSERT",
    description: "Add a row to a table.",
    syntax: `INSERT INTO table_name
VALUES (value1, value2, value3);`,
  },

  {
    title: "INSERT with named columns",
    description: "Insert values only into selected columns.",
    syntax: `INSERT INTO table_name (column1, column2)
VALUES (value1, value2);`,
  },

  {
    title: "SELECT",
    description: "Read rows from a table.",
    syntax: `SELECT *
FROM table_name
WHERE condition;`,
  },

  {
    title: "UPDATE",
    description: "Change values in existing rows.",
    syntax: `UPDATE table_name
SET column_name = value
WHERE condition;`,
  },

  {
    title: "DELETE",
    description: "Remove selected rows.",
    syntax: `DELETE FROM table_name
WHERE condition;`,
  },

  {
    title: "ALTER TABLE — Add Column",
    description: "Add a new column while keeping existing rows.",
    syntax: `ALTER TABLE table_name
ADD COLUMN column_name DATA_TYPE;`,
  },

  {
    title: "DROP TABLE",
    description: "Remove an entire table.",
    syntax: `DROP TABLE table_name;`,
  },

  {
    title: "Inspect Table",
    description: "Display the SQLite table definition.",
    syntax: `PRAGMA table_info(table_name);`,
  },
];
