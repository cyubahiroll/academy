const Leaderboard = require('../models/Leaderboard');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const topPlayers = await Leaderboard.getTop(limit);
    const userRanking = req.user ? await Leaderboard.findByUser(req.user.id) : null;

    res.json({
      leaderboard: topPlayers,
      myRank: userRanking ? {
        rank: userRanking.rank_position,
        points: userRanking.total_points,
        quizzes_taken: userRanking.quizzes_taken,
        exams_taken: userRanking.exams_taken
      } : null
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserRank = async (req, res, next) => {
  try {
    const rank = await Leaderboard.findByUser(req.user.id);
    if (!rank) {
      return res.json({ message: 'No rank data yet. Take a quiz or exam to get ranked!' });
    }
    res.json(rank);
  } catch (error) {
    next(error);
  }
};
