import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import {
  getDatabaseBytes,
  setDatabaseBytes,
  clearDatabase,
} from "../storage/browserStorage.js";

let SQL = null;

export async function initDatabaseEngine() {
  if (!SQL) {
    SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function persistDatabase(dayKey, domainKey, version, db) {
  setDatabaseBytes(dayKey, domainKey, version, bytesToBase64(db.export()));
}

export function createStarterDb(dayKey, domainKey, version, databaseConfig) {
  const db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON;");
  db.run(databaseConfig.setupSql);
  persistDatabase(dayKey, domainKey, version, db);
  return db;
}

export function loadDatabase(dayKey, domainKey, version, databaseConfig) {
  const saved = getDatabaseBytes(dayKey, domainKey, version);

  if (!saved) {
    return createStarterDb(dayKey, domainKey, version, databaseConfig);
  }

  try {
    const db = new SQL.Database(base64ToBytes(saved));
    db.run("PRAGMA foreign_keys = ON;");
    return db;
  } catch {
    // If the browser copy is unreadable, rebuild only this exact day/domain/version.
    clearDatabase(dayKey, domainKey, version);
    return createStarterDb(dayKey, domainKey, version, databaseConfig);
  }
}

export function resetDatabase(dayKey, domainKey, version, databaseConfig, currentDb) {
  try {
    currentDb?.close();
  } catch {
    // Ignore close errors; the replacement DB is created below.
  }

  clearDatabase(dayKey, domainKey, version);
  return createStarterDb(dayKey, domainKey, version, databaseConfig);
}

export function runSql(dayKey, domainKey, version, db, sql) {
  db.run("PRAGMA foreign_keys = ON;");

  // SQLite can execute earlier statements before a later statement fails.
  // Persist in finally so the browser copy always matches the actual in-memory DB.
  try {
    return db.exec(sql);
  } finally {
    persistDatabase(dayKey, domainKey, version, db);
  }
}

export function getTables(db) {
  const result = db.exec(`
    SELECT name
    FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name;
  `);
  return result[0]?.values.map((row) => row[0]) ?? [];
}

export function getColumns(db, table) {
  const safe = table.replaceAll('"', '""');
  const result = db.exec(`PRAGMA table_info("${safe}");`);
  return result[0]?.values.map((row) => ({
    name: row[1],
    type: row[2],
    notNull: Boolean(row[3]),
    pk: Boolean(row[5]),
  })) ?? [];
}

export function previewTable(db, table) {
  const safe = table.replaceAll('"', '""');
  return db.exec(`SELECT * FROM "${safe}" LIMIT 25;`);
}
