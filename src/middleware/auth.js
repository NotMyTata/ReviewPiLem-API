import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export async function authenticateToken(req, res, next) {
  const token = req.headers['authorization'].split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token' });
  }

  jwt.verify(token, config.jwt_secret_key, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    req.user = decoded;
    next();
  });
}