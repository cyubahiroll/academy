const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { calculateScore, hasPassed, calculatePoints } = require('../utils/scoreCalculator');

exports.getAllQuizzes = async (req, res, next) => {
  try {
    const isFree = req.query.is_free !== undefined ? req.query.is_free === 'true' : null;
    const quizzes = await Quiz.findAll(isFree);
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const questions = await Question.findByQuizId(req.params.id);
    const questionsWithoutAnswers = questions.map(q => {
      const { correct_answer, ...rest } = q;
      return rest;
    });
    res.json({ quiz, questions: questionsWithoutAnswers });
  } catch (error) {
    next(error);
  }
};

exports.startQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.is_free) {
      return res.status(403).json({ message: 'This quiz requires a premium subscription' });
    }

    const attemptCount = await Result.getQuizAttemptCount(req.user.id, req.params.id);
    if (attemptCount >= quiz.attempt_limit) {
      return res.status(403).json({
        message: `You have used all ${quiz.attempt_limit} attempts for this quiz`,
        attemptsUsed: attemptCount,
        attemptLimit: quiz.attempt_limit
      });
    }

    const questions = await Question.findByQuizId(req.params.id);
    const questionsWithoutAnswers = questions.map(q => {
      const { correct_answer, ...rest } = q;
      return rest;
    });

    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.time_limit,
        difficulty: quiz.difficulty,
        attempt_number: attemptCount + 1
      },
      questions: questionsWithoutAnswers
    });
  } catch (error) {
    next(error);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, time_taken } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = await Question.findByQuizId(quizId);
    if (!answers || answers.length !== questions.length) {
      return res.status(400).json({ message: 'Please answer all questions' });
    }

    const attemptCount = await Result.getQuizAttemptCount(req.user.id, quizId);

    const { score, totalQuestions, correctCount, wrongCount, results } = calculateScore(answers, questions);
    const passed = hasPassed(score, quiz.pass_score);

    await Result.createQuizResult({
      user_id: req.user.id,
      quiz_id: quizId,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      wrong_count: wrongCount,
      time_taken: time_taken || 0,
      passed,
      attempt_number: attemptCount + 1
    });

    res.json({
      score,
      totalQuestions,
      correctCount,
      wrongCount,
      passed,
      passScore: quiz.pass_score,
      attempt_number: attemptCount + 1,
      details: results
    });
  } catch (error) {
    next(error);
  }
};

exports.createQuiz = async (req, res, next) => {
  try {
    const quizId = await Quiz.create(req.body);
    if (req.body.questions && req.body.questions.length > 0) {
      await Question.createBulk(quizId, req.body.questions);
    }
    const quiz = await Quiz.findById(quizId);
    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const affected = await Quiz.update(req.params.id, req.body);
    if (affected === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.deleteQuiz = async (req, res, next) => {
  try {
    const affected = await Quiz.delete(req.params.id);
    if (affected === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};
