export function requestId(req, res, next) {
  const header = req.headers['x-request-id'];
  const id = header && String(header).trim() ? String(header).trim() : gen();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

function gen() {
  try {
    const { randomUUID } = require('node:crypto');
    if (typeof randomUUID === 'function') return randomUUID();
  } catch {}
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
