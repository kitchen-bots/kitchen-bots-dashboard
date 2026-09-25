import { describe, it, expect, vi } from 'vitest';
import worker from '../src/server';

describe('Dashboard Static Asset and SPA Fallback Server', () => {
  it('serves existing static assets with original response', async () => {
    const mockEnv = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(
          new Response('console.log("react");', {
            status: 200,
            headers: { 'Content-Type': 'application/javascript' },
          })
        ),
      },
    };

    const request = new Request('https://kitchen-bots-dashboard.workofcharan.workers.dev/assets/react-cILwxgxP.js');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/javascript');
    expect(await response.text()).toBe('console.log("react");');
  });

  it('returns 404 for missing assets under /assets/', async () => {
    const mockEnv = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(new Response('Not Found', { status: 404 })),
      },
    };

    const request = new Request('https://kitchen-bots-dashboard.workofcharan.workers.dev/assets/AdminDashboard-Missing.js');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Asset not found');
  });

  it('returns 404 for missing static files with extensions', async () => {
    const mockEnv = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(new Response('Not Found', { status: 404 })),
      },
    };

    const request = new Request('https://kitchen-bots-dashboard.workofcharan.workers.dev/favicon-missing.ico');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Asset not found');
  });

  it('serves index.html for SPA navigation routes when no asset matches', async () => {
    const mockEnv = {
      ASSETS: {
        fetch: vi.fn().mockImplementation((req: Request | string) => {
          const targetUrl = typeof req === 'string' ? req : req.url;
          const url = new URL(targetUrl);
          if (url.pathname === '/index.html') {
            return Promise.resolve(
              new Response('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
              })
            );
          }
          return Promise.resolve(new Response('Not Found', { status: 404 }));
        }),
      },
    };

    const routes = ['/', '/admin', '/orders', '/leads', '/dashboard', '/quotes'];
    for (const route of routes) {
      const request = new Request(`https://kitchen-bots-dashboard.workofcharan.workers.dev${route}`);
      const response = await worker.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/html');
      expect(await response.text()).toContain('<div id="root"></div>');
    }
  });
});
