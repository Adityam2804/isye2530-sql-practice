import { humanitarianDatabase } from "./humanitarian.js";
import { supplyChainDatabase } from "./supplyChain.js";
import { healthcareDatabase } from "./healthcare.js";

export const day10Databases = {
  humanitarian: humanitarianDatabase,
  supply: supplyChainDatabase,
  healthcare: healthcareDatabase,
};

export const day10DatabaseOrder = ["supply", "healthcare", "humanitarian"];
