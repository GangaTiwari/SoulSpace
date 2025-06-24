const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  process.exit(0);
}

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/soulspace

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
JWT_EXPIRE=30d

# AI Configuration - Gemini API (Primary)
GEMINI_API_KEY=your-gemini-api-key-here
# Get your API key from: https://makersuite.google.com/app/apikey

# OpenAI Configuration (Fallback - Commented out)
# OPENAI_API_KEY=your-openai-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the following values:');
  console.log('   - JWT_SECRET: Change to a secure random string');
  console.log('   - GEMINI_API_KEY: Add your Gemini API key from https://makersuite.google.com/app/apikey');
  console.log('   - MONGODB_URI: Update if using a different database');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
} 