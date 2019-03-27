const boom = require('boom');

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
    next(err);
  });
};

module.exports = asyncMiddleware;
