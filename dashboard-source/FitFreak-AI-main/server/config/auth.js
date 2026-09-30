function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    const error = new Error('Authentication is not configured. Set JWT_SECRET in the server environment.');
    error.status = 503;
    throw error;
  }
  return secret;
}

module.exports = { getJWTSecret };
