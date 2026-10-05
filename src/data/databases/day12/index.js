import { humanitarianDatabase } from "./humanitarian.js";
import { supplyChainDatabase } from "./supplyChain.js";
import { healthcareDatabase } from "./healthcare.js";

export const day12Databases = {
  humanitarian: humanitarianDatabase,
  supply: supplyChainDatabase,
  healthcare: healthcareDatabase,
};

export const day12DatabaseOrder = ["supply", "healthcare", "humanitarian"];
