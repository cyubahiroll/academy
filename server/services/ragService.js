const { searchDocuments } = require('./documentSearch');
const { searchDatabase } = require('./databaseSearch');
const { searchInternet } = require('./internetSearch');

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

const retrieve = async (query) => {
  const q = query.trim();
  if (!q) {
    return {
      context: '',
      sources: [],
      hasLibrary: false,
      hasDatabase: false,
      hasInternet: false,
      usedFallback: true,
    };
  }

  const withTimeout = (promise, ms) => Promise.race([promise, timeout(ms)]).catch(() => []);

  // Book search has highest priority and gets most time
  const [docResults, dbResults, webResults] = await Promise.all([
    withTimeout(searchDocuments(q, 5), 10000),
    withTimeout(searchDatabase(q, 3), 5000),
    withTimeout(searchInternet(q, 1), 5000),
  ]);

  const allResults = [...docResults, ...dbResults, ...webResults];

  if (allResults.length === 0) {
    return {
      context: '',
      sources: [],
      hasLibrary: false,
      hasDatabase: false,
      hasInternet: false,
      usedFallback: true,
    };
  }

  const bySource = { book: docResults, database: dbResults, internet: webResults };

  for (const src of Object.keys(bySource)) {
    if (bySource[src].length > 0) {
      const max = Math.max(...bySource[src].map(r => r.relevance));
      bySource[src] = bySource[src].map(r => ({
        ...r,
        relevance: max > 0 ? Math.round((r.relevance / max) * 100) : 0,
      }));
    }
  }

  let merged = Object.values(bySource).flat();
  merged.sort((a, b) => b.relevance - a.relevance);

  const seen = new Set();
  const unique = merged.filter(r => {
    const key = r.content.slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const topResults = unique.slice(0, 5);

  const contextText = topResults.map((r, i) => {
    const tag = r.source === 'book' ? '📖 Book' : r.source === 'database' ? '🗄️ Question Bank' : '🌐 Web';
    return `[Source ${i + 1}: ${tag} - ${r.title}]\n${r.content.slice(0, 600)}`;
  }).join('\n\n');

  const hasBooks = docResults.length > 0;

  return {
    context: contextText,
    sources: topResults.map(r => ({
      type: r.source,
      title: r.title,
      content: (r.content || '').slice(0, 200),
      url: r.url || null,
      relevance: r.relevance,
    })),
    hasLibrary: hasBooks,
    hasDatabase: dbResults.length > 0,
    hasInternet: webResults.length > 0,
    usedFallback: topResults.length === 0,
    sourcePriority: hasBooks ? 'book' : dbResults.length > 0 ? 'database' : webResults.length > 0 ? 'internet' : 'fallback',
  };
};

const buildSystemPrompt = (retrieved) => {
  const hasBook = retrieved.hasLibrary;
  const hasInternet = retrieved.hasInternet;
  const hasDatabase = retrieved.hasDatabase;
  const isFallback = retrieved.usedFallback;

  const ctx = retrieved.context || '';  
  const ctxSection = ctx ? `\nIBITANGAZWA BIDOFORWE:\n---\n${ctx.slice(0, 5000)}\n---` : '';

  const rules = [];

  if (hasBook) {
    rules.push(
      'ITEGEKO 1: Igitabo cyanditswe kirimo amakuru ajyanye n\'ibyo ubona.',
      'ITEGEKO 2: NI UKOHEREZO kugira ngo usubize ukoresheje amakuru y\'iki gitabo gusa.',
      'ITEGEKO 3: NTUKONGERE amakuru, ingero cyangwa ibisobanuro SIBYO mu gitabo.',
      'ITEGEKO 4: Niba amakuru ari mu gitabo, soma cyangwa ufashe mu gitabo. NTUKONGERE.',
      'ITEGEKO 5: Niba gitabo gihera aho kubaza, subiza ibyo gitabo kirimo gusa.'
    );
  } else {
    rules.push(
      'ITEGEKO 1: Igitabo cyanditswe NTIRIMO igisubizo.',
      'ITEGEKO 2: Igisubizo cyawe c\'umwanzuro NI UKOHEREZO: "Igisubizo ntago cyabonetse mu gitabo cyanditswe."',
      'ITEGEKO 3: Hanyuma uje mu buryo bw\'internet hejuru (niba buriho) kandi usubize.',
      'ITEGEKO 4: Niba ukoresha internet, NI UKOHEREZO ukubwire: "Igisubizo kiri mu buryo bw\'internet."',
      'ITEGEKO 5: Niba n\'uburyo bw\'internet ntabwo buhari, ubwire: "Sindafise amakuru ahagije kugira ngo ngubwire."',
      'ITEGEKO 6: Usibange cyangwa ukongere amakuru.'
    );
  }

  if (isFallback && !hasBook && !hasInternet && !hasDatabase) {
    rules.push(
      'IGITEGEKO CUMI: Nta buryo bwizewe buhari. Subiza: "Sindafise amakuru ahagije kugira ngo ngubwire."',
      'NTUKONGERE.'
    );
  }

  const rulesText = rules.map(r => `  ${r}`).join('\n');

  return `Uri umufasha wa AI ubwere bwawe mu Kinyarwanda utanga ibisubizo bifite ukuri kandi buhitamo. Ntongera amakuru SIBYO ari mu gitabo cyanditswe.

UBURYO BW\'AMATEGEKO:
${rulesText}

${ctxSection}

IBYAPA BIHEBURWA:
- Igitegerero cy\'ibyapa: 50 km/h mu baturage, 80 km/h ku mihanda mike, 100 km/h ku mihanda y\'ibihumbi.
- Igihe cy\'igererwa: Igihe ukwiye gushyira ingendo ntarengwa (byose biri mu gitabo cyanditswe).
- Ibibazo by\'umutekano: Amategeko y\'ubuhungiro, amategeko y\'umutekano, amategeko y\'ibyapa.
- Ibyerekeranye na A1, A2, B1, B2, C1, C2, D1, D2: Ibijyanye n\'uburyo bw\'ingendo.
- Amategeko y\'uburumuna n\'amategeko y\'uburumuna bw\'ibinyabiziga.

IBYONGEREYE:
- Utangire mu buryo bworoshye kandi ujye ukurikiza inshenga.
- Koresha ibisobanuro bisobanutse kandi biroroshye.
- Niba ikibazo kiragoye, ufashe mu gitabo gusa.
- Mu buryo bwose, injira mu buryo bw\'umukoresha.
- Ibisubizo by\'ibibazo by\'ibinyabiziga biri mu buryo bworoshye kandi bworoshye.
- Nta magambo y\'agaciro mu gitabo usibye ubuzima bw\'ingendo.`;
};

module.exports = { retrieve, buildSystemPrompt };