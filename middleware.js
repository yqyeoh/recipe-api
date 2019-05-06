const boom = require('boom');
const jwt = require('jsonwebtoken');

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    if (!err.isBoom) {
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(boom.boomify(err, { statusCode: 409 }));
      }
      if (err.name === 'ValidationError' || 'CastError') {
        return next(boom.boomify(err, { statusCode: 400 }));
      }
      return next(boom.badImplementation(err));
    }
    // console.log(err);
    next(err);
  });
};

const verifyToken = asyncMiddleware(async (req, res, next) => {
  let token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.headers.authorization ||
    req.cookies.token;
  if (!token) throw boom.unauthorized('No token provided');
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  const decoded = await jwt.verify(token, process.env.SECRET_KEY);
  req.email = decoded.email;
  next();
});

module.exports = { asyncMiddleware, verifyToken };
