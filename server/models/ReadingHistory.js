const db = require('../config/db');

const ReadingHistory = {
  findByUserAndBook: async (userId, bookId) => {
    const [rows] = await db.query(
      'SELECT * FROM reading_history WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    return rows[0];
  },

  upsert: async (data) => {
    const [existing] = await db.query(
      'SELECT id FROM reading_history WHERE user_id = ? AND book_id = ?',
      [data.user_id, data.book_id]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE reading_history SET current_page = ?, total_pages = ?, progress = ?, last_read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ?',
        [data.current_page, data.total_pages, data.progress, data.user_id, data.book_id]
      );
      return existing[0].id;
    }

    const [result] = await db.query(
      'INSERT INTO reading_history (user_id, book_id, current_page, total_pages, progress) VALUES (?, ?, ?, ?, ?)',
      [data.user_id, data.book_id, data.current_page || 1, data.total_pages || 1, data.progress || 0]
    );
    return result.insertId;
  }
};

module.exports = ReadingHistory;
