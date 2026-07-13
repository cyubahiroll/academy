const AiChat = require('../models/AiChat');

const userTimers = new Map();

exports.ask = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(400).json({ message: 'AI_API_KEY not set in .env. Get a free key at https://console.groq.com' });
    }

    const now = Date.now();
    const last = userTimers.get(req.user.id) || 0;
    if (now - last < 3000) {
      return res.status(429).json({
        message: `Please wait ${Math.ceil((3000 - (now - last)) / 1000)}s before sending another message.`
      });
    }
    userTimers.set(req.user.id, now);
    if (userTimers.size > 1000) {
      const firstKey = userTimers.keys().next().value;
      userTimers.delete(firstKey);
    }

    const history = await AiChat.getHistory(req.user.id);
    const result = await AiChat.ask(req.user.id, message.trim(), history);

    res.json({ reply: result.reply, sources: result.sources });
  } catch (error) {
    console.error('[AIChat] Error:', error.message, error.code || error.status || '');

    const errorCode = error.code || error.error?.code || '';
    const errorStatus = error.status || error.statusCode;

    if (errorCode === 'insufficient_quota') {
      return res.status(429).json({ message: 'AI API daily quota exceeded. The free plan has daily limits. Try again tomorrow or upgrade at https://console.groq.com' });
    }
    if (errorCode === 'rate_limit_exceeded' || errorStatus === 429) {
      return res.status(429).json({ message: 'AI service is busy due to high demand. Please wait a moment and try again.' });
    }
    if (error.message?.includes('API key') || error.message?.includes('auth') || errorCode?.includes('auth') || errorCode === 'invalid_api_key' || errorStatus === 401 || errorStatus === 403) {
      return res.status(401).json({ message: 'Invalid AI API key. Check your AI_API_KEY in .env' });
    }
    if (errorStatus === 413 || error.message?.includes('too large') || error.message?.includes('Requested') || errorCode === 'context_length_exceeded') {
      return res.status(413).json({ message: 'Library content is too large for the free AI plan. Ask the admin to reduce the document size.' });
    }
    if (errorStatus === 404 || error.message?.includes('model') || error.message?.includes('not found')) {
      return res.status(503).json({ message: 'AI model is currently unavailable. Please try again later.' });
    }
    if (errorStatus >= 500 || errorCode?.includes('server') || error.message?.includes('fetch')) {
      return res.status(503).json({ message: 'AI service is temporarily unavailable. Please try again in a moment.' });
    }
    return res.status(500).json({ message: 'Failed to get AI response. Please try again.' });
  }
};

exports.history = async (req, res, next) => {
  try {
    const history = await AiChat.getHistory(req.user.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};
