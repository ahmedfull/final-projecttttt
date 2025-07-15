// server/errors.js
module.exports = {
    UnauthenticatedError: class extends Error {
      constructor(message) {
        super(message);
        this.statusCode = 401;
      }
    },
    UnauthorizedError: class extends Error {
      constructor(message) {
        super(message);
        this.statusCode = 403;
      }
    }
  };