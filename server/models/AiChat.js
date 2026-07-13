const db = require('../config/db');
const OpenAI = require('openai');
const { retrieve, buildSystemPrompt } = require('../services/ragService');
const { searchDocuments } = require('../services/documentSearch');

const MODELS = [
  process.env.AI_MODEL || 'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

const LEARNING_INTENTS = [
  { patterns: ['explain', 'what is', 'what does', 'how does', 'tell me about', 'describe', 'sobanura', 'ni iki', 'uko', 'ubitire', 'fotora', 'mu magambo'], mode: 'explain' },
  { patterns: ['why is', 'why does', 'why can', 'reason', 'explain why', 'kubera iki', 'kubera', 'ibisobanuro'], mode: 'why' },
  { patterns: ['example', 'scenario', 'give me', 'instance', 'show me', 'ingero', 'urugero', 'ereka', 'jya mu'], mode: 'example' },
  { patterns: ['test me', 'quiz me', 'practice', 'ask me', 'examine', 'gerageza', 'mbwira', 'ibarura', 'itezimbere'], mode: 'test_me' },
  { patterns: ['summarize', 'summary', 'overview', 'recap', 'brief', 'shakisha', 'incamake', 'igiciro', 'igisobanuro'], mode: 'summarize' },
  { patterns: ['step by step', 'teach me', 'learn', 'beginner', 'start from', 'jya mu', 'njya mu', 'mbareke', 'ntangire', 'inama'], mode: 'teach_step_by_step' },
  { patterns: ['compare', 'difference', 'vs ', 'versus', 'differentiate', 'gereranya', 'ubwiyunge', 'icumitso'], mode: 'compare' },
];

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || undefined,
  timeout: 30000,
  maxRetries: 0,
});

const responseCache = new Map();

const detectLearningMode = (message) => {
  const lower = message.toLowerCase();
  for (const intent of LEARNING_INTENTS) {
    for (const pattern of intent.patterns) {
      if (lower.startsWith(pattern) || lower.includes(' ' + pattern)) {
        return intent.mode;
      }
    }
  }

  if (lower.startsWith('why') || lower === 'why' || lower.startsWith('how') ||
      lower.startsWith('explain more') || lower.startsWith('tell me more') ||
      lower.startsWith('kubera') || lower.startsWith('kubera iki') ||
      lower.startsWith('ukubura') || lower.startsWith('sobanura') ||
      lower.startsWith('njya') || lower.startsWith('mbareke')) {
    return 'follow_up';
  }

  return 'general';
};

const buildTeachingSystemPrompt = (retrieved, learningMode) => {
  const hasBook = retrieved.hasLibrary;
  const hasInternet = retrieved.hasInternet;
  const hasDatabase = retrieved.hasDatabase;
  const isFallback = retrieved.usedFallback;

  const ctx = retrieved.context || '';
  const ctxSection = ctx ? `\nIBITANGAZWA BIDOFORWE:\n---\n${ctx.slice(0, 5000)}\n---` : '';

  const rules = [];

  if (hasBook) {
    rules.push(
      "ITEGEKO 1: Igitabo cyanditswe kirimo amakuru ajyanye n'ibyo ubona. Subiza ukoresheje amakuru y'iki gitabo gusa.",
      'ITEGEKO 2: NTUKONGERE amakuru, ingero cyangwa ibisobanuro SIBYO mu gitabo.',
      'ITEGEKO 3: Soma cyangwa ufashe mu gitabo. Zana cyangwa ufashe mu gitabo gusa.',
      'ITEGEKO 4: Niba gitabo gihera aho kubaza, subiza ibyo gitabo kirimo gusa.'
    );
  } else {
    rules.push(
      'ITEGEKO 1: Igitabo cyanditswe NTIRIMO igisubizo.',
      'ITEGEKO 2: Utangire ukuri: "Igisubizo ntago cyabonetse mu gitabo cyanditswe."',
      'ITEGEKO 3: Hanyuma uje mu buryo bw\'internet hejuru. Niba buriho, subiza ukoresheje kandi ukubwire: "Igisubizo kiri mu buryo bw\'internet."',
      'ITEGEKO 4: Niba n\'uburyo bw\'internet ntabwo buhari, ubwire: "Sindafise amakuru ahagije kugira ngo ngubwire."',
      'ITEGEKO 5: Usibange cyangwa ukongere amakuru.'
    );
  }

  if (isFallback && !hasBook && !hasInternet && !hasDatabase) {
    rules.push(
      'IGITEGEKO CUMI: Nta buryo bwizewe buhari. Subiza: "Sindafise amakuru ahagije kugira ngo ngubwire." NTUKONGERE.'
    );
  }

  const rulesText = rules.map(r => `  ${r}`).join('\n');

  const modeInstructions = {
    explain: `Umukiriya yifuje ko musobanurira. Kurikiza ibyemezo biri hejuru neza.`,
    why: `Umukiriya abaza "kubera iki". Niba impamvu iri mu gitabo, musobanurire. Niba ariyo, kurikiza itegeko 1.`,
    example: `Umukiriya yifuje urugero. Muha urugero urwo rwo riri mu gitabo. Ntabwo aribyo, kurikiza ibyemezo biri hejuru.`,
    test_me: `Umukiriya yifuje kwigererwa. Utange ikibazo gusa mu gitabo.`,
    summarize: `Fashe igisobanuro gusa mu gitabo. Ntongere ikindi.`,
    teach_step_by_step: `Menyesha inshenga mu inshenga ukoresheje amakuru ari mu gitabo gusa.`,
    compare: `Gereranya amakuru GUSA ukoresheje ibiri mu gitabo.`,
    follow_up: `Umukiriya abaza ikibazo c'inyuma. Nyongera niba gitabo kirimo ibisobanuro by'inyongera.`,
    general: `Subiza ukoresheje amakuru ari mu gitabo gusa. Niba atari mu gitabo, kurikiza ibyemezo.`,
  };

  const instruction = modeInstructions[learningMode] || modeInstructions.general;

  return `Uri umufasha wa AI ubwere bwawe mu Kinyarwanda utanga ibisubizo bifite ukuri kandi buhitamo. Ntongera amakuru SIBYO ari mu gitabo cyanditswe.

UBURYO BW'AMATEGEKO Y'INGENDO:
${rulesText}

${instruction}

IBYAPA BIHEBURWA:
- Igitegerero cy'ibyapa: 50 km/h mu baturage, 80 km/h ku mihanda mike, 100 km/h ku mihanda y'ibihumbi.
- Igihe cy'igererwa: Igihe ukwiye gushyira ingendo ntarengwa (byose biri mu gitabo cyanditswe).
- Ibibazo by'umutekano: Amategeko y'ubuhungiro, amategeko y'umutekano, amategeko y'ibyapa.
- Ibyerekeranye na A1, A2, B1, B2, C1, C2, D1, D2: Ibijyanye n'uburyo bw'ingendo.
- Amategeko y'uburumuna n'amategeko y'uburumuna bw'ibinyabiziga.

${ctxSection}

UBWIKOREZE:
- Utangire mu buryo bworoshye kandi ujye ukurikiza inshenga.
- Koresha ibisobanuro bisobanutse kandi biroroshye.
- Niba ikibazo kiragoye, kirimo amakuru menshi, ufashe mu gitabo gusa.
- Mu buryo bwose, injira mu buryo bw'umukoresha.
- Ibisubizo by'ibibazo by'ibinyabiziga biri mu buryo bworoshye kandi bworoshye.
- Nta magambo y'agaciro mu gitabo usibye ubuzima bw'ingendo.`;
};

const callWithFallback = async (messages, maxAttempts = 5) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const modelIndex = Math.min(Math.floor((attempt - 1) / 2), MODELS.length - 1);
    const model = MODELS[modelIndex];

    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 3072,
      });

      const reply = response.choices[0]?.message?.content?.trim();
      if (!reply) throw new Error('Empty response from AI');

      return { reply, model };
    } catch (error) {
      lastError = error;
      const isRateLimit = error.status === 429;
      const isServerError = error.status >= 500;
      const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout');
      const isModelError = error.status === 400 || error.status === 404 || error.message?.includes('model');

      if (isModelError && attempt < maxAttempts) {
        console.log(`[AiChat] Model ${model} unavailable (${error.status || error.message}), trying next model`);
        continue;
      }

      if (isRateLimit && attempt < maxAttempts) {
        const delay = Math.min(15000 + attempt * 5000, 60000);
        console.log(`[AiChat] Rate limited on ${model}, attempt ${attempt}/${maxAttempts}, waiting ${Math.round(delay / 1000)}s`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if ((isServerError || isTimeout) && attempt < maxAttempts) {
        const delay = attempt * 4000;
        console.log(`[AiChat] ${error.status || error.code} on ${model}, attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (!isRateLimit && !isServerError && !isTimeout && !isModelError) {
        throw error;
      }
    }
  }

  throw lastError || new Error('AI request failed after all retries');
};

const AiChat = {
  ask: async (userId, message, history = []) => {
    const cacheKey = `${userId}:${message.toLowerCase().trim()}`;

    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      try {
        await db.query(
          `INSERT INTO ai_chat_messages (user_id, role, message) VALUES ?`,
          [[[userId, 'user', message], [userId, 'assistant', cached.reply]]]
        );
      } catch (_) {}
      return { reply: cached.reply, sources: cached.sources };
    }

    const learningMode = detectLearningMode(message);
    const retrieved = await retrieve(message);

    const maxContext = parseInt(process.env.AI_CHAT_MAX_CONTEXT) || 10;
    const recentHistory = history.slice(-maxContext * 2);

    let contextText = retrieved.context || '';
    if (contextText.length > 5000) {
      contextText = contextText.slice(0, 5000);
    }

    const systemPrompt = buildTeachingSystemPrompt({
      ...retrieved,
      context: contextText,
    }, learningMode);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(m => ({
        role: m.role,
        content: m.message.slice(0, 800),
      })),
      { role: 'user', content: message },
    ];

    const { reply } = await callWithFallback(messages);

    try {
      await db.query(
        `INSERT INTO ai_chat_messages (user_id, role, message) VALUES ?`,
        [[[userId, 'user', message], [userId, 'assistant', reply]]]
      );
    } catch (_) {}

    const result = { reply, sources: retrieved.sources };
    responseCache.set(cacheKey, result);
    if (responseCache.size > 200) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }

    return result;
  },

  getHistory: async (userId, limit = 50) => {
    try {
      const [rows] = await db.query(
        `SELECT id, role, message, created_at FROM ai_chat_messages
         WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, limit]
      );
      return rows.reverse();
    } catch (_) {
      return [];
    }
  },
};

module.exports = AiChat;