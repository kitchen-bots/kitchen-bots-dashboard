export interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Attempt to serve the static asset from ASSETS binding
    const response = await env.ASSETS.fetch(request);

    // If the asset was found (status < 400), return it directly with its proper headers
    if (response.status < 400) {
      return response;
    }

    // 2. If it was a request for a static asset or file (e.g. /assets/* or has an extension), do NOT fallback to index.html; return 404
    if (pathname.startsWith('/assets/') || (pathname.includes('.') && !pathname.endsWith('.html'))) {
      return new Response('Asset not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    // 3. For SPA navigation routes (e.g. /, /admin, /orders, /leads, etc.), serve index.html
    const indexUrl = new URL('/index.html', request.url);
    const indexResponse = await env.ASSETS.fetch(indexUrl.toString());
    return indexResponse;
  },
};
