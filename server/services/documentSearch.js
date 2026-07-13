const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const pdfParse = require('pdf-parse');

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'can', 'could', 'shall', 'should', 'may', 'might', 'must',
  'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their', 'them',
  'this', 'that', 'these', 'those', 'he', 'she', 'his', 'her', 'him',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very',
  'just', 'about', 'above', 'after', 'again', 'all', 'also', 'any',
  'because', 'before', 'between', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'only', 'own', 'same', 'here',
  'there', 'when', 'where', 'why', 'how', 'which', 'who', 'whom',
  'what', 'while', 'during', 'through', 'up', 'down', 'out', 'off',
  'over', 'under', 'into', 'onto', 'upon', 'than', 'into', 'along',
]);

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

const tokenize = (text) => {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
};

const chunkOnSentences = (text, title, maxWords = 200, overlap = 40) => {
  const sentenceEnd = /(?<=[.!?])\s+/g;
  const sentences = text.split(sentenceEnd).filter(s => s.trim());

  const chunks = [];
  let current = [];
  let currentLen = 0;

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).length;
    if (currentLen + wordCount > maxWords && current.length > 0) {
      const chunkText = current.join(' ').trim();
      if (chunkText) {
        chunks.push({ title, text: chunkText, index: chunks.length });
      }
      const overlapWords = current.slice(-Math.floor(overlap / 5)).join(' ');
      current = overlapWords ? [overlapWords] : [];
      currentLen = overlapWords ? overlapWords.split(/\s+/).length : 0;
    }
    current.push(sentence);
    currentLen += wordCount;
  }

  if (current.length > 0) {
    const chunkText = current.join(' ').trim();
    if (chunkText) {
      chunks.push({ title, text: chunkText, index: chunks.length });
    }
  }

  return chunks;
};

// ---- Fast Search Index (Inverted Index + TF-IDF) ----
let searchIndex = null;
let indexCacheTime = 0;
let allChunksCache = null;
let chunkCacheTime = 0;

const buildInvertedIndex = (chunks) => {
  const index = new Map();
  const docCount = chunks.length;

  for (let i = 0; i < chunks.length; i++) {
    const tokens = tokenize(chunks[i].text);
    const seen = new Set();

    for (const token of tokens) {
      if (!index.has(token)) {
        index.set(token, new Map());
      }
      const postings = index.get(token);
      if (!seen.has(i)) {
        seen.add(i);
        postings.set(i, (postings.get(i) || 0) + 1);
      }
    }
  }

  return { index, docCount };
};

const computeTfIdf = (query, chunks, index, docCount) => {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const scores = new Array(chunks.length).fill(0);

  for (const token of qTokens) {
    const postings = index.get(token);
    if (!postings) continue;

    const df = postings.size;
    const idf = Math.log(1 + (docCount - df + 0.5) / (df + 0.5));

    for (const [docId, tf] of postings) {
      const chunkTokens = tokenize(chunks[docId].text);
      const normalizedTf = tf / (chunkTokens.length || 1);
      scores[docId] += normalizedTf * idf;
    }
  }

  return scores;
};

const loadChunks = async () => {
  const now = Date.now();
  if (allChunksCache && (now - chunkCacheTime) < 60000) return allChunksCache;

  const [rows] = await db.query('SELECT id, title, file_url, file_type FROM documents ORDER BY id');
  const allChunks = [];

  for (const doc of rows) {
    try {
      const text = await extractFileText(doc);
      if (text && text.trim()) {
        const chunks = chunkOnSentences(text, doc.title);
        allChunks.push(...chunks.map(c => ({ ...c, docId: doc.id })));
      }
    } catch (e) {
      console.error(`[DocSearch] Failed to extract ${doc.title}:`, e.message);
    }
  }

  allChunksCache = allChunks;
  chunkCacheTime = Date.now();

  // Build index
  searchIndex = buildInvertedIndex(allChunks);
  indexCacheTime = Date.now();

  console.log(`[DocSearch] Index built: ${allChunks.length} chunks, ${searchIndex.index.size} unique terms`);
  return allChunks;
};

const ensureIndex = async () => {
  const now = Date.now();
  if (searchIndex && allChunksCache && (now - indexCacheTime) < 120000) return { chunks: allChunksCache, index: searchIndex };

  const chunks = await loadChunks();
  return { chunks, index: searchIndex };
};

const scoreRelevance = (query, text) => {
  const qWords = tokenize(query);
  const tWords = tokenize(text);

  if (qWords.length === 0 || tWords.length === 0) return 0;

  let score = 0;

  const qSet = new Set(qWords);
  const tSet = new Set(tWords);
  const intersection = [...qSet].filter(w => tSet.has(w));
  score += intersection.length * 5;

  for (const word of qWords) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.toLowerCase().match(regex);
    if (matches) score += matches.length * 1;
  }

  if (text.toLowerCase().includes(query.toLowerCase())) {
    score += 15;
  }

  return score;
};

const searchDocuments = async (query, topK = 5) => {
  if (!query || !query.trim()) return [];

  const { chunks, index } = await ensureIndex();
  if (chunks.length === 0) return [];

  let scored;

  if (index && index.index && index.index.size > 0) {
    const tfidfScores = computeTfIdf(query, chunks, index.index, index.docCount);
    const keywordScores = chunks.map(c => scoreRelevance(query, c.text));

    scored = chunks.map((c, i) => ({
      ...c,
      score: tfidfScores[i] * 2 + keywordScores[i] * 0.5,
    }));
  } else {
    scored = chunks.map(c => ({
      ...c,
      score: scoreRelevance(query, c.text),
    }));
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.filter(c => c.score > 0.01).slice(0, topK);

  return results.map(r => ({
    source: 'book',
    title: r.title,
    content: r.text.slice(0, 1000),
    relevance: Math.round(r.score * 100) / 100,
    docId: r.docId,
  }));
};

const searchDocumentsByTopic = async (topic, topK = 3) => {
  if (!topic || !topic.trim()) return [];
  return searchDocuments(topic, topK);
};

const getDocumentById = async (docId) => {
  const { chunks } = await ensureIndex();
  return chunks.filter(c => c.docId === docId) || null;
};

module.exports = { searchDocuments, searchDocumentsByTopic, getDocumentById, loadChunks };
