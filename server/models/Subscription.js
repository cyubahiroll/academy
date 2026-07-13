const db = require('../config/db');

const Subscription = {
  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO subscriptions (user_id, plan, status, start_date, end_date, amount) VALUES (?, ?, ?, ?, ?, ?)',
      [data.user_id, data.plan, data.status, data.start_date, data.end_date, data.amount]
    );
    return result.insertId;
  },

  findByUser: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC', [userId]
    );
    return rows;
  },

  findActiveByUser: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date >= CURDATE() ORDER BY end_date DESC LIMIT 1",
      [userId]
    );
    return rows[0];
  },

  updateStatus: async (id, status) => {
    const [result] = await db.query('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
  },

  findAll: async () => {
    const [rows] = await db.query(
      `SELECT s.*, u.full_name as user_name, u.email as user_email 
       FROM subscriptions s JOIN users u ON s.user_id = u.id 
       ORDER BY s.created_at DESC`
    );
    return rows;
  },

  cancel: async (id) => {
    const [result] = await db.query("UPDATE subscriptions SET status = 'cancelled' WHERE id = ?", [id]);
    return result.affectedRows;
  }
};

module.exports = Subscription;
