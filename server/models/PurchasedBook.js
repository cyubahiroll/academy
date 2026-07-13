const db = require('../config/db');

const PurchasedBook = {
  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO purchased_books (user_id, book_id, payment_id) VALUES (?, ?, ?)',
      [data.user_id, data.book_id, data.payment_id]
    );
    return result.insertId;
  },

  findByUserAndBook: async (userId, bookId) => {
    const [rows] = await db.query(
      'SELECT * FROM purchased_books WHERE user_id = ? AND book_id = ? ORDER BY purchase_date DESC LIMIT 1',
      [userId, bookId]
    );
    return rows[0];
  }
};

module.exports = PurchasedBook;
