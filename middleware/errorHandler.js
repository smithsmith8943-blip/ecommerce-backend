// Wraps async controllers so errors reach the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  if (err.name === "ValidationError" || err.name === "CastError") status = 400;
  if (err.code === 11000) status = 409;
  res.status(status).json({ message: err.message });
};

module.exports = { asyncHandler, errorHandler };