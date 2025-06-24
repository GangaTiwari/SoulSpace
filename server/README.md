# SoulSpace Backend API

A comprehensive mental health web application backend built with Node.js, Express, MongoDB, and OpenAI integration.

## 🚀 Features

- **Authentication System**: Email and anonymous user registration/login
- **Mood Tracking**: AI-powered emotion detection and mood analytics
- **AI Journaling**: Intelligent prompts and sentiment analysis
- **Community Forum**: Anonymous Reddit-style posts with AI moderation
- **AI Chat Support**: Compassionate mental health companion
- **Wearable Integration**: Google Fit and Fitbit data sync
- **Gamified Garden**: Self-care progress tracking with achievements
- **Comprehensive Dashboard**: Analytics and insights

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI GPT-4
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Built-in Mongoose validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/soulspace
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=30d
   OPENAI_API_KEY=your_openai_api_key_here
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register user (email or anonymous)
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `DELETE /account` - Delete user account

### Mood Tracking (`/api/mood`)
- `POST /` - Create mood check-in
- `GET /` - Get mood history
- `GET /stats` - Get mood statistics
- `GET /:id` - Get specific mood entry
- `PUT /:id` - Update mood entry
- `DELETE /:id` - Delete mood entry

### Journal (`/api/journal`)
- `GET /prompt` - Get AI-generated journal prompt
- `POST /` - Create journal entry
- `GET /` - Get journal entries
- `GET /stats` - Get journal statistics
- `GET /:id` - Get specific journal entry
- `PUT /:id` - Update journal entry
- `DELETE /:id` - Delete journal entry

### Forum (`/api/forum`)
- `POST /` - Create forum post
- `GET /` - Get forum posts (public)
- `GET /stats` - Get forum statistics (public)
- `GET /:id` - Get specific post (public)
- `POST /:id/reactions` - Add reaction to post
- `PUT /:id` - Update forum post
- `DELETE /:id` - Delete forum post

### AI Chat (`/api/chat`)
- `POST /` - Send message to AI chat
- `GET /suggestions` - Get self-care suggestions

### Wearable Data (`/api/wearable`)
- `POST /sync` - Sync wearable data
- `GET /` - Get wearable data
- `GET /stats` - Get health statistics
- `GET /status` - Get wearable connection status
- `POST /connect` - Connect wearable account
- `DELETE /connect/:source` - Disconnect wearable

### Garden (`/api/garden`)
- `GET /` - Get garden progress
- `GET /stats` - Get garden statistics
- `GET /achievements` - Get achievements
- `POST /plant` - Plant a new seed
- `POST /water/:plantId` - Water a plant
- `POST /harvest/:plantId` - Harvest a plant
- `POST /decorations` - Add decoration

### Dashboard (`/api/dashboard`)
- `GET /` - Get dashboard overview
- `GET /mood-analytics` - Get mood analytics
- `GET /journal-analytics` - Get journal analytics
- `GET /health-analytics` - Get health analytics
- `GET /progress` - Get progress report

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Data Models

### User
- Email or anonymous authentication
- Profile preferences
- Wearable device connections
- Privacy settings

### Mood
- Mood type and intensity
- AI-detected emotions
- Location and weather data
- Timestamps and tags

### Journal
- AI-generated prompts
- Content with sentiment analysis
- Emotion detection
- Privacy settings

### Forum
- Anonymous posts with AI moderation
- Reaction system
- Content filtering
- Community engagement

### WearableData
- Google Fit/Fitbit integration
- Sleep, steps, heart rate data
- Health metrics correlation
- Data synchronization

### GardenProgress
- Gamified self-care tracking
- Experience points and levels
- Plant growing system
- Achievements and streaks

## 🤖 AI Integration

The application integrates with OpenAI's GPT-4 for:

- **Emotion Detection**: Analyze text for emotional content
- **Sentiment Analysis**: Determine positive/negative sentiment
- **Content Moderation**: Filter inappropriate forum content
- **Journal Prompts**: Generate personalized writing prompts
- **Chat Support**: Provide compassionate mental health responses
- **Self-Care Suggestions**: Offer personalized wellness advice
- **Weekly Insights**: Generate comprehensive progress reports

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis integration (optional)
- **Rate Limiting**: API abuse prevention
- **Compression**: Response compression
- **Error Monitoring**: Comprehensive logging

## 🚀 Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Configure production MongoDB connection
3. **Security**: Update JWT secrets and API keys
4. **Monitoring**: Set up error tracking and logging
5. **SSL**: Configure HTTPS certificates

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository. 