const db = require('../config/db');

const Payment = {
  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO payments (user_id, subscription_id, amount, currency, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.user_id, data.subscription_id, data.amount, data.currency, data.payment_method, data.transaction_id, data.status]
    );
    return result.insertId;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    return rows[0];
  },

  findByUser: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId]
    );
    return rows;
  },

  updateStatus: async (id, status, transactionId = null) => {
    const query = transactionId
      ? 'UPDATE payments SET status = ?, transaction_id = ?, paid_at = NOW() WHERE id = ?'
      : 'UPDATE payments SET status = ? WHERE id = ?';
    const params = transactionId ? [status, transactionId, id] : [status, id];
    const [result] = await db.query(query, params);
    return result.affectedRows;
  },

  findAll: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT p.*, u.full_name as user_name, u.email as user_email 
       FROM payments p JOIN users u ON p.user_id = u.id 
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [limit, offset]
    );
    const [{ count }] = await db.query('SELECT COUNT(*) as count FROM payments');
    return { payments: rows, total: count, page, limit };
  }
};

module.exports = Payment;
