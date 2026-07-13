const Result = require('../models/Result');

exports.getQuizResults = async (req, res, next) => {
  try {
    const results = await Result.getQuizResultsByUser(req.user.id);
    res.json(Array.isArray(results) ? results : []);
  } catch (error) {
    next(error);
  }
};

exports.getExamResults = async (req, res, next) => {
  try {
    const results = await Result.getExamResultsByUser(req.user.id);
    res.json(Array.isArray(results) ? results : []);
  } catch (error) {
    next(error);
  }
};
