export const createLegacyCardStore = (database) => ({
  getSubjects() {
    return database.select('SELECT * FROM subjects');
  },

  addSubject(name, icon) {
    return database.execute('INSERT INTO subjects (name, icon) VALUES (?, ?)', [name, icon ?? null]);
  },

  deleteSubject(id) {
    return database.execute('DELETE FROM subjects WHERE id = ?', [id]);
  },

  getCards(subjectId) {
    return database.select('SELECT * FROM cards WHERE subject_id = ? ORDER BY id DESC', [subjectId]);
  },

  addCard(card) {
    return database.execute(
      `
        INSERT INTO cards (
          subject_id,
          word,
          transcription,
          translation,
          definition,
          example,
          category
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        card.subject_id,
        card.word,
        card.transcription ?? null,
        card.translation ?? null,
        card.definition ?? null,
        card.example ?? null,
        card.category ?? null,
      ],
    );
  },

  updateCard(id, card) {
    return database.execute(
      `
        UPDATE cards
        SET word = ?, transcription = ?, translation = ?, definition = ?, example = ?, category = ?
        WHERE id = ?
      `,
      [
        card.word,
        card.transcription ?? null,
        card.translation ?? null,
        card.definition ?? null,
        card.example ?? null,
        card.category ?? null,
        id,
      ],
    );
  },

  deleteCard(id) {
    return database.execute('DELETE FROM cards WHERE id = ?', [id]);
  },
});
