import { humanitarianDatabase } from "./humanitarian.js";
import { supplyChainDatabase } from "./supplyChain.js";
import { healthcareDatabase } from "./healthcare.js";

export const day11Databases = {
  humanitarian: humanitarianDatabase,
  supply: supplyChainDatabase,
  healthcare: healthcareDatabase,
};

export const day11DatabaseOrder = ["supply", "healthcare", "humanitarian"];
