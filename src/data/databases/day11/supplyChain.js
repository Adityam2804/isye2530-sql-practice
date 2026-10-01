
export const supplyChainDatabase = {
  key: "supply",
  label: "Supply Chain",
  description: "Warehouses, products, and shipments.",
  setupSql: `
    PRAGMA foreign_keys = ON;

    CREATE TABLE Warehouses (
      warehouse_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      capacity INTEGER NOT NULL
    );

    CREATE TABLE Products (
      product_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE Shipments (
      shipment_id INTEGER PRIMARY KEY,
      warehouse_id INTEGER NOT NULL REFERENCES Warehouses(warehouse_id),
      product_id INTEGER NOT NULL REFERENCES Products(product_id),
      qty INTEGER NOT NULL,
      ship_date TEXT,
      status TEXT NOT NULL
    );

    INSERT INTO Warehouses VALUES
      (1, 'Albany Distribution Center', 'Northeast', 1200),
      (2, 'Troy Fulfillment Hub', 'Northeast', 800),
      (3, 'Buffalo Regional Warehouse', 'West', 2000),
      (4, 'Syracuse Storage Center', 'Central', 650),
      (5, 'Rochester Logistics Hub', 'West', 950);

    INSERT INTO Products VALUES
      (10, 'Laptop Stand', 'Office'),
      (11, 'Shipping Box', 'Packaging'),
      (12, 'Barcode Scanner', 'Equipment'),
      (13, 'Label Roll', 'Packaging'),
      (14, 'Hand Truck', 'Equipment');

    INSERT INTO Shipments VALUES
      (101, 1, 11, 400, '2026-09-01', 'delivered'),
      (102, 1, 10, 60, '2026-09-02', 'delivered'),
      (103, 2, 11, 250, NULL, 'in transit'),
      (104, 3, 12, 80, NULL, 'planned'),
      (105, 4, 13, 180, '2026-09-04', 'delivered'),
      (106, 2, 10, 120, '2026-09-05', 'delivered'),
      (107, 5, 14, 95, NULL, 'planned'),
      (108, 1, 13, 210, '2026-09-06', 'delivered'),
      (109, 3, 10, 330, NULL, 'in transit'),
      (110, 4, 12, 45, '2026-09-07', 'delivered'),
      (111, 5, 11, 170, '2026-09-08', 'delivered'),
      (112, 2, 13, 145, NULL, 'planned'),
      (113, 3, 14, 120, '2026-09-09', 'delivered'),
      (114, 1, 12, 70, NULL, 'in transit'),
      (115, 2, 11, 40, '2026-09-10', 'delivered'),
      (116, 4, 10, 200, '2026-09-11', 'delivered'),
      (117, 5, 13, 260, NULL, 'planned'),
      (118, 2, 14, 300, '2026-09-12', 'delivered'),
      (119, 3, 11, 110, NULL, 'in transit'),
      (120, 1, 14, 85, '2026-09-13', 'delivered'),
      (121, 2, 12, 275, NULL, 'delayed'),
      (122, 4, 11, 150, '2026-09-14', 'delivered'),
      (123, 5, 10, 190, NULL, 'planned'),
      (124, 2, 10, 100, NULL, 'in transit'),
      (125, 3, 13, 220, '2026-09-15', 'delivered');
  `
};
