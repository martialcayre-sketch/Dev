export function validatePagination(req, res, next) {
  const { limit = '50', offset = '0' } = req.query;
  const limitNum = parseInt(String(limit), 10);
  const offsetNum = parseInt(String(offset), 10);
  if (Number.isNaN(limitNum) || Number.isNaN(offsetNum) || limitNum < 0 || offsetNum < 0) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }
  if (limitNum > 100) return res.status(400).json({ error: 'Limit too large (max 100)' });
  req.pagination = { limit: limitNum, offset: offsetNum };
  next();
}
export function validateResponsesBody(req, res, next) {
  const { responses } = req.body || {};
  if (responses == null || typeof responses !== 'object' || Array.isArray(responses)) {
    return res.status(400).json({ error: 'Invalid responses payload (must be object)' });
  }
  const keys = Object.keys(responses);
  if (keys.length > 500)
    return res.status(400).json({ error: 'Too many response entries (max 500)' });
  next();
}
export function enforceImmutableFields(immutableKeys) {
  return function (req, res, next) {
    const body = req.body || {};
    for (const k of immutableKeys) {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        return res.status(400).json({ error: `Field ${k} is immutable` });
      }
    }
    next();
  };
}
