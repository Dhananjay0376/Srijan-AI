# 🎨 AI Content Planner

India's first AI-powered content planning tool for social media creators. Generate viral post titles and platform-optimized content using a multi-provider AI system with intelligent fallback.

## ✨ Features

### 🤖 AI-Powered Generation
- **Multi-Provider AI System**: 4-level fallback chain (Groq → Gemini → OpenRouter → Claude)
- **Platform-Optimized Content**: Automatic length adjustment for Instagram, YouTube, LinkedIn, Twitter
- **Dynamic Titles**: AI generates unique, diverse titles every time
- **Complete Post Generation**: Hook, caption, hashtags, CTA, and platform tips

### 📅 Smart Scheduling
- Multiple posting frequencies (Mon/Wed/Fri, Daily, Even/Odd dates, etc.)
- Visual calendar preview
- Custom post count (1-31 posts/month)
- Intelligent date distribution

### 🌐 Multi-Platform Support
- **Instagram**: 150-300 words, 20-30 hashtags, visual storytelling
- **YouTube**: 300-500 words, 10-15 hashtags, detailed descriptions
- **LinkedIn**: 200-400 words, 5-10 hashtags, professional tone
- **Twitter**: 200-280 characters, 2-5 hashtags, punchy content

### 🗣️ Multi-Language
- English, Hindi, Hinglish
- Natural language mixing for Indian audiences
- Tone customization (Motivational, Educational, Humorous, etc.)

### 🎯 Content Niches
- 10+ pre-built niches (Exam tips, Startup, Finance, Fitness, Astrology, etc.)
- Custom niche support for any topic
- AI adapts content style to your niche

### 💾 Data Persistence
- Auto-save to browser localStorage
- Survives page refreshes and browser restarts
- No data loss on accidental refresh
- Multiple plans saved simultaneously

### 🎨 Beautiful UI
- Aurora-themed dark interface
- Smooth animations and transitions
- Responsive design
- Intuitive navigation

## 🏗️ Architecture

```
Frontend (React + Vite)          Backend (Express.js)          Multi-Provider AI System
     Port 5173              →        Port 3001           →    
                                                              1️⃣ Groq (FREE)
User creates plan           →   Proxy receives request   →      ↓ fails
                                                              2️⃣ Gemini (FREE)
User sees content          ←    Proxy returns response  ←      ↓ fails
                                                              3️⃣ OpenRouter (FREE)
                                                                 ↓ fails
                                                              4️⃣ Claude (PAID)
```

### Why This Architecture?

**Backend Proxy Server:**
- ✅ Solves CORS issues (browsers can't call AI APIs directly)
- ✅ Keeps API keys secure (not exposed in frontend code)
- ✅ Enables request logging and monitoring
- ✅ Supports multiple AI providers with intelligent fallback

**Multi-Provider AI System:**
- ✅ 99.9% uptime (if one fails, others take over)
- ✅ Cost optimization (uses free providers first)
- ✅ Performance optimization (fastest providers prioritized)
- ✅ Quality assurance (falls back to premium if needed)

### AI Provider Details

| Priority | Provider | Model | Cost | Speed | Quality |
|----------|----------|-------|------|-------|---------|
| 1️⃣ | Groq | Llama 3.3 70B | FREE | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| 2️⃣ | Gemini | 1.5 Flash | FREE | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| 3️⃣ | OpenRouter | Llama 3.2 3B | FREE | ⚡⚡ | ⭐⭐⭐ |
| 4️⃣ | Claude | Sonnet 4 | PAID | ⚡ | ⭐⭐⭐⭐⭐ |

**Fallback Logic:**
- Each provider is tried in sequence
- If one fails, automatically moves to next
- Logs which provider succeeded
- Transparent to the user

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- API Keys (see Configuration section)

### Installation

1. **Clone or download this project**

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

4. **Configure API Keys:**
```bash
cd server
# Copy the example file
copy .env.example .env

# Edit .env and add your API keys
notepad .env
```

Add your API keys to `server/.env`:
```env
# Primary: Groq (FREE & FAST)
GROQ_API_KEY=your_groq_key_here

# Secondary: Google Gemini (FREE)
GEMINI_API_KEY=your_gemini_key_here

# Tertiary: OpenRouter (FREE models available)
OPENROUTER_API_KEY=your_openrouter_key_here

# Quaternary: Anthropic Claude (PAID - fallback only)
ANTHROPIC_API_KEY=your_claude_key_here
```

**Get Free API Keys:**
- Groq: https://console.groq.com/ (14,400 requests/day FREE)
- Gemini: https://makersuite.google.com/app/apikey (1,500 requests/day FREE)
- OpenRouter: https://openrouter.ai/ (Free tier available)
- Claude: https://console.anthropic.com/ (Paid, optional)

### Running the App

**Option 1: Use the startup script (Windows)**
```bash
start-all.bat
```

**Option 2: Manual start**

Terminal 1 (Backend):
```bash
cd server
npm start
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Access the App
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📖 Usage

1. **Create Account / Login**
   - Use demo login or create your own account
   - Session persists across page refreshes

2. **Create a Content Plan**
   - Choose your niche (or create a custom one!)
   - Select platform (Instagram, YouTube, LinkedIn, Twitter)
   - Pick language (English, Hindi, Hinglish) and tone
   - Set posting frequency and distribution
   - Generate your calendar with AI-powered titles

3. **Generate Posts**
   - Click "⚡ Gen" on any date
   - AI generates platform-optimized content:
     - **Hook**: Attention-grabbing opener (1-2 lines)
     - **Caption**: Full post body (length varies by platform)
     - **Hashtags**: Platform-appropriate count with # symbols
     - **CTA**: Warm call-to-action
     - **Platform Tips**: Practical posting advice

4. **Platform-Specific Content**
   - **Instagram**: 150-300 words, conversational, emoji-friendly
   - **YouTube**: 300-500 words, detailed descriptions
   - **LinkedIn**: 200-400 words, professional insights
   - **Twitter**: 200-280 characters, punchy and brief

5. **Edit & Manage**
   - Edit titles inline (double-click)
   - Copy generated content
   - Mark posts as skipped if needed
   - All changes auto-saved to browser

6. **Data Persistence**
   - Refresh page anytime - your work is saved
   - Create multiple plans - all stored locally
   - Close browser - data persists
   - Only logout clears your data

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite (fast build tool)
- CSS-in-JS (inline styles)
- localStorage for data persistence
- Google Fonts (Playfair Display, Outfit, JetBrains Mono)

**Backend:**
- Node.js
- Express.js
- node-fetch for API calls
- dotenv for environment variables
- CORS enabled

**AI Providers:**
- **Groq API** (Primary - FREE, Llama 3.3 70B)
- **Google Gemini API** (Secondary - FREE, Gemini 1.5 Flash)
- **OpenRouter API** (Tertiary - FREE, Llama 3.2 3B)
- **Anthropic Claude API** (Quaternary - PAID, Claude Sonnet 4)

**Key Features:**
- Multi-provider fallback system
- Platform-specific content optimization
- JSON sanitization for reliable parsing
- Temperature tuning for creative variation
- Request deduplication with timestamps

## 📁 Project Structure

```
ai-content-planner/
├── src/
│   └── main.jsx                      # React entry point
├── server/
│   ├── server.js                     # Express backend with multi-provider AI
│   ├── .env                          # API keys (DO NOT COMMIT!)
│   ├── .env.example                  # Template for API keys
│   ├── package.json                  # Backend dependencies
│   ├── test-api.js                   # API test script
│   └── README.md                     # Backend documentation
├── ai-content-planner.jsx            # Main React component (all UI)
├── index.html                        # HTML entry point
├── package.json                      # Frontend dependencies
├── vite.config.js                    # Vite configuration
├── start-all.bat                     # Windows startup script
├── .gitignore                        # Git ignore (includes .env)
├── SETUP-INSTRUCTIONS.md             # Detailed setup guide
├── FREE-AI-SETUP.md                  # Free AI provider setup
├── GROQ-INTEGRATION.md               # Groq integration docs
├── NEW-SETUP-GUIDE.md                # Updated setup guide
├── SECURITY-GUIDE.md                 # Security best practices
├── PLATFORM-CONTENT-GUIDELINES.md    # Platform-specific content rules
├── PERSISTENCE-FEATURE.md            # localStorage documentation
├── CHANGES-SUMMARY.md                # Recent changes log
├── CLEAN-COMMIT-GUIDE.md             # Git commit guide
└── README.md                         # This file
```

## 🧪 Testing

**Test the backend:**
```bash
cd server
node test-api.js
```

This will:
1. Check if the backend is running
2. Test AI title generation
3. Display results

## 🔧 Configuration

### API Keys Setup

1. Create `server/.env` file (copy from `.env.example`)
2. Add your API keys:

```env
# Primary: Groq (FREE & FAST) - 14,400 requests/day
GROQ_API_KEY=gsk_your_key_here

# Secondary: Google Gemini (FREE) - 1,500 requests/day
GEMINI_API_KEY=AIzaSy_your_key_here

# Tertiary: OpenRouter (FREE models available)
OPENROUTER_API_KEY=sk-or-v1-your_key_here

# Quaternary: Anthropic Claude (PAID - fallback only)
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here

# Server Configuration
PORT=3001
```

### Change AI Models

Edit `server/server.js` (lines 25-27):

```javascript
// Current models
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// Alternative Groq models
// const GROQ_MODEL = "mixtral-8x7b-32768";
// const GROQ_MODEL = "gemma2-9b-it";

// Alternative Gemini models (in GEMINI_API_ENDPOINT)
// gemini-1.5-pro (slower but better)
// gemini-2.0-flash-exp (experimental)
```

### Change Backend Port

Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change 3001 to your port
```

Then update `ai-content-planner.jsx`:
```javascript
const BACKEND_API_ENDPOINT = "http://localhost:YOUR_PORT/api/generate";
```

### Platform Content Guidelines

Customize in `ai-content-planner.jsx` (lines ~1490-1520):

```javascript
const platformGuidelines = {
  instagram: {
    captionLength: "150-300 words",
    hashtagCount: "20-30 hashtags",
    maxTokens: 1200
  },
  // ... customize for your needs
};
```

## 🐛 Troubleshooting

### CORS Errors
- ✅ Make sure backend is running on port 3001
- ✅ Check `http://localhost:3001/health` returns OK
- ✅ Restart both frontend and backend servers

### AI Generation Fails
**Check which provider is being used:**
- Backend terminal shows: "1️⃣ Trying Groq...", "2️⃣ Trying Gemini...", etc.
- If all fail, check your API keys in `server/.env`

**Common issues:**
- Missing API key → Add to `.env` file
- Invalid API key → Get new key from provider
- Rate limit exceeded → Wait or use different provider
- Model decommissioned → Update model name in `server.js`

### JSON Parsing Errors
- ✅ Already handled with two-stage parsing
- ✅ Control characters automatically sanitized
- ✅ If still occurs, check backend logs for raw response

### Port Already in Use
**Error: EADDRINUSE**
```bash
# Windows: Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or kill all Node processes
taskkill /F /IM node.exe
```

### Data Not Persisting
- ✅ Check if localStorage is enabled in browser
- ✅ Private/Incognito mode doesn't persist data
- ✅ Clear cache if seeing old data

### Frontend Won't Start
```bash
npm install
npm run dev
```

### Backend Won't Start
```bash
cd server
npm install
npm start
```

### API Keys Leaked to GitHub
- ✅ Revoke old keys immediately
- ✅ Generate new keys
- ✅ Verify `.env` is in `.gitignore`
- ✅ See `CLEAN-COMMIT-GUIDE.md` for history cleanup

## 📊 Monitoring & Logging

### Backend Logs
The backend terminal shows detailed logs:
```
🚀 Backend proxy server running on http://localhost:3001
✅ CORS enabled for all origins

📡 AI Provider Fallback Chain:
   1️⃣ Groq (FREE) ✅
   2️⃣ Gemini (FREE) ✅
   3️⃣ OpenRouter (FREE) ✅
   4️⃣ Anthropic (PAID) ✅

🔒 API keys loaded from .env file (secure!)

🚀 Received request: { model, max_tokens, systemLength, messagesCount }
1️⃣ Trying Groq API (FREE)...
✅ Groq API success (FREE!)
```

### Browser Console
- Frontend errors and warnings
- API call results
- Fallback triggers
- JSON parsing issues

### Health Check
Visit `http://localhost:3001/health` to see:
```json
{
  "status": "ok",
  "message": "Backend proxy is running",
  "providers": {
    "groq": true,
    "gemini": true,
    "openrouter": true,
    "anthropic": true
  }
}
```

## 🔐 Security

### Current Implementation
✅ API keys stored in backend `.env` file (not exposed to browser)  
✅ `.env` file in `.gitignore` (never committed to Git)  
✅ CORS enabled for development  
✅ No sensitive data in frontend code  
✅ Multi-provider system reduces single point of failure  
✅ Request sanitization prevents injection attacks  

### Best Practices
- Never commit `.env` file to Git
- Rotate API keys regularly
- Use different keys for dev/production
- Monitor API usage and costs
- Revoke keys immediately if leaked

### For Production Deployment
- [ ] Use environment variables (not `.env` file)
- [ ] Implement rate limiting
- [ ] Add user authentication
- [ ] Use HTTPS only
- [ ] Restrict CORS to your domain
- [ ] Add request validation
- [ ] Implement API key rotation
- [ ] Set up monitoring and alerts
- [ ] Use secrets management service (AWS Secrets Manager, etc.)

### If API Keys Are Leaked
1. Revoke old keys immediately from provider dashboards
2. Generate new keys
3. Update `server/.env` with new keys
4. Clean Git history (see `CLEAN-COMMIT-GUIDE.md`)
5. Verify `.env` is in `.gitignore`
6. Never commit keys again!

## 🎯 Roadmap

### Completed ✅
- [x] Multi-provider AI system with fallback
- [x] Platform-specific content optimization
- [x] Data persistence with localStorage
- [x] JSON sanitization for reliable parsing
- [x] Hashtag formatting with # symbols
- [x] Custom niche support
- [x] Multi-language support (English, Hindi, Hinglish)
- [x] Visual calendar with date distribution
- [x] Inline title editing
- [x] Post status management

### In Progress 🚧
- [ ] User authentication with database
- [ ] Cloud sync for multi-device access
- [ ] Export to CSV/PDF/JSON

### Planned 📋
- [ ] Schedule posts directly to social media APIs
- [ ] Analytics dashboard (engagement predictions)
- [ ] Team collaboration features
- [ ] Content performance tracking
- [ ] A/B testing for titles
- [ ] Image generation integration
- [ ] Video script generation
- [ ] Bulk content generation
- [ ] Custom prompt templates
- [ ] Content calendar sharing
- [ ] Mobile app (React Native)
- [ ] Browser extension

## 📝 License

This project is for educational and personal use.

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 💬 Support

### Documentation
- `README.md` - This file (overview and quick start)
- `SETUP-INSTRUCTIONS.md` - Detailed setup guide
- `FREE-AI-SETUP.md` - Free AI provider setup
- `SECURITY-GUIDE.md` - Security best practices
- `PLATFORM-CONTENT-GUIDELINES.md` - Platform-specific rules
- `PERSISTENCE-FEATURE.md` - localStorage documentation
- `CHANGES-SUMMARY.md` - Recent changes and fixes

### Debugging Steps
1. Check backend terminal for errors
2. Check browser console (F12) for frontend errors
3. Visit `http://localhost:3001/health` to verify backend
4. Run `node server/test-api.js` to test AI providers
5. Check `server/.env` file has all API keys
6. Verify `.env` is not in `.gitignore`

### Common Issues
- **CORS errors** → Backend not running
- **AI generation fails** → Check API keys in `.env`
- **Port in use** → Kill process or change port
- **Data not saving** → Check localStorage enabled
- **JSON errors** → Already handled, check backend logs

### Getting Help
- Check the documentation files listed above
- Review backend terminal logs
- Check browser console for errors
- Test with `node server/test-api.js`

## 🎉 Acknowledgments

- **AI Providers**: Groq, Google Gemini, OpenRouter, Anthropic Claude
- **Inspiration**: Indian content creators and their unique needs
- **UI Design**: Modern SaaS apps and aurora-themed aesthetics
- **Community**: Open source libraries and tools

### Key Technologies
- React 18 for UI
- Vite for blazing-fast builds
- Express.js for backend
- Multiple AI providers for reliability
- localStorage for data persistence

---

**Made with ❤️ for Indian creators**

*Empowering content creators with AI-powered planning and generation*
