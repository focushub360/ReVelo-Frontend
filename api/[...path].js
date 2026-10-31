import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const hopByHopHeaders = new Set([
  'connection',
  'content-length',
  'content-encoding',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function sendError(res, status, message) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: { message } }));
}

export default async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error('API proxy is unavailable: BACKEND_URL is not configured');
    sendError(res, 503, 'API server is not configured');
    return;
  }

  let backend;
  try {
    backend = new URL(backendUrl);
  } catch (error) {
    console.error('API proxy has an invalid BACKEND_URL', error);
    sendError(res, 500, 'API server configuration is invalid');
    return;
  }

  if (!['http:', 'https:'].includes(backend.protocol) || backend.username || backend.password) {
    console.error('API proxy has an invalid BACKEND_URL protocol or credentials');
    sendError(res, 500, 'API server configuration is invalid');
    return;
  }

  const requestUrl = new URL(req.url, 'http://vercel.local');
  const target = new URL(`${requestUrl.pathname}${requestUrl.search}`, backend);
  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers)) {
    if (name === 'host' || hopByHopHeaders.has(name.toLowerCase())) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value) {
      headers.set(name, value);
    }
  }

  const options = { method: req.method, headers, redirect: 'manual' };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    options.body = req;
    options.duplex = 'half';
  }

  try {
    const response = await fetch(target, options);
    res.statusCode = response.status;

    response.headers.forEach((value, name) => {
      if (!hopByHopHeaders.has(name.toLowerCase()) && name.toLowerCase() !== 'set-cookie') {
        res.setHeader(name, value);
      }
    });

    const cookies = response.headers.getSetCookie?.();
    if (cookies?.length) {
      res.setHeader('set-cookie', cookies);
    } else {
      const cookie = response.headers.get('set-cookie');
      if (cookie) res.setHeader('set-cookie', cookie);
    }

    if (response.body) {
      await pipeline(Readable.fromWeb(response.body), res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('API proxy request failed', error);
    if (res.headersSent) {
      res.destroy(error);
      return;
    }
    sendError(res, 502, 'Unable to reach API server');
  }
}
