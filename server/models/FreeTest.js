const db = require('../config/db');

const FreeTest = {
  pickQuestions: async (count = 20) => {
    const [rows] = await db.query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d FROM free_test_questions ORDER BY RAND() LIMIT ?',
      [count]
    );
    return rows;
  },

  createAttempt: async (userId, total = 20) => {
    const [result] = await db.query(
      'INSERT INTO free_test_attempts (user_id, total) VALUES (?, ?)',
      [userId, total]
    );
    return result.insertId;
  },

  saveAnswers: async (attemptId, answers) => {
    if (!answers || answers.length === 0) return;
    const values = answers.map(a => [attemptId, a.questionId, a.selected]);
    await db.query(
      'INSERT INTO free_test_answers (attempt_id, question_id, selected_answer) VALUES ?',
      [values]
    );
  },

  scoreAttempt: async (attemptId) => {
    const [rows] = await db.query(
      `SELECT a.selected_answer, q.correct_answer
       FROM free_test_answers a
       JOIN free_test_questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?`,
      [attemptId]
    );
    let score = 0;
    for (const row of rows) {
      if (row.selected_answer && row.selected_answer.toLowerCase() === row.correct_answer.toLowerCase()) {
        score++;
      }
    }
    const passed = score >= 12;
    await db.query(
      'UPDATE free_test_attempts SET score = ?, passed = ? WHERE id = ?',
      [score, passed, attemptId]
    );
    return { score, total: rows.length, passed };
  },

  getAttempt: async (attemptId) => {
    const [rows] = await db.query(
      `SELECT a.*, u.full_name
       FROM free_test_attempts a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [attemptId]
    );
    return rows[0];
  },

  getHistory: async (userId) => {
    const [rows] = await db.query(
      'SELECT id, score, total, passed, created_at FROM free_test_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    return rows;
  },

  getAnswersWithDetails: async (attemptId) => {
    const [rows] = await db.query(
      `SELECT a.selected_answer, a.is_correct, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer
       FROM free_test_answers a
       JOIN free_test_questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?`,
      [attemptId]
    );
    return rows;
  }
};

module.exports = FreeTest;
