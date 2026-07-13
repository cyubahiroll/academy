const db = require('../config/db');

const Question = {
  findByQuizId: async (quizId) => {
    const [rows] = await db.query(
      'SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, image_url, points FROM questions WHERE quiz_id = ? ORDER BY id',
      [quizId]
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, image_url, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.quiz_id, data.question_text, data.option_a, data.option_b, data.option_c, data.option_d, data.correct_answer, data.explanation, data.image_url, data.points]
    );
    return result.insertId;
  },

  createBulk: async (quizId, questions) => {
    const values = questions.map(q => [
      quizId, q.question_text, q.option_a, q.option_b,
      q.option_c || null, q.option_d || null,
      q.correct_answer, q.explanation || null,
      q.image_url || null, q.points || 1
    ]);
    const [result] = await db.query(
      'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, image_url, points) VALUES ?',
      [values]
    );
    return result.affectedRows;
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
    const [result] = await db.query(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM questions WHERE id = ?', [id]);
    return result.affectedRows;
  },

  countByQuizId: async (quizId) => {
    const [{ count }] = await db.query('SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?', [quizId]);
    return count;
  }
};

module.exports = Question;
