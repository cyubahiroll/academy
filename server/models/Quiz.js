const db = require('../config/db');

const Quiz = {
  findAll: async (isFree = null) => {
    let query = `SELECT q.*, c.name as category_name FROM quizzes q 
                 LEFT JOIN categories c ON q.category_id = c.id`;
    const params = [];
    if (isFree !== null) {
      query += ' WHERE q.is_free = ?';
      params.push(isFree);
    }
    query += ' ORDER BY q.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT q.*, c.name as category_name FROM quizzes q 
       LEFT JOIN categories c ON q.category_id = c.id WHERE q.id = ?`, [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO quizzes (title, description, category_id, difficulty, pass_score, time_limit, is_free, attempt_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.title, data.description, data.category_id, data.difficulty, data.pass_score, data.time_limit, data.is_free, data.attempt_limit]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    values.push(id);
    const [result] = await db.query(`UPDATE quizzes SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM quizzes WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Quiz;
