const AiAnswerer = require('../models/AiAnswerer');

exports.solveQuestion = async (req, res, next) => {
  try {
    const { question_text, option_a, option_b, option_c, option_d } = req.body;

    if (!question_text || !question_text.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    const result = await AiAnswerer.solveQuestion({ question_text, option_a, option_b, option_c, option_d });

    res.json(result);
  } catch (error) {
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ message: 'AI service is busy. Please try again in a moment.' });
    }
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ message: 'AI API daily quota exceeded. Try again tomorrow.' });
    }
    next(error);
  }
};

exports.answerQuestions = async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of questions' });
    }

    if (questions.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 questions at a time' });
    }

    const answers = await AiAnswerer.answerQuestions(questions);

    res.json({ answers });
  } catch (error) {
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ message: 'AI service is busy. Please try again in a moment.' });
    }
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ message: 'AI API daily quota exceeded. Try again tomorrow.' });
    }
    next(error);
  }
};
