const FreeTest = require('../models/FreeTest');

exports.startTest = async (req, res, next) => {
  try {
    const questions = await FreeTest.pickQuestions(20);
    if (questions.length < 20) {
      return res.status(400).json({ message: 'Not enough questions in the database' });
    }

    const attemptId = await FreeTest.createAttempt(req.user.id, 20);

    const safeQuestions = questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d
    }));

    res.json({ attemptId, questions: safeQuestions });
  } catch (error) {
    next(error);
  }
};

exports.submitTest = async (req, res, next) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await FreeTest.getAttempt(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    if (attempt.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await FreeTest.saveAnswers(attemptId, answers);
    const result = await FreeTest.scoreAttempt(attemptId);
    const details = await FreeTest.getAnswersWithDetails(attemptId);

    res.json({ ...result, details });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await FreeTest.getHistory(req.user.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};
