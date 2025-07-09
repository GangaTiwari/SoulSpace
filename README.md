# SoulSpace

SoulSpace is a full-stack wellness and mental health web application. It provides users with tools for mood tracking, journaling, AI-powered chat, games, forums, and more to support mental well-being.

## Features
- **Mood Check-ins:** Track your mood daily and view trends over time.
- **Journal:** Write journal entries and receive AI-generated insights.
- **AI Chat Buddy:** Chat with an AI companion for support and conversation.
- **Calm Zone:** Access breathing exercises, meditation timers, and ambient sounds.
- **Games:** Play cognitive and relaxing games to improve mental wellness.
- **Forum:** Participate in community discussions and support others.
- **Dashboard:** Visualize your progress and receive personalized insights.
- **Settings:** Manage your account and preferences.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express, MongoDB
- **AI Integration:** Google Gemini API (for journal prompts and insights)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud)

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/soulspace.git
   cd soulspace
   ```
2. **Install dependencies:**
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the `server` directory and fill in your MongoDB URI, JWT secret, and Gemini API key.
4. **Start the development servers:**
   - In the project root, run:
     ```bash
     ./start-servers.bat
     ```
   - Or manually:
     ```bash
     cd server && npm run dev
     # In another terminal:
     cd client && npm start
     ```
5. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment
- You can deploy the backend (server) to platforms like Heroku, Render, or Railway.
- The frontend (client) can be deployed to Vercel, Netlify, or similar services.

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License
This project is for educational and personal wellness use. See [LICENSE](LICENSE) for details.

## Contributors
Amit Garg, Ganga Tiwari

## Acknowledgements
- Google Gemini API
- Open source React and Node.js community

---

*SoulSpace: Supporting your mental wellness journey.* 
