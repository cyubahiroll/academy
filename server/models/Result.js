const db = require('../config/db');

const Result = {
  createQuizResult: async (data) => {
    const [result] = await db.query(
      'INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, correct_count, wrong_count, time_taken, passed, attempt_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.user_id, data.quiz_id, data.score, data.total_questions, data.correct_count, data.wrong_count, data.time_taken, data.passed, data.attempt_number]
    );
    return result.insertId;
  },

  createExamResult: async (data) => {
    const [result] = await db.query(
      'INSERT INTO exam_results (user_id, exam_id, score, total_questions, correct_count, wrong_count, time_taken, passed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.user_id, data.exam_id, data.score, data.total_questions, data.correct_count, data.wrong_count, data.time_taken, data.passed]
    );
    return result.insertId;
  },

  getQuizResultsByUser: async (userId) => {
    const [rows] = await db.query(
      `SELECT qr.*, q.title as quiz_title, q.pass_score as required_score 
       FROM quiz_results qr JOIN quizzes q ON qr.quiz_id = q.id 
       WHERE qr.user_id = ? ORDER BY qr.completed_at DESC`, [userId]
    );
    return rows;
  },

  getExamResultsByUser: async (userId) => {
    const [rows] = await db.query(
      `SELECT er.*, e.title as exam_title, e.pass_score as required_score 
       FROM exam_results er JOIN exams e ON er.exam_id = e.id 
       WHERE er.user_id = ? ORDER BY er.completed_at DESC`, [userId]
    );
    return rows;
  },

  getQuizAttemptCount: async (userId, quizId) => {
    const [{ count }] = await db.query(
      'SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ? AND quiz_id = ?',
      [userId, quizId]
    );
    return count;
  },

  getQuizBestScore: async (userId, quizId) => {
    const [rows] = await db.query(
      'SELECT MAX(score) as best_score FROM quiz_results WHERE user_id = ? AND quiz_id = ?',
      [userId, quizId]
    );
    return rows[0].best_score || 0;
  }
};

module.exports = Result;
