import { day10Databases, day10DatabaseOrder } from "./databases/day10/index.js";
import { day11Databases, day11DatabaseOrder } from "./databases/day11/index.js";
import { day12Databases, day12DatabaseOrder } from "./databases/day12/index.js";
import { day13Databases, day13DatabaseOrder } from "./databases/day13/index.js";
import { day14Databases, day14DatabaseOrder } from "./databases/day14/index.js";
import { buildDay10Questions } from "./questions/day10.js";
import { buildDay11Questions } from "./questions/day11.js";
import { buildDay12Questions } from "./questions/day12.js";
import { buildDay13Questions } from "./questions/day13.js";
import { buildDay14Questions } from "./questions/day14.js";
import { day10Syntax } from "./syntax/day10.js";
import { day11Syntax } from "./syntax/day11.js";
import { day12Syntax } from "./syntax/day12.js";
import { day13Syntax } from "./syntax/day13.js";
import { day14Syntax } from "./syntax/day14.js";

// Change this when the next class is released. Older days remain available.
export const CURRENT_DAY_KEY = "day21";

export const courseDays = {
  day21: {
    key: "day21",
    label: "Day 21",
    title: "Decision Trees and Regression",
    mode: "python",
    databaseVersion: 1,
    databases: day12Databases,
    databaseOrder: ["humanitarian"],
  },
  day20: {
    key: "day20",
    label: "Day 20",
    title: "Decision Models: Binary Optimization",
    mode: "decision",
    databaseVersion: 1,
    databases: day12Databases,
    databaseOrder: ["humanitarian"],
  },
  day16: {
    key: "day16",
    label: "Day 16",
    title: "Analysis with Data Frames",
    mode: "python",
    databaseVersion: 1,
    databases: day12Databases,
    databaseOrder: ["humanitarian"],
  },
  day15: {
    key: "day15",
    label: "Day 15",
    title: "Working with the Database from Code",
    mode: "python",
    databaseVersion: 1,
    databases: day12Databases,
    databaseOrder: ["humanitarian"],
  },
  day10: {
    key: "day10",
    label: "Day 10",
    title: "Creating & Populating Tables",
    databaseVersion: 1,
    databases: day10Databases,
    databaseOrder: day10DatabaseOrder,
    buildQuestions: buildDay10Questions,
    syntaxGuide: day10Syntax,
  },

  day11: {
    key: "day11",
    label: "Day 11",
    title: "Filtering and NULL Logic",
    databaseVersion: 1,
    databases: day11Databases,
    databaseOrder: day11DatabaseOrder,
    buildQuestions: buildDay11Questions,
    syntaxGuide: day11Syntax,
  },

  day12: {
    key: "day12",
    label: "Day 12",
    title: "Joining Tables",
    databaseVersion: 2,
    databases: day12Databases,
    databaseOrder: day12DatabaseOrder,
    buildQuestions: buildDay12Questions,
    syntaxGuide: day12Syntax,
  },

  day13: {
    key: "day13",
    label: "Day 13",
    title: "Subqueries and Set Operations",
    databaseVersion: 1,
    databases: day13Databases,
    databaseOrder: day13DatabaseOrder,
    buildQuestions: buildDay13Questions,
    syntaxGuide: day13Syntax,
  },

  day14: {
    key: "day14",
    label: "Day 14",
    title: "Aggregation and Views",
    databaseVersion: 1,
    databases: day14Databases,
    databaseOrder: day14DatabaseOrder,
    buildQuestions: buildDay14Questions,
    syntaxGuide: day14Syntax,
  },
};

export const dayOrder = ["day10", "day11", "day12", "day13", "day14", "day15", "day16", "day20", "day21"];
