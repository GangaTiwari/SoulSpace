const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  // Generate journal prompts based on user's mood and history
  static async generateJournalPrompt(userMood, userHistory = []) {
    try {
      const prompt = `Generate a thoughtful, therapeutic journaling prompt for someone who is feeling ${userMood}. 
      
      Consider their recent mood history: ${userHistory.map(h => h.mood).join(', ')}
      
      The prompt should be:
      - Encouraging and non-judgmental
      - Specific to their current emotional state
      - Designed to promote self-reflection and growth
      - 1-2 sentences maximum
      
      Return only the prompt text, nothing else.`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text().trim();
    } catch (error) {
      console.error('Error generating journal prompt:', error);
      return "How are you feeling today? What's on your mind?";
    }
  }

  // Analyze emotions from text
  static async analyzeEmotions(text) {
    try {
      const prompt = `Analyze the following text and identify the primary emotions expressed. 
      
      Text: "${text}"
      
      Return a JSON array of emotions with confidence scores (0-1). 
      Available emotions: joy, sadness, anger, fear, surprise, disgust, trust, anticipation, love, optimism, pessimism, confidence, anxiety, gratitude, hope, despair, excitement, calm
      
      Format: [{"emotion": "emotion_name", "confidence": 0.95}]`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const responseText = response.text().trim();
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      return [];
    }
  }

  // Perform sentiment analysis
  static async analyzeSentiment(text) {
    try {
      const prompt = `Analyze the sentiment of the following text and return a JSON object with:
      - score: a number between -1 (very negative) and 1 (very positive)
      - label: "positive", "negative", or "neutral"
      
      Text: "${text}"`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const responseText = response.text().trim();
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { score: 0, label: 'neutral' };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { score: 0, label: 'neutral' };
    }
  }

  // Moderate content for toxicity
  static async moderateContent(text) {
    try {
      const prompt = `Analyze the following text for potential toxicity, harmful content, or inappropriate material.
      
      Text: "${text}"
      
      Return a JSON object with:
      - toxicity: score between 0 (safe) and 1 (highly toxic)
      - isAppropriate: boolean
      - reason: string explaining the decision (if inappropriate)
      
      Consider: hate speech, threats, self-harm, harassment, explicit content`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const responseText = response.text().trim();
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { toxicity: 0, isAppropriate: true, reason: '' };
    } catch (error) {
      console.error('Error moderating content:', error);
      return { toxicity: 0, isAppropriate: true, reason: '' };
    }
  }

  // Generate AI chat responses - Simplified and reliable approach
  static async generateChatResponse(userMessage, userMood, conversationHistory = [], userContext = {}) {
    try {
      // Create a comprehensive prompt that includes context and conversation history
      let conversationContext = '';
      
      // Add recent conversation history (last 5 messages to avoid token limits)
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5);
        conversationContext = '\n\nRecent conversation:\n';
        recentHistory.forEach(msg => {
          const role = msg.role === 'assistant' ? 'SoulSpace' : 'User';
          conversationContext += `${role}: ${msg.content}\n`;
        });
      }

      const prompt = `You are SoulSpace, a compassionate and intelligent AI companion designed to support mental health and emotional well-being. 

Your personality:
- Warm, empathetic, and genuinely caring
- Knowledgeable about mental health, psychology, and self-care
- Conversational and engaging, like talking to a wise friend
- Professional but not clinical - you're supportive, not a replacement for therapy
- Encouraging and positive, but realistic and honest

Your capabilities:
- Provide thoughtful, detailed responses (3-5 sentences minimum)
- Ask follow-up questions to understand better
- Share relevant insights, coping strategies, and self-care tips
- Remember context from the conversation
- Adapt your tone based on the user's mood and needs

Current user context:
- Current mood: ${userMood}
- Mood intensity: ${userContext.moodIntensity || 5}/10
- Recent mood: ${userContext.recentMood || 'unknown'}
- Journal streak: ${userContext.journalStreak || 0} days
- Mood streak: ${userContext.moodStreak || 0} days
- User level: ${userContext.level || 1}
- Experience points: ${userContext.experience || 0}

Guidelines:
- Be conversational and natural, like ChatGPT
- Provide substantial, helpful responses
- Ask questions to engage the user
- Offer practical advice when appropriate
- Be supportive and non-judgmental
- If someone seems in crisis, encourage professional help
- Never give medical advice, but suggest seeking professional help when needed
- Reference their streaks, level, and progress to encourage them
- Adapt your response based on their current mood and intensity

Remember: You're here to listen, support, and help users feel better. Use their personal context to make responses more meaningful and encouraging.

${conversationContext}

User's current message: ${userMessage}

Please respond as SoulSpace:`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text().trim();
    } catch (error) {
      console.error('Error generating chat response:', error);
      
      // Smart fallback responses based on user message and context
      const message = userMessage.toLowerCase();
      console.log('Using fallback response for message:', message);
      console.log('User context:', userContext);
      
      // Personalized fallback responses based on user context
      if (userContext.currentMood === 'sad' || userContext.currentMood === 'depressed') {
        if (message.includes('good') || message.includes('great') || message.includes('happy') || message.includes('fine')) {
          console.log('Using positive mood fallback for sad user');
          return "That's wonderful to hear! I'm so glad you're feeling better. You've been working hard on your mental health journey - your ${userContext.moodStreak || 0} day mood streak shows your dedication. What's been helping you feel this way?";
        }
      }
      
      if (userContext.journalStreak > 0) {
        if (message.includes('journal') || message.includes('write') || message.includes('entry')) {
          console.log('Using journal encouragement fallback');
          return `Great job on your ${userContext.journalStreak} day journal streak! Writing regularly is such a powerful tool for mental health. What would you like to explore in your journal today?`;
        }
      }
      
      if (userContext.level > 1) {
        if (message.includes('progress') || message.includes('achievement') || message.includes('level')) {
          console.log('Using progress acknowledgment fallback');
          return `You're doing amazing! Level ${userContext.level} with ${userContext.experience} experience points shows your commitment to growth. Every step forward counts, no matter how small. What's been your biggest win lately?`;
        }
      }
      
      // General greeting responses
      if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        console.log('Using greeting fallback');
        return `Hello! I'm here to support you on your mental health journey. How are you feeling today? I notice you're at level ${userContext.level || 1} - that's fantastic progress!`;
      }
      
      // Mood-related responses
      if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
        console.log('Using sad mood fallback');
        return "I'm sorry you're feeling this way. It's okay to not be okay, and I'm here to listen. Have you tried any of the self-care activities in your garden? Sometimes even small steps like taking a deep breath can help. What's been on your mind?";
      }
      
      if (message.includes('anxious') || message.includes('worried') || message.includes('stress')) {
        console.log('Using anxiety fallback');
        return "Anxiety can be really challenging. Remember, you're not alone in this. Have you tried the breathing exercises in the Calm Zone? They can help ground you in the present moment. What's causing you to feel anxious right now?";
      }
      
      if (message.includes('happy') || message.includes('good') || message.includes('great')) {
        console.log('Using positive mood fallback');
        return "That's wonderful! I'm so happy to hear you're feeling good. Positive moments like this are worth celebrating. What's been contributing to your good mood? I'd love to hear about it!";
      }
      
      // Default encouraging response
      console.log('Using default fallback');
      return "I'm here to listen and support you. Sometimes just talking about what's on your mind can help. What would you like to share? Remember, every conversation is a step forward in your mental health journey.";
    }
  }

  // Generate self-care suggestions based on mood
  static async generateSelfCareSuggestions(userMood, userData = {}) {
    try {
      const prompt = `Generate 3 personalized self-care suggestions for someone feeling ${userMood}.
      
      User context:
      - Level: ${userData.level || 1}
      - Journal streak: ${userData.journalStreak || 0} days
      - Mood streak: ${userData.moodStreak || 0} days
      - Recent activities: ${userData.recentActivities || 'none'}
      
      Suggestions should be:
      - Practical and actionable
      - Appropriate for their current mood
      - Encouraging and supportive
      - 1-2 sentences each
      
      Return as a JSON array: [{"title": "Suggestion Title", "description": "Detailed suggestion", "category": "mindfulness|physical|social|creative"}]`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const responseText = response.text().trim();
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [
        {
          title: "Take a Mindful Moment",
          description: "Find a quiet place and take 5 deep breaths. Focus on the sensation of breathing in and out.",
          category: "mindfulness"
        },
        {
          title: "Write in Your Journal",
          description: "Express your feelings through writing. Even a few sentences can help process emotions.",
          category: "creative"
        },
        {
          title: "Reach Out to Someone",
          description: "Connect with a friend or family member. Social support can make a big difference.",
          category: "social"
        }
      ];
    } catch (error) {
      console.error('Error generating self-care suggestions:', error);
      return [
        {
          title: "Take a Mindful Moment",
          description: "Find a quiet place and take 5 deep breaths. Focus on the sensation of breathing in and out.",
          category: "mindfulness"
        },
        {
          title: "Write in Your Journal",
          description: "Express your feelings through writing. Even a few sentences can help process emotions.",
          category: "creative"
        },
        {
          title: "Reach Out to Someone",
          description: "Connect with a friend or family member. Social support can make a big difference.",
          category: "social"
        }
      ];
    }
  }

  // Generate weekly insights from user data
  static async generateWeeklyInsights(moodData, journalData, wearableData) {
    try {
      const prompt = `Analyze the following user data and generate personalized weekly insights:
      
      Mood Data: ${JSON.stringify(moodData)}
      Journal Entries: ${JSON.stringify(journalData)}
      Wearable Data: ${JSON.stringify(wearableData)}
      
      Generate insights that are:
      - Positive and encouraging
      - Based on patterns in their data
      - Actionable and helpful
      - 2-3 sentences each
      
      Return as a JSON object with: {"patterns": "mood pattern insights", "achievements": "weekly achievements", "suggestions": "improvement suggestions"}`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const responseText = response.text().trim();
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        patterns: "You've been consistent with your mood tracking this week, which shows great self-awareness.",
        achievements: "Your dedication to mental health is impressive. Every check-in is a step forward.",
        suggestions: "Consider trying some new self-care activities to add variety to your routine."
      };
    } catch (error) {
      // Patch: If Gemini API returns 429, return fallback insights
      if (error.status === 429 || (error.response && error.response.status === 429)) {
        console.warn('Gemini API rate limit hit. Returning fallback insights.');
        return {
          patterns: "AI insights are temporarily unavailable due to rate limits. Please try again in a minute.",
          achievements: "Your progress is still being tracked!",
          suggestions: "Check back soon for more personalized suggestions."
        };
      }
      console.error('Error generating weekly insights:', error);
      return {
        patterns: "You've been consistent with your mood tracking this week, which shows great self-awareness.",
        achievements: "Your dedication to mental health is impressive. Every check-in is a step forward.",
        suggestions: "Consider trying some new self-care activities to add variety to your routine."
      };
    }
  }

  // Generate forum post suggestions
  static async generateForumSuggestions(userMood, userInterests = []) {
    try {
      const prompt = `Generate 3 forum post topic suggestions for someone feeling ${userMood} with interests in: ${userInterests.join(', ')}.
      
      Topics should be:
      - Relevant to their current emotional state
      - Engaging for the community
      - Encouraging discussion and support
      - 1-2 sentences each
      
      Return as a JSON array: [{"title": "Post Title", "description": "Brief description", "category": "support|discussion|advice|celebration"}]`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const responseText = response.text().trim();
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [
        {
          title: "How do you practice self-care when feeling down?",
          description: "Looking for new ideas to add to my self-care routine.",
          category: "support"
        },
        {
          title: "What's your favorite way to boost your mood?",
          description: "Share your go-to strategies for feeling better.",
          category: "discussion"
        },
        {
          title: "Celebrating small wins",
          description: "Let's talk about the little victories that make a big difference.",
          category: "celebration"
        }
      ];
    } catch (error) {
      console.error('Error generating forum suggestions:', error);
      return [
        {
          title: "How do you practice self-care when feeling down?",
          description: "Looking for new ideas to add to my self-care routine.",
          category: "support"
        },
        {
          title: "What's your favorite way to boost your mood?",
          description: "Share your go-to strategies for feeling better.",
          category: "discussion"
        },
        {
          title: "Celebrating small wins",
          description: "Let's talk about the little victories that make a big difference.",
          category: "celebration"
        }
      ];
    }
  }
}

module.exports = AIService;