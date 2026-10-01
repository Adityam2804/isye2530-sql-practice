export const day11Syntax = [
  {
    title: "SELECT / FROM / WHERE",
    description: "Choose the columns to return and keep only rows that satisfy a condition.",
    syntax: `SELECT column1, column2
FROM table_name
WHERE condition;`,
  },
  {
    title: "DISTINCT",
    description: "Return each selected value only once.",
    syntax: `SELECT DISTINCT column_name
FROM table_name;`,
  },
  {
    title: "Comparisons",
    description: "Compare stored values inside a WHERE condition.",
    syntax: `SELECT *
FROM table_name
WHERE numeric_column >= 100;

-- Common comparison operators:
-- =   equal
-- <>  not equal
-- <   less than
-- >   greater than
-- <=  less than or equal
-- >=  greater than or equal`,
  },
  {
    title: "AND / OR / NOT",
    description: "Combine or reverse conditions. Use parentheses when AND and OR are mixed.",
    syntax: `SELECT *
FROM table_name
WHERE condition1 AND condition2;

SELECT *
FROM table_name
WHERE condition1 OR condition2;

SELECT *
FROM table_name
WHERE NOT condition;`,
  },
  {
    title: "IN",
    description: "Match any value from a short list.",
    syntax: `SELECT *
FROM table_name
WHERE column_name IN ('value1', 'value2');`,
  },
  {
    title: "BETWEEN",
    description: "Match an inclusive range; both endpoints are included.",
    syntax: `SELECT *
FROM table_name
WHERE numeric_column BETWEEN 100 AND 200;`,
  },
  {
    title: "LIKE",
    description: "% matches any run of characters; _ matches exactly one character.",
    syntax: `SELECT *
FROM table_name
WHERE name LIKE '%text%';

SELECT *
FROM table_name
WHERE name LIKE '_ill%';`,
  },
  {
    title: "Computed Column + AS",
    description: "Compute a value for each result row and give the result column a useful name.",
    syntax: `SELECT name,
       capacity,
       capacity * 0.8 AS target
FROM table_name;`,
  },
  {
    title: "ORDER BY",
    description: "Sort the result. ASC is the default; DESC puts the largest value first.",
    syntax: `SELECT *
FROM table_name
ORDER BY column_name DESC;`,
  },
  {
    title: "ORDER BY + LIMIT",
    description: "Sort first, then keep only the first N rows of that order.",
    syntax: `SELECT *
FROM table_name
ORDER BY column_name DESC
LIMIT 3;`,
  },
  {
    title: "IS NULL / IS NOT NULL",
    description: "Test whether a value is missing or recorded. Do not use = NULL.",
    syntax: `SELECT *
FROM table_name
WHERE column_name IS NULL;

SELECT *
FROM table_name
WHERE column_name IS NOT NULL;`,
  },
  {
    title: "COALESCE",
    description: "Show a replacement value when a stored value is NULL without changing the database.",
    syntax: `SELECT column_name,
       COALESCE(column_name, 'not recorded') AS shown_value
FROM table_name;`,
  },
];
