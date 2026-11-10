export const truckLoads = [
  { name: "Hygiene Kits", kg: 100, m3: 1, points: 30 },
  { name: "Blankets", kg: 250, m3: 6, points: 40 },
  { name: "Medical Kits", kg: 250, m3: 2, points: 50 },
  { name: "Food Packs", kg: 450, m3: 3, points: 60 },
  { name: "Water", kg: 500, m3: 4, points: 70 },
];

export const truckStages = [
  {
    id: "weight",
    number: 1,
    label: "Weight only",
    short: "Base model",
    description: "Start with the objective and the 1,000 kg truck limit.",
    useVolume: false,
    requireNeed: false,
    expected: 160,
  },
  {
    id: "volume",
    number: 2,
    label: "Add volume",
    short: "Second constraint",
    description: "Add the 10 m³ volume limit from the lecture.",
    useVolume: true,
    requireNeed: false,
    expected: 150,
  },
  {
    id: "need",
    number: 3,
    label: "Add shelter / food need",
    short: "Third constraint",
    description: "Require at least one of Blankets or Food Packs.",
    useVolume: true,
    requireNeed: true,
    expected: 140,
  },
];

export const defaultTruckLimits = {
  weight: 1000,
  volume: 10,
};

export const pulpReference = `"""truck.py: Ellis's truck, as on the slides. Run: python truck.py (needs pulp below 4.0, which includes CBC)."""
from pulp import *

loads = {"Hygiene Kits": (100, 30), "Blankets": (250, 40), "Medical Kits": (250, 50),
         "Food Packs": (450, 60), "Water": (500, 70)}   # kg, points

model = LpProblem("truck", LpMaximize)
take = {n: LpVariable(n, cat="Binary") for n in loads}
model += lpSum(loads[n][1] * take[n] for n in loads)           # the objective
model += lpSum(loads[n][0] * take[n] for n in loads) <= 1000   # the constraint

# A second limit, volume: delete the # at the start of the next three lines
# volume = {"Hygiene Kits": 1, "Blankets": 6, "Medical Kits": 2,
#           "Food Packs": 3, "Water": 4}
# model += lpSum(volume[n] * take[n] for n in loads) <= 10

# A third constraint, the need for shelter or food: delete the # on the next line
# model += take["Blankets"] + take["Food Packs"] >= 1

model.solve(PULP_CBC_CMD(msg=0))
chosen = [n for n in loads if take[n].value() == 1]
print(LpStatus[model.status], chosen, value(model.objective))
`;
