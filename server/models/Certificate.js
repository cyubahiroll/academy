const db = require('../config/db');

const Certificate = {
  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO certificates (user_id, exam_id, certificate_number, title, file_url, issue_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.user_id, data.exam_id, data.certificate_number, data.title, data.file_url, data.issue_date, data.expiry_date]
    );
    return result.insertId;
  },

  findByUser: async (userId) => {
    const [rows] = await db.query(
      `SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC`, [userId]
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    return rows[0];
  },

  findByCertificateNumber: async (number) => {
    const [rows] = await db.query('SELECT * FROM certificates WHERE certificate_number = ?', [number]);
    return rows[0];
  },

  findAll: async () => {
    const [rows] = await db.query(
      `SELECT c.*, u.full_name as user_name, u.email as user_email 
       FROM certificates c JOIN users u ON c.user_id = u.id 
       ORDER BY c.created_at DESC`
    );
    return rows;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    const [result] = await db.query(`UPDATE certificates SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM certificates WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Certificate;
