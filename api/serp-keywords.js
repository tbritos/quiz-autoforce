const SERP_ENDPOINT = 'https://serpapi.com/search.json';

const normalizeKeyword = (value) =>
  (value || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ');

const uniqByKeyword = (rows) => {
  const seen = new Set();
  const output = [];
  for (const row of rows) {
    const key = row.keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(row);
  }
  return output;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Configure SERPAPI_KEY no ambiente.' });
  }

  const domain = (req.query.domain || '').toString().trim().toLowerCase();
  const country = (req.query.country || 'br').toString().trim().toLowerCase();
  const language = (req.query.hl || 'pt').toString().trim().toLowerCase();
  if (!domain) {
    return res.status(400).json({ error: 'Parametro domain e obrigatorio.' });
  }

  const brand = domain.split('.')[0].replace(/[-_]+/g, ' ').trim();

  const buildUrl = (params) => {
    const url = new URL(SERP_ENDPOINT);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
    url.searchParams.set('api_key', apiKey);
    return url.toString();
  };

  try {
    const googleUrl = buildUrl({
      engine: 'google',
      q: `site:${domain}`,
      hl: language,
      gl: country,
      num: 10,
    });

    const googleRes = await fetch(googleUrl, { headers: { Accept: 'application/json' } });
    const googleJson = await googleRes.json().catch(() => ({}));
    if (!googleRes.ok) {
      const message = googleJson?.error || `HTTP ${googleRes.status}`;
      return res.status(googleRes.status).json({ error: message });
    }

    const fromRelated = (googleJson?.related_searches || []).map((item, idx) => ({
      keyword: normalizeKeyword(item?.query),
      source: 'related_searches',
      position: idx + 1,
    }));

    const fromPeopleAlso = (googleJson?.people_also_search_for || []).map((item, idx) => ({
      keyword: normalizeKeyword(item?.query || item?.title),
      source: 'people_also_search_for',
      position: idx + 1,
    }));

    let keywords = uniqByKeyword(
      [...fromRelated, ...fromPeopleAlso].filter((row) => row.keyword)
    );

    if (keywords.length < 5 && brand) {
      const autocompleteUrl = buildUrl({
        engine: 'google_autocomplete',
        q: brand,
        hl: language,
        gl: country,
      });
      const autoRes = await fetch(autocompleteUrl, { headers: { Accept: 'application/json' } });
      const autoJson = await autoRes.json().catch(() => ({}));

      if (autoRes.ok) {
        const fromAutocomplete = (autoJson?.suggestions || []).map((item, idx) => ({
          keyword: normalizeKeyword(item?.value || item?.query),
          source: 'autocomplete',
          position: idx + 1,
        }));
        keywords = uniqByKeyword([...keywords, ...fromAutocomplete.filter((row) => row.keyword)]);
      }
    }

    return res.status(200).json({
      domain,
      provider: 'serpapi',
      keywords: keywords.slice(0, 20),
    });
  } catch (error) {
    const message = error?.message || 'Falha ao consultar SerpApi.';
    return res.status(500).json({ error: message });
  }
}

