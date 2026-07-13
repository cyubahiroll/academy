const db = require('../config/db');

const BookPaymentModel = {
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO book_payments (user_id, book_id, phone_number, country_code, amount, currency, payment_provider, reference_id, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [data.user_id, data.book_id, data.phone_number, data.country_code, data.amount, data.currency || 'RWF', data.payment_provider, data.reference_id]
    );
    return result.insertId;
  },

  findByReferenceId: async (referenceId) => {
    const [rows] = await db.query('SELECT * FROM book_payments WHERE reference_id = ?', [referenceId]);
    return rows[0];
  },

  findSuccessfulByUserAndBook: async (userId, bookId) => {
    const [rows] = await db.query(
      "SELECT * FROM book_payments WHERE user_id = ? AND book_id = ? AND payment_status = 'SUCCESSFUL' ORDER BY created_at DESC LIMIT 1",
      [userId, bookId]
    );
    return rows[0];
  },

  updateStatus: async (id, status, financialTransactionId = null) => {
    const query = financialTransactionId
      ? 'UPDATE book_payments SET payment_status = ?, financial_transaction_id = ? WHERE id = ?'
      : 'UPDATE book_payments SET payment_status = ? WHERE id = ?';
    const params = financialTransactionId ? [status, financialTransactionId, id] : [status, id];
    const [result] = await db.query(query, params);
    return result.affectedRows;
  }
};

module.exports = BookPaymentModel;
