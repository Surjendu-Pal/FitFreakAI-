module.exports = (error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }
  if (error.status === 503) {
    return res.status(503).json({ message: error.message });
  }
  console.error('API request failed:', error.name || 'Error');
  return res.status(500).json({ message: 'Server error' });
};
