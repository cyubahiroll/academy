const db = require('../config/db');
const Result = require('../models/Result');
const { calculateScore, hasPassed, calculatePoints } = require('../utils/scoreCalculator');

exports.getAllExams = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, c.name as category_name FROM exams e 
       LEFT JOIN categories c ON e.category_id = c.id 
       ORDER BY e.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getExam = async (req, res, next) => {
  try {
    const [exams] = await db.query(
      `SELECT e.*, c.name as category_name FROM exams e 
       LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = ?`, [req.params.id]
    );
    const exam = exams[0];
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const [questions] = await db.query(
      'SELECT id, exam_id, question_text, option_a, option_b, option_c, option_d, explanation, image_url, points FROM exam_questions WHERE exam_id = ? ORDER BY id',
      [req.params.id]
    );

    res.json({ exam, questions });
  } catch (error) {
    next(error);
  }
};

exports.startExam = async (req, res, next) => {
  try {
    const [exams] = await db.query('SELECT * FROM exams WHERE id = ?', [req.params.id]);
    const exam = exams[0];
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const [subscriptions] = await db.query(
      "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date >= CURDATE() LIMIT 1",
      [req.user.id]
    );
    const subscription = subscriptions[0];

    if (!subscription && exam.price > 0) {
      return res.status(403).json({
        message: 'This exam requires a premium subscription',
        price: exam.price,
        currency: 'UGX'
      });
    }

    const [questions] = await db.query(
      'SELECT id, exam_id, question_text, option_a, option_b, option_c, option_d, explanation, image_url, points FROM exam_questions WHERE exam_id = ? ORDER BY id',
      [req.params.id]
    );

    const questionsWithoutAnswers = questions.map(q => {
      const { correct_answer, ...rest } = q;
      return rest;
    });

    res.json({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        time_limit: exam.time_limit,
        difficulty: exam.difficulty,
        pass_score: exam.pass_score
      },
      questions: questionsWithoutAnswers
    });
  } catch (error) {
    next(error);
  }
};

exports.submitExam = async (req, res, next) => {
  try {
    const { answers, time_taken } = req.body;
    const examId = req.params.id;

    const [exams] = await db.query('SELECT * FROM exams WHERE id = ?', [examId]);
    const exam = exams[0];
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const [questions] = await db.query(
      'SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY id', [examId]
    );

    if (!answers || answers.length !== questions.length) {
      return res.status(400).json({ message: 'Please answer all questions' });
    }

    const { score, totalQuestions, correctCount, wrongCount, results } = calculateScore(answers, questions);
    const passed = hasPassed(score, exam.pass_score);

    await Result.createExamResult({
      user_id: req.user.id,
      exam_id: examId,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      wrong_count: wrongCount,
      time_taken: time_taken || 0,
      passed
    });

    if (passed) {
      await db.query(
        `INSERT INTO leaderboard (user_id, total_points, exams_taken, exams_passed) 
         VALUES (?, ?, 1, 1) 
         ON DUPLICATE KEY UPDATE total_points = total_points + ?, exams_taken = exams_taken + 1, exams_passed = exams_passed + 1`,
        [req.user.id, score, score]
      );
    }

    res.json({
      score,
      totalQuestions,
      correctCount,
      wrongCount,
      passed,
      passScore: exam.pass_score,
      details: results
    });
  } catch (error) {
    next(error);
  }
};

exports.createExam = async (req, res, next) => {
  try {
    const { title, description, category_id, difficulty, pass_score, time_limit, price, questions } = req.body;
    const [result] = await db.query(
      'INSERT INTO exams (title, description, category_id, difficulty, pass_score, time_limit, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, category_id, difficulty, pass_score, time_limit, price || 0]
    );

    if (questions && questions.length > 0) {
      const values = questions.map(q => [
        result.insertId, q.question_text, q.option_a, q.option_b,
        q.option_c || null, q.option_d || null,
        q.correct_answer, q.explanation || null,
        q.image_url || null, q.points || 1
      ]);
      await db.query(
        'INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, image_url, points) VALUES ?',
        [values]
      );
    }

    res.status(201).json({ message: 'Exam created', id: result.insertId });
  } catch (error) {
    next(error);
  }
};
