const GAS_URL = 'https://script.google.com/macros/s/AKfycbw9KXLf1J8LIJ5fAYFITe3Lwb5Vd90KikTTn82_YIpSFYyReAZhHOffCkYT3wd8KLEr/exec';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Hanya intercept path /api — request lain dilayani Cloudflare Pages (file statis)
    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request);
    }

    // Handle preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      // Teruskan request ke GAS
      const gasResponse = await fetch(GAS_URL + (url.search || ''), {
        method: request.method,
        headers: { 'Content-Type': 'text/plain' },
        body: request.method !== 'GET' ? await request.text() : undefined,
        redirect: 'follow',
      });

      const responseText = await gasResponse.text();

      return new Response(responseText, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ status: 'error', message: err.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  }
};
