const db = require('../config/db');

const extractNgrams = (words, n = 2) => {
  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
};

const scoreRelevance = (query, text) => {
  if (!text) return 0;
  const qWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const tLower = text.toLowerCase();

  let score = 0;

  const qSet = new Set(qWords);
  const tSet = new Set(tLower.split(/\s+/).filter(w => w.length > 1));
  const intersection = [...qSet].filter(w => tSet.has(w));
  score += intersection.length * 5;

  for (const word of qWords) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = tLower.match(regex);
    if (matches) score += matches.length * 2;
  }

  const qNgrams = extractNgrams(qWords, 2);
  const ngramMatches = qNgrams.filter(ng => tLower.includes(ng));
  score += ngramMatches.length * 10;

  if (tLower.includes(query.toLowerCase())) {
    score += 15;
  }

  return score;
};

const processQuestionRows = (rows, query, sourceLabel, contentFormatter) => {
  const results = [];
  for (const row of rows) {
    const text = [row.question_text, row.explanation || '', row.option_a || '', row.option_b || '', row.option_c || '', row.option_d || ''].join(' ');
    const score = scoreRelevance(query, text);
    if (score > 0) {
      results.push({
        source: 'database',
        title: sourceLabel(row),
        content: contentFormatter(row),
        relevance: score,
      });
    }
  }
  return results;
};

const searchDatabase = async (query, topK = 5) => {
  if (!query || !query.trim()) return [];
  const results = [];
  const likeQuery = `%${query}%`;

  try {
    const [rows] = await db.query(
      `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
              q.correct_answer, q.explanation, qz.title as quiz_title
       FROM questions q
       JOIN quizzes qz ON q.quiz_id = qz.id
       WHERE q.question_text LIKE ? OR q.explanation LIKE ? OR q.option_a LIKE ? OR q.option_b LIKE ? OR q.option_c LIKE ? OR q.option_d LIKE ?
       LIMIT 30`,
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery]
    );

    results.push(...processQuestionRows(
      rows, query,
      (r) => `Quiz: ${r.quiz_title}`,
      (r) => `Q: ${r.question_text}\nA: ${r.option_a}, ${r.option_b}, ${r.option_c}, ${r.option_d}\nCorrect: ${r.correct_answer}\nExplanation: ${r.explanation || 'N/A'}`
    ));
  } catch (e) {
    console.error('[DBSearch] Quiz search error:', e.message);
  }

  try {
    const [rows] = await db.query(
      `SELECT eq.id, eq.question_text, eq.option_a, eq.option_b, eq.option_c, eq.option_d,
              eq.correct_answer, eq.explanation, e.title as exam_title
       FROM exam_questions eq
       JOIN exams e ON eq.exam_id = e.id
       WHERE eq.question_text LIKE ? OR eq.explanation LIKE ? OR eq.option_a LIKE ? OR eq.option_b LIKE ? OR eq.option_c LIKE ? OR eq.option_d LIKE ?
       LIMIT 30`,
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery]
    );

    results.push(...processQuestionRows(
      rows, query,
      (r) => `Exam: ${r.exam_title}`,
      (r) => `Q: ${r.question_text}\nA: ${r.option_a}, ${r.option_b}, ${r.option_c}, ${r.option_d}\nCorrect: ${r.correct_answer}\nExplanation: ${r.explanation || 'N/A'}`
    ));
  } catch (e) {
    console.error('[DBSearch] Exam search error:', e.message);
  }

  try {
    const [rows] = await db.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer
       FROM free_test_questions
       WHERE question_text LIKE ? OR option_a LIKE ? OR option_b LIKE ? OR option_c LIKE ? OR option_d LIKE ?
       LIMIT 30`,
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery]
    );

    results.push(...processQuestionRows(
      rows, query,
      () => 'Free Test Question Bank',
      (r) => `Q: ${r.question_text}\nA: ${r.option_a}, ${r.option_b}, ${r.option_c}, ${r.option_d}\nCorrect: ${r.correct_answer}`
    ));
  } catch (e) {
    console.error('[DBSearch] Free test search error:', e.message);
  }

  results.sort((a, b) => b.relevance - a.relevance);
  return results.slice(0, topK);
};

module.exports = { searchDatabase };
