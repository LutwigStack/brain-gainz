const DEFAULT_SUBJECT_NAME = 'English';
const DEFAULT_SUBJECT_ICON = '\uD83C\uDDEC\uD83C\uDDE7';

export const ensureLegacySchema = async (database) => {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      transcription TEXT,
      translation TEXT,
      definition TEXT,
      example TEXT,
      category TEXT,
      last_reviewed DATETIME,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
    )
  `);
};

export const seedLegacyDefaults = async (database) => {
  const subjects = await database.select('SELECT * FROM subjects');

  if (subjects.length === 0) {
    await database.execute('INSERT INTO subjects (name, icon) VALUES (?, ?)', [
      DEFAULT_SUBJECT_NAME,
      DEFAULT_SUBJECT_ICON,
    ]);
  }
};
