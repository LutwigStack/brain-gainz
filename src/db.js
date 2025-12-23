import Database from '@tauri-apps/plugin-sql';

let db = null;

export const initDb = async () => {
    if (db) return db;

    try {
        console.log("Loading database: braingainz.db");
        db = await Database.load('sqlite:braingainz.db');
        console.log("Database instance created:", db);

        // Create subjects table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                icon TEXT
            )
        `);

        // Create cards table
        await db.execute(`
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

        // Insert default subject if none exist
        const subjects = await db.select('SELECT * FROM subjects');
        if (subjects.length === 0) {
            await db.execute('INSERT INTO subjects (name, icon) VALUES (?, ?)', ['English', '🇬🇧']);
        }

        return db;
    } catch (error) {
        console.error("Database initialization failed:", error);
        throw error;
    }
};

export const getSubjects = async () => {
    const database = await initDb();
    return await database.select('SELECT * FROM subjects');
};

export const addSubject = async (name, icon) => {
    const database = await initDb();
    return await database.execute('INSERT INTO subjects (name, icon) VALUES (?, ?)', [name, icon]);
};

export const deleteSubject = async (id) => {
    const database = await initDb();
    return await database.execute('DELETE FROM subjects WHERE id = ?', [id]);
};

export const getCards = async (subjectId) => {
    const database = await initDb();
    return await database.select('SELECT * FROM cards WHERE subject_id = ? ORDER BY id DESC', [subjectId]);
};

export const addCard = async (card) => {
    const database = await initDb();
    return await database.execute(`
        INSERT INTO cards (subject_id, word, transcription, translation, definition, example, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        card.subject_id,
        card.word,
        card.transcription,
        card.translation,
        card.definition,
        card.example,
        card.category
    ]);
};

export const updateCard = async (id, card) => {
    const database = await initDb();
    return await database.execute(`
        UPDATE cards 
        SET word = ?, transcription = ?, translation = ?, definition = ?, example = ?, category = ?
        WHERE id = ?
    `, [
        card.word,
        card.transcription,
        card.translation,
        card.definition,
        card.example,
        card.category,
        id
    ]);
};

export const deleteCard = async (id) => {
    const database = await initDb();
    return await database.execute('DELETE FROM cards WHERE id = ?', [id]);
};
