const AiQuestionGenerator = require('../models/AiQuestionGenerator');

exports.listDocuments = async (req, res, next) => {
  try {
    const docs = await AiQuestionGenerator.getDocuments();
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

exports.generate = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: 'documentId is required' });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(400).json({ message: 'AI_API_KEY not set in .env. Get a free key at https://console.groq.com' });
    }

    const text = await AiQuestionGenerator.extractText(documentId);

    if (!text || text.trim().length < 100) {
      return res.status(400).json({ message: 'Document content is too short to generate questions' });
    }

    const questions = await AiQuestionGenerator.generateQuestions(text, count);
    const ids = await AiQuestionGenerator.saveQuestions(questions, 'ai');

    res.json({
      message: `Generated and saved ${questions.length} questions`,
      questions: questions.map((q, i) => ({ ...q, id: ids[i] })),
    });
  } catch (error) {
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      if (error.message?.includes('tokens per day') || error.code === 'insufficient_quota') {
        return res.status(429).json({ message: 'AI API daily quota exceeded. Try again tomorrow or upgrade at https://console.groq.com' });
      }
      return res.status(429).json({ message: 'AI service is busy. Please try again in a moment.' });
    }
    if (error.message?.includes('API key') || error.message?.includes('auth') || error.code?.includes('auth') || error.code === 'invalid_api_key') {
      return res.status(401).json({ message: 'Invalid AI API key. Check your AI_API_KEY in .env' });
    }
    next(error);
  }
};

exports.preview = async (req, res, next) => {
  try {
    const { documentId, count = 5 } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: 'documentId is required' });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(400).json({ message: 'AI_API_KEY not set in .env' });
    }

    const text = await AiQuestionGenerator.extractText(documentId);

    if (!text || text.trim().length < 100) {
      return res.status(400).json({ message: 'Document content is too short to generate questions' });
    }

    const questions = await AiQuestionGenerator.generateQuestions(text, count);

    res.json({ questions });
  } catch (error) {
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      if (error.message?.includes('tokens per day') || error.code === 'insufficient_quota') {
        return res.status(429).json({ message: 'AI API daily quota exceeded. Try again tomorrow or upgrade at https://console.groq.com' });
      }
      return res.status(429).json({ message: 'AI service is busy. Please try again in a moment.' });
    }
    if (error.message?.includes('API key') || error.message?.includes('auth') || error.code?.includes('auth') || error.code === 'invalid_api_key') {
      return res.status(401).json({ message: 'Invalid AI API key. Check your AI_API_KEY in .env' });
    }
    next(error);
  }
};

exports.save = async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'questions array is required' });
    }

    const ids = await AiQuestionGenerator.saveQuestions(questions, 'ai');

    res.json({ message: `Saved ${ids.length} questions`, ids });
  } catch (error) {
    next(error);
  }
};
