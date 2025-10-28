// utils/validateEnv.js
/**
 * Validates required environment variables on application startup
 */
export const validateEnv = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(env => console.error(`   - ${env}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Warn about optional but recommended variables
  const recommended = ['EMAIL_SERVICE', 'EMAIL_USER', 'EMAIL_PASSWORD', 'FRONTEND_URL'];
  const missingRecommended = recommended.filter(env => !process.env[env]);

  if (missingRecommended.length > 0) {
    console.warn('⚠️  Missing recommended environment variables:');
    missingRecommended.forEach(env => console.warn(`   - ${env}`));
    console.warn('\nSome features may not work correctly without these variables.');
  }

  console.log('✅ Environment variables validated successfully');
};
