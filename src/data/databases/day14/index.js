import { day13Databases, day13DatabaseOrder } from "../day13/index.js";

// SQL Part V keeps the same canonical rows/schema so students can focus on
// aggregation and views. Browser persistence is still isolated by dayKey.
export const day14Databases = {
  humanitarian: {
    ...day13Databases.humanitarian,
    description:
      "Camps, regions, relief items, and aid shipments for aggregation and view practice.",
  },
  supply: {
    ...day13Databases.supply,
    description:
      "Warehouses, regions, products, and shipments for aggregation and view practice.",
  },
  healthcare: {
    ...day13Databases.healthcare,
    description:
      "Facilities, regions, services, and patient visits for aggregation and view practice.",
  },
};

export const day14DatabaseOrder = [...day13DatabaseOrder];
