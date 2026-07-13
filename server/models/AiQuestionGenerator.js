const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const pdfParse = require('pdf-parse');

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || undefined,
  timeout: 90000,
  maxRetries: 0,
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (messages, model, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });
      return response;
    } catch (error) {
      const isRateLimit = error.status === 429;
      const isQuotaExhausted = error.message?.includes('tokens per day');
      const isServerError = error.status >= 500;
      if ((isRateLimit && !isQuotaExhausted || isServerError) && attempt < maxRetries) {
        const delay = isRateLimit
          ? Math.min(attempt * 10000 + Math.random() * 3000, 30000)
          : Math.min(attempt * 5000 + Math.random() * 2000, 20000);
        console.log(`[AiQuestionGenerator] ${error.status || error.code} attempt ${attempt}/${maxRetries}, waiting ${Math.round(delay / 1000)}s`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
};

const AiQuestionGenerator = {
  getDocuments: async () => {
    const [rows] = await db.query(
      `SELECT d.id, d.title, d.description, d.file_url, d.file_type,
              c.name as category_name
       FROM documents d
       LEFT JOIN categories c ON d.category_id = c.id
       ORDER BY d.created_at DESC`
    );
    return rows;
  },

  extractText: async (documentId) => {
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [documentId]);
    if (!rows[0]) throw new Error('Document not found');

    const doc = rows[0];
    const filePath = path.join(__dirname, '..', doc.file_url.replace(/^\//, ''));

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found on server');
    }

    const ext = path.extname(doc.file_url).toLowerCase();
    const buffer = fs.readFileSync(filePath);

    if (ext === '.pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    if (ext === '.doc') {
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(filePath);
      return extracted.getBody();
    }

    throw new Error('Unsupported file format');
  },

  generateQuestions: async (text, count = 10) => {
    const maxChars = 7000;
    const truncated = text.length > maxChars ? text.slice(0, maxChars) : text;

    const prompt = `You are a professional exam question writer and road rules instructor. Based on the following book content, create ${count} multiple-choice questions that TEACH while testing.

Rules:
- Each question must have exactly 4 answer options (a, b, c, d)
- Only one correct answer per question
- Questions should test understanding of key concepts from the content, not just memorization
- Options should be plausible but only one correct
- Include an explanation field that teaches why the answer is correct
- Return ONLY valid JSON array, no markdown, no explanation

Format (JSON array):
[
  {
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_answer": "a",
    "explanation": "Teaching explanation of why this answer is correct and why others are wrong"
  }
]

Book content:
---
${truncated}
---`;

    const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
    const response = await callWithRetry(
      [{ role: 'user', content: prompt }],
      model
    );

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response from AI');

    const json = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const questions = JSON.parse(json);

    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }

    return questions;
  },

  saveQuestions: async (questions, source = 'ai') => {
    if (!questions || questions.length === 0) return [];

    const values = questions.map(q => [
      q.question_text,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      q.correct_answer.toLowerCase().trim(),
      source,
    ]);

    const [result] = await db.query(
      `INSERT INTO free_test_questions (question_text, option_a, option_b, option_c, option_d, correct_answer, source)
       VALUES ?`,
      [values]
    );

    const insertedIds = [];
    for (let i = 0; i < result.affectedRows; i++) {
      insertedIds.push(result.insertId + i);
    }
    return insertedIds;
  },
};

module.exports = AiQuestionGenerator;
