import jwt from 'jsonwebtoken';

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not defined!');
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

export const signToken = (payload, expiresIn = '7d') => {
  const secret = getJWTSecret();
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  const secret = getJWTSecret();
  return jwt.verify(token, secret);
}; 