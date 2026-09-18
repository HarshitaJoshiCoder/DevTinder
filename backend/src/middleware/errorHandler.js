// Mongoose duplicate-key and validation errors get translated to clean 4xx
// responses; anything unexpected falls through as a 500 without leaking
// internals to the client.
function errorHandler(err, req, res, _next) {
  if (err.code === 11000) {
    return res.status(409).json({ message: 'That resource already exists.' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  console.error('[error]', err);
  return res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
}

module.exports = errorHandler;
