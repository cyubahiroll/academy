const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const { searchDocuments } = require('../services/documentSearch');

const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const pdfParse = require('pdf-parse');

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || undefined,
  timeout: 60000,
  maxRetries: 0,
});

let cachedLibrary = null;
let cacheTime = 0;

const extractFileText = async (doc) => {
  const filePath = path.join(__dirname, '..', doc.file_url.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) return '';

  const ext = path.extname(doc.file_url).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }
  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }
  if (ext === '.doc') {
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(filePath);
    return extracted.getBody() || '';
  }
  if (ext === '.txt') {
    return buffer.toString('utf8');
  }
  return '';
};

const loadBuiltInKB = () => {
  const rwPath = path.join(__dirname, '..', 'data', 'amategeko_yumuhanda.json');
  if (fs.existsSync(rwPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(rwPath, 'utf8'));
      const parts = data.sections.map(s => `--- ${s.title} ---\n${s.content}`);
      return parts.join('\n\n');
    } catch (e) {
      console.error('[AiAnswerer] Failed to parse KB:', e.message);
    }
  }
  const enPath = path.join(__dirname, '..', 'data', 'roadRulesKB.json');
  if (fs.existsSync(enPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const parts = data.sections.map(s => `--- ${s.title} ---\n${s.content}`);
      return parts.join('\n\n');
    } catch (e) {
      console.error('[AiAnswerer] Failed to parse KB:', e.message);
    }
  }
  return '';
};

const loadLibrary = async () => {
  const now = Date.now();
  if (cachedLibrary && (now - cacheTime) < 60000) return cachedLibrary;

  const [rows] = await db.query('SELECT id, title, file_url, file_type FROM documents ORDER BY id');
  let combined = '';

  for (const doc of rows) {
    try {
      const text = await extractFileText(doc);
      if (text && text.trim()) {
        combined += `\n\n--- ${doc.title} ---\n${text.slice(0, 15000)}`;
      }
    } catch (e) {
      console.error(`[AiAnswerer] Failed to extract ${doc.title}:`, e.message);
    }
  }

  if (!combined.trim()) {
    combined = loadBuiltInKB();
  }

  const maxChars = 50000;
  cachedLibrary = combined.length > maxChars ? combined.slice(0, maxChars) : combined;
  cacheTime = Date.now();
  return cachedLibrary || '';
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (messages, model, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      });
      return response;
    } catch (error) {
      const isRateLimit = error.status === 429;
      const isServerError = error.status >= 500;
      if ((isRateLimit || isServerError) && attempt < maxRetries) {
        const delay = isRateLimit
          ? Math.min(attempt * 10000 + Math.random() * 3000, 30000)
          : Math.min(attempt * 5000 + Math.random() * 2000, 20000);
        console.log(`[AiAnswerer] ${error.status || error.code} attempt ${attempt}/${maxRetries}, waiting ${Math.round(delay / 1000)}s`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
};

const buildContextFromBooks = async (query) => {
  const bookResults = await searchDocuments(query, 4);
  if (bookResults.length > 0) {
    const ctx = bookResults.map((r, i) =>
      `[Book Source ${i + 1}: "${r.title}"]\n${r.content}`
    ).join('\n\n');
    return {
      context: ctx,
      sources: bookResults.map(r => ({ type: 'book', title: r.title, content: r.content.slice(0, 200) })),
      hasBooks: true,
      sourceLabel: `📖 "${bookResults[0].title}"`,
    };
  }
  return { context: '', sources: [], hasBooks: false, sourceLabel: null };
};

const AiAnswerer = {
  solveQuestion: async (questionData) => {
    const { question_text, option_a, option_b, option_c, option_d, learning_mode } = questionData;
    const isMultipleChoice = !!(option_a || option_b || option_c || option_d);

    const optionsList = isMultipleChoice
      ? [
          { label: 'A', text: option_a || '' },
          { label: 'B', text: option_b || '' },
          { label: 'C', text: option_c || '' },
          { label: 'D', text: option_d || '' },
        ].filter(o => o.text)
      : [];

    const optionsText = isMultipleChoice
      ? `\nOptions:\n${optionsList.map(o => `${o.label}. ${o.text}`).join('\n')}`
      : '';

    const bookCtx = await buildContextFromBooks(question_text);

    const contextSection = bookCtx.hasBooks
      ? `PRIMARY REFERENCE (from the uploaded book "${bookCtx.sources[0].title}"):\n---\n${bookCtx.context}\n---`
      : '';

    const libraryContent = await loadLibrary();
    const fallbackSection = libraryContent && !bookCtx.hasBooks
      ? `LIBRARY REFERENCE:\n---\n${libraryContent}\n---`
      : '';

    const sourceType = bookCtx.hasBooks
      ? `📖 Book: "${bookCtx.sources[0].title}"`
      : libraryContent
        ? '📚 Library Knowledge Base'
        : '🧠 General Knowledge (not from uploaded book)';

    const isFromBook = bookCtx.hasBooks;

    const rulesBlock = isFromBook
      ? `STRICT RULES:
1. The answer IS in the uploaded book. Answer using ONLY the book content below.
2. Do NOT add information, examples, or explanations not in the book.
3. Quote or summarize the book directly. Do not embellish.
4. If the book only partially covers the question, answer only what the book provides.`
      : `STRICT RULES:
1. The answer is NOT in the uploaded book.
2. Your first sentence MUST be: "The answer was not found in the uploaded book."
3. Then search the reference material below. If found there, answer from it.
4. If using another source, clearly say "This answer comes from [source]."
5. If no source has the answer, say: "I don't have enough information to answer this question."
6. Never guess or invent information.`;

    const systemPrompt = `You are a precise AI assistant that answers questions using the uploaded book.

${rulesBlock}

RESPONSE FORMAT: Return valid JSON only, no markdown wrapping.`;

    const userPrompt = `${contextSection}
${fallbackSection}

${!isFromBook ? '\nNOTE: The answer was not found in uploaded books.' : ''}

Question: ${question_text}${optionsText}

${isMultipleChoice ? 'For multiple choice: indicate the correct option and explain using ONLY the book content if available.' : ''}

Respond in this exact JSON format (no markdown, no code blocks):
{
  "answer": "${isMultipleChoice ? 'A' : 'the answer text'}",
  "topic": "The specific topic",
  "explanation": "${isFromBook ? 'Explanation using ONLY the book content. Quote or summarize directly from the book.' : 'If not in book, start with: The answer was not found in the uploaded book. Then answer from other sources if available.'}",
  "option_analysis": ${isMultipleChoice
    ? `{
${optionsList.map(o => `    "${o.label.toLowerCase()}": {"is_correct": false, "reason": "Whether this option is correct or incorrect based on the book"}`,).join(',\n')}
  }`
    : 'null'},
  "rule_reference": "${isFromBook ? 'Cite the specific book section used' : 'The answer was not found in the uploaded book'}",
  "practical_example": "${isFromBook ? 'Only if the book provides one' : 'Not available in the uploaded book'}",
  "safety_tip": "${isFromBook ? 'Only if the book mentions safety tips' : 'Not available in the uploaded book'}",
  "practice_question": "${isFromBook ? 'A question based only on the book content' : 'Not available'}",
  "key_points": ["${isFromBook ? 'Key point from book' : 'No book content found'}"]
}`;

    const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
    const response = await callWithRetry([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], model);

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response from AI');

    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      ...parsed,
      sources: bookCtx.sources,
    };
  },

  answerQuestions: async (questions) => {
    if (!questions || questions.length === 0) return [];

    const libraryContent = await loadLibrary();

    const questionsJson = questions.map((q, i) => ({
      index: i,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    }));

    const bookCtx = await buildContextFromBooks(questions.map(q => q.question_text).join(' '));

    const contextSection = bookCtx.hasBooks
      ? `PRIMARY REFERENCE (from book "${bookCtx.sources[0].title}"):\n---\n${bookCtx.context}\n---`
      : '';

    const fallbackSection = libraryContent && !bookCtx.hasBooks
      ? `LIBRARY REFERENCE:\n---\n${libraryContent}\n---`
      : '';

    const isFromBook = bookCtx.hasBooks;

    const rulesText = isFromBook
      ? 'The answer IS in the uploaded book. Answer using ONLY book content. Do not add information not in the book.'
      : 'The answer is NOT in the uploaded book. Start each answer with: "The answer was not found in the uploaded book." Then use other sources if available. Never guess.';

    const prompt = `You are a precise AI assistant that answers questions using the uploaded book.

${rulesText}

${contextSection}
${fallbackSection}

For each question:
1. If the book has the answer, use ONLY the book.
2. If the book does not have the answer, start with "The answer was not found in the uploaded book."
3. Never invent or guess.

Respond ONLY with a valid JSON array:
[
  {
    "index": 0,
    "answer": "B",
    "topic": "Topic name",
    "explanation": "Explanation using only book content if available, otherwise starts with not-found message",
    "from_book": true
  }
]

Questions:
${JSON.stringify(questionsJson, null, 2)}`;

    const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
    const response = await callWithRetry([{ role: 'user', content: prompt }], model);

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response from AI');

    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    return parsed.map(item => ({
      ...item,
      from_book: bookCtx.hasBooks,
      source: bookCtx.hasBooks ? bookCtx.sources[0]?.title : 'Not found in uploaded book',
    }));
  },
};

module.exports = AiAnswerer;