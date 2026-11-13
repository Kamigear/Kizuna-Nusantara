export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/geo') {
      const country = String(request.cf?.country ?? '');
      return new Response(JSON.stringify({ country }), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
