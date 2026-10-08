import { day12Databases, day12DatabaseOrder } from "../day12/index.js";

// SQL Part IV uses the same canonical schema/data as SQL Part III.
// Browser persistence remains separate because storage is scoped by dayKey.
export const day13Databases = {
  humanitarian: {
    ...day12Databases.humanitarian,
    description:
      "Camps, regions, relief items, and aid shipments for subquery and set-operation practice.",
  },
  supply: {
    ...day12Databases.supply,
    description:
      "Warehouses, regions, products, and shipments for subquery and set-operation practice.",
  },
  healthcare: {
    ...day12Databases.healthcare,
    description:
      "Facilities, regions, services, and patient visits for subquery and set-operation practice.",
  },
};

export const day13DatabaseOrder = [...day12DatabaseOrder];
