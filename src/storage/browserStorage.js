const PREFIX = "ise2530-sql-v3";

export function getSetting(key, fallback = null) {
  const value = localStorage.getItem(`${PREFIX}:setting:${key}`);
  return value ?? fallback;
}

export function setSetting(key, value) {
  localStorage.setItem(`${PREFIX}:setting:${key}`, String(value));
}

// Student code is scoped by day + domain + question. This means Day 10 work
// remains available later while a newly released Day 11 starts with empty code.
export function getAnswer(dayKey, domain, questionId, fallback = "") {
  return localStorage.getItem(`${PREFIX}:code:${dayKey}:${domain}:${questionId}`) ?? fallback;
}

export function setAnswer(dayKey, domain, questionId, sql) {
  localStorage.setItem(`${PREFIX}:code:${dayKey}:${domain}:${questionId}`, sql);
}

export function clearDayAnswers(dayKey, domain = null) {
  const prefix = domain
    ? `${PREFIX}:code:${dayKey}:${domain}:`
    : `${PREFIX}:code:${dayKey}:`;

  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) localStorage.removeItem(key);
  }
}

// SQLite database state is scoped by day + domain + canonical database version.
// Example: ise2530-sql-v3:db:day10:humanitarian:v1
//
// This is the key consistency safeguard:
// - returning to Day 10 restores that student's Day 10 DB;
// - Day 11 uses a completely different DB key;
// - bumping a day's databaseVersion creates a fresh canonical DB automatically.
export function databaseStorageKey(dayKey, domain, version) {
  return `${PREFIX}:db:${dayKey}:${domain}:v${version}`;
}

export function getDatabaseBytes(dayKey, domain, version) {
  return localStorage.getItem(databaseStorageKey(dayKey, domain, version));
}

export function setDatabaseBytes(dayKey, domain, version, base64) {
  localStorage.setItem(databaseStorageKey(dayKey, domain, version), base64);
}

export function clearDatabase(dayKey, domain, version) {
  localStorage.removeItem(databaseStorageKey(dayKey, domain, version));
}
