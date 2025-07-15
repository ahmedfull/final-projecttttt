const jwt = require('jsonwebtoken');
const User = require('../model/UserModel.js');
const { UnauthenticatedError, UnauthorizedError } = require('../errors');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies?.token;

  if (!token) {
    return next(new UnauthenticatedError('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthenticatedError('Token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthenticatedError('Invalid token format'));
    }
    next(new UnauthenticatedError('Authentication failed'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError(
        `Role ${req.user.role} is not authorized`
      ));
    }
    next();
  };
};

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    next();
  } catch (error) {
    let message = 'Not authorized';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
    }
    
    return res.status(401).json({
      success: false,
      message
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  protect
};
