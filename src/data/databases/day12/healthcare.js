export const healthcareDatabase = {
  key: "healthcare",
  label: "Healthcare",
  description:
    "Facilities, regions, services, and patient visits for join practice.",
  setupSql: `
    PRAGMA foreign_keys = ON;

    CREATE TABLE Regions (
      region TEXT PRIMARY KEY,
      director TEXT NOT NULL
    );

    CREATE TABLE Facilities (
      facility_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      referral_facility_id INTEGER REFERENCES Facilities(facility_id)
    );

    CREATE TABLE Services (
      service_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE Visits (
      visit_id INTEGER PRIMARY KEY,
      facility_id INTEGER NOT NULL REFERENCES Facilities(facility_id),
      service_id INTEGER NOT NULL REFERENCES Services(service_id),
      patient_count INTEGER NOT NULL,
      visit_date TEXT,
      status TEXT NOT NULL
    );

    INSERT INTO Regions VALUES
      ('North', 'Schuyler'),
      ('South', 'Bradford'),
      ('East', 'Watson');

    INSERT INTO Facilities (facility_id, name, region, capacity, referral_facility_id) VALUES
      (1, 'Riverside Clinic', 'North', 120, NULL),
      (2, 'Hilltop Medical Center', 'North', 80, NULL),
      (3, 'Lakeside Hospital', 'South', 200, NULL),
      (4, 'Eastside Community Clinic', 'East', 65, NULL),
      (5, 'Westview Health Center', 'West', 95, NULL);

    UPDATE Facilities SET referral_facility_id = 2 WHERE facility_id = 1;
    UPDATE Facilities SET referral_facility_id = 1 WHERE facility_id = 2;
    UPDATE Facilities SET referral_facility_id = 3 WHERE facility_id = 4;

    INSERT INTO Services VALUES
      (10, 'Primary Care', 'Outpatient'),
      (11, 'Vaccination', 'Preventive'),
      (12, 'Diagnostic Imaging', 'Diagnostic'),
      (13, 'Physical Therapy', 'Rehabilitation'),
      (14, 'Behavioral Health', 'Outpatient'),
      (15, 'Nutrition Counseling', 'Nutrition');

    INSERT INTO Visits VALUES
      (101, 1, 11, 40, '2026-09-01', 'completed'),
      (102, 1, 10, 16, '2026-09-02', 'completed'),
      (103, 2, 11, 25, NULL, 'scheduled'),
      (104, 3, 12, 8, NULL, 'planned'),
      (105, 4, 13, 18, '2026-09-04', 'completed'),
      (106, 2, 10, 12, '2026-09-05', 'completed'),
      (107, 5, 14, 9, NULL, 'planned'),
      (108, 1, 13, 21, '2026-09-06', 'completed'),
      (109, 3, 10, 33, NULL, 'scheduled'),
      (110, 4, 12, 5, '2026-09-07', 'completed'),
      (111, 5, 11, 17, '2026-09-08', 'completed'),
      (112, 2, 13, 14, NULL, 'planned'),
      (113, 3, 14, 12, '2026-09-09', 'completed'),
      (114, 1, 12, 7, NULL, 'scheduled'),
      (115, 2, 11, 4, '2026-09-10', 'completed'),
      (116, 4, 10, 20, '2026-09-11', 'completed'),
      (117, 5, 13, 26, NULL, 'planned'),
      (118, 2, 14, 30, '2026-09-12', 'completed'),
      (119, 3, 11, 11, NULL, 'scheduled'),
      (120, 1, 14, 8, '2026-09-13', 'completed'),
      (121, 2, 12, 27, NULL, 'delayed'),
      (122, 4, 11, 15, '2026-09-14', 'completed'),
      (123, 5, 10, 19, NULL, 'planned'),
      (124, 2, 10, 10, NULL, 'scheduled'),
      (125, 3, 13, 22, '2026-09-15', 'completed');
  `,
};
