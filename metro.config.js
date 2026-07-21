// AgroLease - custom Metro config.
//
// Adds a dev-server-only middleware that proxies /health and /v1/*
// requests through to the local Fastify backend (see /backend,
// running on BACKEND_PORT / 4055 by default).
//
// Why this exists: in GitHub Codespaces, Metro's own dev server
// (port 8081) is already reachable via a public *.app.github.dev
// forwarded URL, but the backend's own port (4055) requires a SEPARATE
// forwarded port to be manually set to Public in the Ports panel -
// a step that's easy to forget after every Codespace restart (see
// HANDOFF.md) and, when missed, produces a confusing CORS/ERR_FAILED
// error in the browser that looks like an app bug rather than a
// networking/visibility setting. Proxying backend requests through the
// SAME already-public port Metro itself uses removes that manual step
// entirely for local/Codespaces development - only one port ever needs
// to be public.
//
// This only affects `expo start --web` (Metro's own HTTP server).
// Native iOS/Android builds don't go through Metro's server at
// request time in production and are unaffected - EXPO_PUBLIC_API_BASE_URL
// still points directly at the backend's own forwarded URL for them.
const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

const config = getDefaultConfig(__dirname);

const BACKEND_PORT = process.env.BACKEND_PORT || 4055;
const BACKEND_HOST = '127.0.0.1';
const PROXIED_PATH_PREFIXES = ['/v1/', '/health'];

function shouldProxy(url) {
  if (!url) return false;
  return PROXIED_PATH_PREFIXES.some((prefix) => url === prefix || url.startsWith(prefix));
}

const originalEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  const withOriginal = originalEnhanceMiddleware
    ? originalEnhanceMiddleware(metroMiddleware, metroServer)
    : metroMiddleware;

  return (req, res, next) => {
    if (shouldProxy(req.url)) {
      const proxyReq = http.request(
        {
          host: BACKEND_HOST,
          port: BACKEND_PORT,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        }
      );

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            error: {
              code: 'backend_unreachable',
              message: `Could not reach the backend on ${BACKEND_HOST}:${BACKEND_PORT}. Is it running? (${err.message})`,
            },
          })
        );
      });

      req.pipe(proxyReq, { end: true });
      return;
    }

    return withOriginal(req, res, next);
  };
};

module.exports = config;
