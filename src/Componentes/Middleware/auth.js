// middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verifica que el usuario existe y está activo
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE id_usuarios = ? AND Estado = "Activo"', [decoded.id]);
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo.' });
    }
    req.user = usuarios[0]; // Adjunta usuario al req
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ error: 'Token inválido.' });
  }
};

module.exports = { authenticateToken };