const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const TOKEN_EXPIRY = '30d';

function signToken() {
  return jwt.sign({ ok: true }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Belum login' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesi tidak valid, silakan login lagi' });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };
