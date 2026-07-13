const db = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findByEmailExcludingId: async (email, id) => {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT id, full_name, email, phone, role, avatar, is_active, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  create: async ({ full_name, email, password, phone }) => {
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
      [full_name, email, password, phone]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  findAll: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT id, full_name, email, phone, role, avatar, is_active, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [{ count }] = await db.query('SELECT COUNT(*) as count FROM users');
    return { users: rows, total: count, page, limit };
  }
};

module.exports = User;
