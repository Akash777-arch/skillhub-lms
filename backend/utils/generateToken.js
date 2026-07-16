const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production
    sameSite: isProduction ? 'none' : 'strict', // Allow cross-domain in production
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

module.exports = generateToken;
