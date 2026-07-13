const db = require('../config/db');

const Leaderboard = {
  getTop: async (limit = 50) => {
    const [rows] = await db.query(
      `SELECT l.*, u.full_name, u.avatar, u.email 
       FROM leaderboard l JOIN users u ON l.user_id = u.id 
       ORDER BY l.total_points DESC LIMIT ?`, [limit]
    );
    return rows;
  },

  findByUser: async (userId) => {
    const [rows] = await db.query(
      `SELECT l.*, u.full_name, u.avatar 
       FROM leaderboard l JOIN users u ON l.user_id = u.id 
       WHERE l.user_id = ?`, [userId]
    );
    return rows[0];
  },

  upsert: async (data) => {
    const [existing] = await db.query('SELECT id FROM leaderboard WHERE user_id = ?', [data.user_id]);
    if (existing.length > 0) {
      const [result] = await db.query(
        `UPDATE leaderboard SET 
         total_points = total_points + ?, 
         quizzes_taken = quizzes_taken + ?,
         quizzes_passed = quizzes_passed + ?,
         exams_taken = exams_taken + ?,
         exams_passed = exams_passed + ?
         WHERE user_id = ?`,
        [data.total_points || 0, data.quizzes_taken || 0, data.quizzes_passed || 0,
         data.exams_taken || 0, data.exams_passed || 0, data.user_id]
      );
      return result.affectedRows;
    } else {
      const [result] = await db.query(
        'INSERT INTO leaderboard (user_id, total_points, quizzes_taken, quizzes_passed, exams_taken, exams_passed) VALUES (?, ?, ?, ?, ?, ?)',
        [data.user_id, data.total_points || 0, data.quizzes_taken || 0, data.quizzes_passed || 0, data.exams_taken || 0, data.exams_passed || 0]
      );
      return result.insertId;
    }
  },

  updateRanks: async () => {
    await db.query(`
      SET @rank = 0;
      UPDATE leaderboard SET rank_position = (@rank := @rank + 1) ORDER BY total_points DESC;
    `);
  }
};

module.exports = Leaderboard;
