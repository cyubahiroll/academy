const axios = require('axios');

const SEARCH_URL = process.env.SEARCH_URL || 'https://www.googleapis.com/customsearch/v1/siterestrict';

const searchInternet = async (query, topK = 2) => {
  if (!query || !query.trim()) return [];

  const apiKey = process.env.SEARCH_API_KEY;
  const engineId = process.env.SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    return [];
  }

  try {
    const { data } = await axios.get(SEARCH_URL,
      {
        params: {
          key: apiKey,
          cx: engineId,
          q: query + ' road traffic rules',
          num: topK,
          lr: 'lang_en',
        },
        timeout: 8000,
      }
    );

    if (!data.items || data.items.length === 0) return [];

    return data.items.map((item, i) => ({
      source: 'internet',
      title: item.title || 'Search result',
      content: item.snippet || '',
      url: item.link || '',
      relevance: topK - i,
    }));
  } catch (e) {
    if (e.response?.status === 403) {
      console.error('[InternetSearch] API quota exceeded or invalid key');
    } else {
      console.error('[InternetSearch] Error:', e.message);
    }
    return [];
  }
};

module.exports = { searchInternet };
