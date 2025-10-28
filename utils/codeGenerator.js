// utils/codeGenerator.js
import crypto from 'crypto';

/**
 * Generate a 6-digit verification code
 * @returns {string} A 6-digit numeric code
 */
export const generateVerificationCode = () => {
  // Generate a random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  return code;
};

/**
 * Check if a verification code has expired
 * @param {Date} expiryDate - The expiry date to check
 * @returns {boolean} True if expired, false otherwise
 */
export const isCodeExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

/**
 * Get code expiry time (15 minutes from now)
 * @returns {Date} Expiry date
 */
export const getCodeExpiry = () => {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
};
