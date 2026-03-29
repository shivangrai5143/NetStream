const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const validateSignup = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').isLength({ min: 2 }).withMessage('Username must be at least 2 characters').trim(),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateProfile = [
  body('name').isLength({ min: 1, max: 20 }).withMessage('Name must be 1-20 characters').trim(),
  body('isKids').optional().isBoolean(),
  handleValidationErrors
];

module.exports = { validateSignup, validateLogin, validateProfile, handleValidationErrors };
