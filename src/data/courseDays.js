import { day10Databases, day10DatabaseOrder } from "./databases/day10/index.js";
import { buildDay10Questions } from "./questions/day10.js";
import { day10Syntax } from "./syntax/day10.js";

// Change CURRENT_DAY_KEY when the next class is released.
// Example: after registering Day 11 below, set this to "day11".
export const CURRENT_DAY_KEY = "day10";

export const courseDays = {
  day10: {
    key: "day10",
    label: "Day 10",
    title: "Creating & Populating Tables",

    // IMPORTANT: Increment this if the canonical Day 10 starter database
    // changes after students have already used it. A new version creates a
    // fresh browser-stored database automatically and leaves the old version
    // untouched.
    databaseVersion: 1,

    databases: day10Databases,
    databaseOrder: day10DatabaseOrder,
    buildQuestions: buildDay10Questions,
    syntaxGuide: day10Syntax,
  },
};

export const dayOrder = ["day10"];
