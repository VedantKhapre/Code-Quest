import jwt from 'jsonwebtoken';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-this';

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} The decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Create a JWT token for a user
 * @param {Object} user - The user object to encode in the token
 * @param {string} expiresIn - Token expiration time (e.g., '7d')
 * @returns {string} The JWT token
 */
export function createToken(user, expiresIn = '7d') {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Get user ID from token
 * @param {string} token - The JWT token
 * @returns {string|null} The user ID or null if invalid
 */
export function getUserIdFromToken(token) {
  const decoded = verifyToken(token);
  return decoded?.id || null;
}