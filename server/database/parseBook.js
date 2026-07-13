const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const WordExtractor = require('word-extractor');

const BOOK_PATH = path.join(__dirname, '..', 'uploads', 'documents', '1781098830292-193340733.doc');

async function parseQuestions() {
  const extractor = new WordExtractor();
  const extracted = await extractor.extract(BOOK_PATH);
  const lines = extracted.getBody().split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const questions = [];
  let current = null;

  for (const line of lines) {
    const questionMatch = line.match(/^(\d{1,4})\.\s*(.*)/);
    if (questionMatch) {
      if (current && current.options.length >= 3) {
        const correct = current.options.find(o => o.isCorrect);
        if (correct && current.options.length >= 3) {
          questions.push(current);
        }
      }
      current = {
        number: parseInt(questionMatch[1]),
        text: questionMatch[2],
        options: []
      };
      continue;
    }

    if (!current) continue;

    const correctMatch = line.match(/^\(([a-d])\)\s*(.*)/);
    const wrongMatch = line.match(/^([a-d]\))\s*(.*)/);

    if (correctMatch) {
      const letter = correctMatch[1];
      current.options.push({ letter, text: correctMatch[2] || '', isCorrect: true });
    } else if (wrongMatch) {
      const letter = wrongMatch[1].replace(')', '');
      current.options.push({ letter, text: wrongMatch[2] || '', isCorrect: false });
    }
  }

  if (current && current.options.length >= 3) {
    const correct = current.options.find(o => o.isCorrect);
    if (correct) questions.push(current);
  }

  return questions;
}

async function seedQuestions() {
  console.log('Parsing book...');
  const questions = await parseQuestions();
  console.log(`Found ${questions.length} questions`);

  const [existing] = await db.query('SELECT COUNT(*) as count FROM free_test_questions');
  if (existing[0].count > 0) {
    console.log(`Database already has ${existing[0].count} questions, skipping seed.`);
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const q of questions) {
    const correct = q.options.find(o => o.isCorrect);
    if (!correct) { skipped++; continue; }

    const optA = q.options.find(o => o.letter === 'a') || { text: '' };
    const optB = q.options.find(o => o.letter === 'b') || { text: '' };
    const optC = q.options.find(o => o.letter === 'c') || { text: '' };
    const optD = q.options.find(o => o.letter === 'd') || { text: '' };

    if (!q.text || !optA.text) { skipped++; continue; }

    await db.query(
      'INSERT INTO free_test_questions (question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?)',
      [q.text, optA.text, optB.text, optC.text, optD.text, correct.letter]
    );
    inserted++;
  }

  console.log(`Inserted ${inserted} questions, skipped ${skipped}`);
}

seedQuestions().then(() => {
  console.log('Done');
  process.exit(0);
}).catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});
