import { useState, useEffect, useRef, useCallback } from "react";

// ─── CLAUDE API CONFIGURATION ────────────────────────────────────────────────
// Backend proxy endpoint:
// - local dev falls back to the Express server on :3001
// - production/Vercel uses the same-origin serverless route
const API_BASE_URL = (() => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3001";
  }
  return "";
})();
const BACKEND_API_ENDPOINT = `${API_BASE_URL}/api/generate`;
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ─── GOOGLE FONTS ───────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    
    :root {
      --bg-page: #08080F;
      --bg-canvas: #05050A;
      --bg-surface: #10101A;
      --bg-surface-2: #181826;
      --bg-surface-3: #1E1E30;
      --border: rgba(255,255,255,0.07);
      --border-bright: rgba(255,255,255,0.14);
      --border-accent: rgba(200,147,74,0.3);
      --text-primary: #F0EFEC;
      --text-secondary: #9090AA;
      --text-muted: #5A5A72;
      --accent-gold: #C8934A;
      --accent-gold-lt: #F0C878;
      --accent-gold-glow: rgba(200,147,74,0.18);
      --accent-violet: #7A5AC4;
      --accent-sky: #4A82C4;
      --accent-rose: #C4667A;
      --accent-sage: #5A8A6A;
      --radius-sm: 6px;
      --radius-md: 12px;
      --radius-lg: 20px;
      --glow-gold: 0 0 30px rgba(200,147,74,0.25), 0 0 60px rgba(200,147,74,0.1);
      --shadow-md: 0 4px 24px rgba(0,0,0,0.5);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body, #root { 
      background: var(--bg-page); 
      color: var(--text-primary);
      font-family: 'Outfit', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .font-playfair { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* Aurora blobs */
    .aurora-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
    }
    .aurora-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.06;
      animation: blobFloat 14s ease-in-out infinite;
    }
    .aurora-blob:nth-child(1) {
      width: 600px; height: 600px;
      background: radial-gradient(circle, var(--accent-gold), transparent);
      top: -10%; left: -10%;
      animation-delay: 0s;
    }
    .aurora-blob:nth-child(2) {
      width: 500px; height: 500px;
      background: radial-gradient(circle, var(--accent-violet), transparent);
      top: 40%; right: -10%;
      animation-delay: -5s;
    }
    .aurora-blob:nth-child(3) {
      width: 400px; height: 400px;
      background: radial-gradient(circle, var(--accent-sky), transparent);
      bottom: -10%; left: 40%;
      animation-delay: -9s;
    }
    @keyframes blobFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(40px, -30px) scale(1.05); }
      66% { transform: translate(-20px, 40px) scale(0.97); }
    }

    /* Particles */
    .particle-canvas { position: absolute; inset: 0; pointer-events: none; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg-page); }
    ::-webkit-scrollbar-thumb { background: rgba(200,147,74,0.3); border-radius: 2px; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(200,147,74,0.2); }
      50% { box-shadow: 0 0 40px rgba(200,147,74,0.5); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes dot-pulse {
      0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
    .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
    .animate-float { animation: float 5s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

    /* Gold gradient text */
    .text-gold-gradient {
      background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-lt) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, var(--accent-gold), var(--accent-gold-lt));
      color: #0A0805;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 0.01em;
    }
    .btn-primary:hover {
      transform: scale(1.03);
      box-shadow: var(--glow-gold);
    }
    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }
    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      font-family: 'Outfit', sans-serif;
      font-weight: 500;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 50px;
      border: 1px solid var(--border-bright);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .btn-sm {
      padding: 7px 14px;
      font-size: 12px;
      border-radius: 8px;
    }

    /* Cards */
    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      transition: all 0.2s;
    }
    .card:hover {
      border-color: var(--border-accent);
      background: var(--bg-surface-2);
    }
    .card-glow {
      box-shadow: 0 0 0 1px var(--border-accent), var(--glow-gold);
    }

    /* Form inputs */
    .input-field {
      width: 100%;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      padding: 12px 16px;
      outline: none;
      transition: border-color 0.2s;
    }
    .input-field:focus { border-color: var(--accent-gold); }
    .input-field::placeholder { color: var(--text-muted); }
    select.input-field option { background: var(--bg-surface); }

    /* Status badges */
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; font-weight: 500;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-pending { background: rgba(200,147,74,0.15); color: var(--accent-gold); border: 1px solid rgba(200,147,74,0.3); }
    .badge-confirmed { background: rgba(90,138,106,0.15); color: var(--accent-sage); border: 1px solid rgba(90,138,106,0.3); }
    .badge-generated { background: rgba(74,130,196,0.15); color: var(--accent-sky); border: 1px solid rgba(74,130,196,0.3); }
    .badge-skipped { background: rgba(90,90,114,0.15); color: var(--text-muted); border: 1px solid rgba(90,90,114,0.3); }

    /* Loading dots */
    .loading-dot {
      display: inline-block; width: 6px; height: 6px; border-radius: 50%;
      background: var(--accent-gold);
      animation: dot-pulse 1.4s ease-in-out infinite;
    }
    .loading-dot:nth-child(2) { animation-delay: 0.2s; }
    .loading-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Calendar grid */
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    .cal-cell {
      min-height: 90px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 8px;
      transition: all 0.2s;
    }
    .cal-cell-active {
      background: var(--bg-surface-2);
      border-color: var(--border-accent);
      box-shadow: 0 0 20px rgba(200,147,74,0.08);
    }
    .cal-cell-active:hover {
      background: var(--bg-surface-3);
      transform: translateY(-1px);
    }
    .cal-cell-generated {
      background: rgba(74,130,196,0.07);
      border-color: rgba(74,130,196,0.3);
    }
    .cal-cell-inactive { opacity: 0.3; }

    /* Progress bar */
    .progress-bar {
      height: 3px; background: var(--bg-surface-3); border-radius: 2px; overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-gold), var(--accent-gold-lt));
      border-radius: 2px;
      transition: width 0.5s ease;
    }

    /* Orb visual */
    .orb {
      border-radius: 50%;
      filter: blur(1px);
      animation: float 6s ease-in-out infinite;
    }

    /* Toast */
    .toast {
      position: fixed; bottom: 24px; right: 24px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-md);
      padding: 14px 18px;
      font-size: 14px;
      z-index: 9999;
      animation: slideRight 0.3s ease forwards;
      max-width: 340px;
      box-shadow: var(--shadow-md);
    }
    .toast-success { border-left: 3px solid var(--accent-sage); }
    .toast-info { border-left: 3px solid var(--accent-sky); }
    .toast-warning { border-left: 3px solid var(--accent-gold); }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }
    .modal-content {
      background: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-xl);
      padding: 32px;
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalIn 0.3s ease;
      position: relative;
    }

    /* Niche selector cards */
    .niche-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 14px;
      cursor: pointer;
      transition: all 0.15s;
      text-align: center;
    }
    .niche-card:hover { border-color: var(--border-accent); background: var(--bg-surface-2); }
    .niche-card.selected {
      border-color: var(--accent-gold);
      background: rgba(200,147,74,0.08);
      box-shadow: var(--glow-gold);
    }

    /* Platform selector */
    .platform-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 18px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex; align-items: center; gap: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
    }
    .platform-btn:hover { border-color: var(--border-bright); }
    .platform-btn.selected {
      border-color: var(--accent-gold);
      color: var(--text-primary);
      background: rgba(200,147,74,0.08);
    }

    /* Mini calendar dots */
    .mini-cal {
      display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px;
    }
    .mini-dot {
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace; font-size: 8px;
      transition: all 0.2s;
    }
    .mini-dot-active {
      background: var(--accent-gold);
      color: #0A0805;
      box-shadow: 0 0 8px rgba(200,147,74,0.5);
    }
    .mini-dot-inactive { color: var(--text-muted); }

    /* Hashtag pills */
    .hashtag-pill {
      display: inline-flex; align-items: center;
      background: rgba(122,90,196,0.12);
      border: 1px solid rgba(122,90,196,0.25);
      color: #9B8FD4;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .hashtag-pill:hover {
      background: rgba(122,90,196,0.22);
      border-color: rgba(122,90,196,0.5);
    }

    /* Step indicator */
    .step-dot {
      width: 8px; height: 8px; border-radius: 50%;
      transition: all 0.3s;
    }
    .step-dot-active { background: var(--accent-gold); width: 24px; border-radius: 4px; }
    .step-dot-done { background: var(--accent-sage); }
    .step-dot-inactive { background: var(--bg-surface-3); border: 1px solid var(--border); }

    /* Segmented control */
    .seg-control {
      display: inline-flex;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 3px;
      gap: 2px;
    }
    .seg-btn {
      padding: 7px 16px; border-radius: 9px;
      border: none; background: transparent;
      color: var(--text-secondary); font-family: 'Outfit', sans-serif; font-size: 13px;
      cursor: pointer; transition: all 0.15s;
    }
    .seg-btn.active {
      background: var(--bg-surface-3);
      color: var(--text-primary);
      border: 1px solid var(--border-accent);
    }

    /* Divider */
    .divider {
      height: 1px; background: var(--border); margin: 20px 0;
    }

    /* Navbar */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(8,8,15,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: 0 32px;
      height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }

    /* Frequency cards */
    .freq-card {
      background: var(--bg-surface);
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      cursor: pointer;
      transition: all 0.15s;
      text-align: center;
    }
    .freq-card:hover { border-color: var(--border-accent); }
    .freq-card.selected {
      border-color: var(--accent-gold);
      background: rgba(200,147,74,0.06);
    }

    /* Scrollable area */
    .scroll-area {
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(200,147,74,0.3) transparent;
    }

    @media (max-width: 768px) {
      .cal-grid { grid-template-columns: repeat(4, 1fr); }
      .cal-cell { min-height: 70px; }
    }
  `}</style>
);

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
const DEMO_POSTS = {
  exam_instagram_hinglish: {
    hook: "Sach bolunga — padhai nahi, sochne ka tarika galat hai.",
    caption: `99% students ek hi galti karte hain — rote hain, samajhte nahi.\n\nMain 3 saal tak same mistake karta raha. Phir ek din ek topper ne bola: "Tu padh raha hai ya sirf pages palat raha hai?"\n\nThat one line changed everything for me.\n\nAaj teri padhai 10x better ho sakti hai — agar sirf ye 3 cheezein badal le:\n✅ Active recall > passive reading\n✅ Spaced repetition > last night cramming\n✅ Teach someone > read alone\n\nTry karo. Ek hafte mein fark dikhega. 💪`,
    hashtags: "#ExamTips #StudyMotivation #PadhaiiKaro #StudentLife #TopperSecrets #UPSC #JEEPrep #BoardExams #IndianStudents #StudyWithMe #MotivationInHindi #ExamPreparation #StudyHacks #NeetPrep #ConcentrationTips",
    cta: "Neeche comment mein batao — tumhari biggest study struggle kya hai? 👇",
    platform_note: "Best time to post: 7–9 AM or 8–10 PM IST (peak student scroll time). Use Reels format for 3x reach."
  },
  startup_linkedin_english: {
    hook: "I raised ₹1.2 Cr seed round with a deck that had exactly 9 slides. Here's every slide.",
    caption: `Most founders over-engineer their pitch decks.\n\nI see 40-slide decks that say nothing. And 9-slide decks that close rounds.\n\nHere's the exact structure that worked for us:\n\n1. The Problem (one sentence)\n2. Why Now (market timing)\n3. Our Solution (demo screenshot, not theory)\n4. Traction (numbers only, no projections)\n5. Business Model (how money flows)\n6. Market Size (TAM/SAM/SOM — honest numbers)\n7. Team (why WE can do this)\n8. Competition (acknowledge it, then differentiate)\n9. The Ask (specific amount + use of funds)\n\nThat's it. No fluff. No "vision" slides.\n\nThe best founders I've met are unreasonably clear.\n\nBe unreasonably clear.`,
    hashtags: "#StartupIndia #Fundraising #FounderLife #VentureCapital #PitchDeck #IndianStartups #StartupEcosystem #Entrepreneurship #AngelInvesting #SeedFunding",
    cta: "What's your biggest pitch deck mistake? Drop it below — let's learn together. 💼",
    platform_note: "Post on Tuesday or Wednesday 9–11 AM IST for max LinkedIn reach. Pin this as a featured post."
  },
  astrology_instagram_hinglish: {
    hook: "Aaj Shani ki drishti shift ho rahi hai — aur ye 4 signs ke liye bohot bada hai.",
    caption: `Shaniwar ka din. Shani maharaj khud active hain aaj.\n\nMesh, Mithun, Kanya, aur Makar — sun lo dhyan se.\n\n✨ Aaj ke din ye karo:\n🪐 Koi bhi naya kaam shuru karne se pehle 5 minute meditate karo\n🌿 Neele ya kaale kapde pehenno — Shani ka rang\n💧 Subah uthke ek glass paani mein kuch boond nimbu daal ke piyo\n🙏 Hanuman Chalisa ek baar zaroor padhna\n\nAur haan — kisi se bura mat bolna aaj. Shani maharaj sab dekhte hain.\n\nYe astrology nahi, ye energy management hai. 🌙`,
    hashtags: "#AstrologyInHindi #Shani #DailyHoroscope #VedicAstrology #IndianAstrology #ZodiacSigns #RashiFal #Jyotish #AajKaRashifal #ShaniDev #KundliMilan #Nakshatra",
    cta: "Tumhara raashi kya hai? Comment mein batao — main personally reply karunga 🙏",
    platform_note: "Saturday posts perform best for astrology content. Use 3–5 hashtags in Stories as well."
  }
};

const NICHES = [
  { id: "exam", label: "Exam Tips", emoji: "📚" },
  { id: "motivation", label: "Motivation", emoji: "🔥" },
  { id: "startup", label: "Startup", emoji: "🚀" },
  { id: "astrology", label: "Astrology", emoji: "🌙" },
  { id: "finance", label: "Finance", emoji: "💰" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "cooking", label: "Cooking", emoji: "🍳" },
  { id: "self-discipline", label: "Self Discipline", emoji: "⚡" },
  { id: "fashion", label: "Fashion", emoji: "👗" },
  { id: "tech", label: "Tech Tips", emoji: "💻" },
  { id: "custom", label: "Custom ✏️", emoji: "🎯" },
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "var(--accent-rose)", icon: "📸" },
  { id: "youtube", label: "YouTube", color: "var(--accent-sage)", icon: "▶️" },
  { id: "linkedin", label: "LinkedIn", color: "var(--accent-sky)", icon: "💼" },
  { id: "twitter", label: "Twitter/X", color: "var(--text-muted)", icon: "𝕏" },
];

const TONES = ["Motivational", "Educational", "Entertaining", "Conversational", "Professional"];

const NICHE_COLORS = {
  exam: "var(--accent-gold)", motivation: "var(--accent-rose)", startup: "var(--accent-sky)",
  astrology: "var(--accent-violet)", finance: "var(--accent-sage)", fitness: "var(--accent-gold)",
  cooking: "var(--accent-rose)", "self-discipline": "var(--accent-sky)", fashion: "var(--accent-violet)", tech: "var(--accent-sage)"
};

// Simulated AI title generation
const SAMPLE_TITLES = {
  exam: [
    "Padhai mein concentrate karna mushkil? Ye 5 tricks try karo",
    "Topper ka secret: 2 hours mein 8 hours ki padhai kaise karein",
    "Last night revision se better hai ye method — proof ke saath",
    "Board exam stress? Ek breath mein sab kuch sahi ho sakta hai",
    "Marks nahi aathe? Asli problem ye hai, padhai nahi",
    "Mock tests se darta hai? Iska matlab tujhe yahi karna chahiye",
    "Study schedule banana is sabse badi galti — ye karo instead",
    "Ek bhi chapter bhoolna band kar — neuroscience-based hack",
    "Exam hall mein panic? Ye 3-second technique try karo",
    "Notes likhne ka sahi tarika — 90% students galat karte hain",
    "Concentration kaise badhaye in 7 days — challenge accepted?",
    "Physics formulas yaad karna easy ho sakta hai, seriously",
    "Subah 5 baje uthna aur padhna — realistic guide for students",
    "Kya tujhe pata hai topper raat ko kya karta hai?",
    "Self study vs coaching — sach kya hai?"
  ],
  startup: [
    "Investors ne NO bol diya — ye 3 mistakes ki wajah se",
    "How I got 1000 users in 30 days with zero marketing budget",
    "The only pitch deck framework you'll ever need in 2025",
    "Why your startup idea doesn't matter (and what does)",
    "Hiring your first employee? Read this before you do",
    "The founder mindset shift that changed my business",
    "B2B vs B2C: what nobody tells you before you choose",
    "Unit economics explained simply — know your numbers",
    "How to get your first 10 paying customers from cold outreach",
    "Equity split mistakes that kill co-founder relationships",
    "Product-market fit: how to know when you've found it",
    "Why I quit my ₹40L job to build a startup (and what happened)",
    "Fundraising in India: what angels actually want to see",
    "The lean startup playbook for Indian founders in 2025",
    "How to build in public and grow 5x faster"
  ],
  motivation: [
    "Sach bolunga — mehnat ka koi shortcut nahi hota",
    "Ek din aayega jab ye sab worth it lagega",
    "Ye 3 habits ne meri zindagi badal di — seriously",
    "Log judge karte hain? Perfect. Inhe motivation bana lo",
    "Comfort zone chhodo — growth wahan nahi, bahar hai",
    "Ek kaam karo aaj jo future wala tu thank-you bolega",
    "Failure is not the opposite of success — it's part of it",
    "Agar dream bada hai toh neend bhi kum hogi — that's okay",
    "Subah ki pehli 30 minutes ko aise use karo",
    "Self-doubt se kaise jeeta — meri personal journey",
    "Progress slow hai? Iska matlab ruk jaana nahi hota",
    "Comparison is the thief of joy — but also your biggest teacher",
    "Jo tujhe rokna chahte hain, unhe dikhao kya possible hai",
    "Ek decision — baaki sab change ho jaata hai",
    "2025 ka baki time zero waste karne ka plan"
  ],
  finance: [
    "₹10,000 se SIP shuru karo — 20 saal mein ye hoga",
    "Credit card ka sach jo koi nahi batata — trap se kaise bachein",
    "Emergency fund kya hota hai aur kitna hona chahiye",
    "Mutual funds vs Fixed Deposit — 2025 mein sahi kya hai?",
    "Tax saving ke 5 tarike jo most Indians miss karte hain",
    "Zero se investing shuru karna hai? Pehle ye padho",
    "Home loan lene se pehle ye 7 cheezein zaroor check karo",
    "Salary ka 50-30-20 rule actually kaam karta hai — proof",
    "Gold invest karna chahiye ya nahi? Honest answer",
    "Stock market crash se darte ho? Ye logic samajh lo",
    "UPI fraud se kaise bachein — real cases aur solutions",
    "Term insurance kya hai aur kyun sabko leni chahiye",
    "Passive income ke 4 real tarike — zero hype, sirf facts",
    "Budget banana band karo, ye karo instead",
    "EPF, PPF, NPS — kaunsa best hai apke liye?"
  ],
  fitness: [
    "Gym join kiye bina ghar pe transformation possible hai?",
    "Roz 30 minutes walk karne ke 5 unexpected fayde",
    "Protein ka sach — kitna chahiye aur kahan se milega",
    "Beginner ke liye pehle 30 din ka realistic workout plan",
    "Weight loss aur fat loss mein farak kya hai — clearly",
    "Indian diet mein protein kaise increase karein",
    "Sleep aur muscle building ka connection — koi nahi batata",
    "Ye 3 exercise galat kar rahe ho — form guide",
    "Cardio vs weight training — kya better hai fat loss ke liye",
    "Pre-workout meal kya khana chahiye — timing matters",
    "Overtraining ke signs — kab rukna chahiye?",
    "6-pack abs ke liye kitchen mein kya hona chahiye",
    "Injury se wapas fitness pe kaise aaye — safe guide",
    "Consistency kaise maintain karein — psychology behind it",
    "Water ka sahi amount — galat myths tod deta hoon"
  ],
  astrology: [
    "Aaj Shani ki drishti shift ho rahi hai — in 4 signs ke liye bada din",
    "Kundli mein ye yoga hai toh zindagi badal sakti hai",
    "Graho ka chakkar — October mein kya hone wala hai",
    "Mesh rashi walo ke liye is week special kya hai",
    "Mangal dosha — sach kya hai aur kitna serious hai?",
    "Numerology aur astrology mein connection — deep dive",
    "Rishton pe Shukra ka asar — pyaar aur career dono",
    "Rahu-Ketu 2025 mein kahan hain aur kya matlab hai",
    "Lagna kundli vs Chandra kundli — kaunsi zyada important?",
    "Kalpurush ke 12 bhav aur unka matlab simple bhasha mein",
    "Daily puja routine jo graho ko khush kare — practical guide",
    "Sade sati chal rahi hai? Ye upay zaroor karo",
    "Vivah muhurat 2025 — auspicious dates aur kaise choose karein",
    "Gemstone kab pehnte hain aur kab nahi — complete guide",
    "Aaj ka rashifal — Mesh se Meen tak, short aur clear"
  ],
  "self-discipline": [
    "Consistency ka raaz jo successful log kabhi share nahi karte",
    "Subah 5 baje uthne ka asli tarika — 90-day experiment result",
    "Phone addiction todna hai? Ye realistic plan try karo",
    "Procrastination kyun hoti hai — brain science aur fix",
    "Atomic Habits ka ek idea jo mere liye actually kaam aaya",
    "No-excuse morning routine for people who hate mornings",
    "1% better everyday — maths aur reality check",
    "Deep work karna seekho — Cal Newport se seekha",
    "Self-discipline aur willpower — dono alag hain, samjho kyun",
    "Hard days pe kaise motivated rehte hain — honest answer",
    "Digital detox ki pehli 24 ghante — kya hota hai",
    "Journal likhna shuru karo — ye 3 prompts se",
    "Weekly review kaise karte hain — system I follow",
    "Bura habit todne ka neuroscience — loop break karo",
    "Environment design — apni life ka blueprint banao"
  ],
  cooking: [
    "5 ingredients, 15 minutes — dinner ready for busy weeknights",
    "Dal tadka restaurant jaisi ghar pe — exact recipe",
    "Bread baking for beginners — no oven needed seriously",
    "Healthy tiffin ideas jo bachche bhi khayein",
    "Street food ghar pe banao — hygienically aur cheaply",
    "Leftover rice se 5 amazing dishes — zero waste kitchen",
    "Curd ke 7 unexpected uses in Indian cooking",
    "Knife skills basic — chopping speed 3x karo",
    "One-pot meals for hostel students — electric kettle recipes",
    "Masale preserve kaise karein — freshness banaye rakho",
    "Monsoon snacks — crispy aur quick 20-minute recipes",
    "Dosa batter perfect banana — common mistakes avoid karo",
    "Budget mein healthy khaana — ₹100 mein 3 meals plan",
    "Freezer meal prep — Sunday ko cook, poora week set",
    "Chai perfect banane ka actual science"
  ],
  fashion: [
    "10 pieces, 30 outfits — capsule wardrobe for Indian women",
    "Office wear on a budget — styling hacks that work",
    "Saree draping 5 different styles — step by step guide",
    "Colors that suit your skin tone — Indian undertone guide",
    "Fast fashion vs slow fashion — kahan khareedein 2025 mein",
    "Men's grooming basics that 80% Indian men ignore",
    "Thrift shopping India — best apps aur kaise find karein deals",
    "Monsoon fashion — stylish rehna bheegne se pehle",
    "Work from home outfits — comfortable but camera-ready",
    "Body type dressing — rules jo actually kaam karte hain",
    "Ethnic wear for corporate events — the right balance",
    "Sustainable brands India — quality aur conscience dono",
    "Wardrobe declutter challenge — 30 pieces mein set ho jaao",
    "Accessories under ₹500 that elevate any outfit",
    "Wedding guest outfits — kitni bar repeat karein?"
  ],
  tech: [
    "AI tools jo Indian freelancers ki productivity 10x kar dein",
    "ChatGPT prompts jo actually kaam karte hain — tested list",
    "Free tools replace karo ₹5000 ke software ko — complete list",
    "Cybersecurity basics — ye 5 cheezon se safe rahoge",
    "No-code tools se app banao — bina coding ke seriously",
    "LinkedIn profile optimize karna — tech jobs ke liye",
    "GitHub beginners guide — first repository step by step",
    "Best YouTube channels to learn coding in Hindi",
    "Remote jobs India mein kaise dhoondhein — proven strategy",
    "Cloud storage comparison — Google Drive vs OneDrive vs iCloud",
    "Automation karo apni life — Zapier aur n8n beginner guide",
    "Best budget laptops 2025 — under ₹40,000 real picks",
    "API kya hota hai — ek dum simple explanation",
    "Digital marketing skills jo 2025 mein demand mein hain",
    "AI image generation tools — free se shuru karo"
  ]
};

const GENERIC_TITLES = [
  "Why most people in this space get it completely wrong",
  "The one thing I wish I knew when I started — honest take",
  "3 things that changed everything for me this year",
  "Stop doing this if you want real results — real talk",
  "My honest review after 6 months of trying this",
  "What the top 1% actually do differently",
  "The biggest myth in this space — debunked with proof",
  "How to get 10x results with half the effort",
  "Things nobody tells you until it's too late",
  "My complete step-by-step process — nothing held back",
  "Why consistency beats talent every single time",
  "The underrated skill that changed my entire journey",
  "How I went from zero to results in 90 days",
  "Common mistakes I see beginners make — and how to fix them",
  "The truth about success that the internet hides from you",
];

function getSampleTitles(niche, count) {
  const titles = SAMPLE_TITLES[niche] || GENERIC_TITLES;
  const result = [];
  for (let i = 0; i < count; i++) result.push(titles[i % titles.length]);
  return result;
}

function countWords(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function getCaptionMinimum(platform) {
  const normalized = (platform || "").toLowerCase();
  if (normalized === "instagram") return { type: "words", min: 150 };
  if (normalized === "youtube") return { type: "words", min: 300 };
  if (normalized === "linkedin") return { type: "words", min: 200 };
  if (normalized === "twitter") return { type: "chars", min: 200 };
  return { type: "words", min: 150 };
}

function validateCaptionLength(platform, caption) {
  const rule = getCaptionMinimum(platform);
  if (rule.type === "chars") {
    const length = (caption || "").trim().length;
    return {
      valid: length >= rule.min,
      actual: length,
      unit: "characters",
      min: rule.min
    };
  }

  const length = countWords(caption);
  return {
    valid: length >= rule.min,
    actual: length,
    unit: "words",
    min: rule.min
  };
}

async function generateTitlesWithAI(niche, count, platform, language, tone) {
  try {
    // Add timestamp and random seed for variation
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 10000);
    
    const response = await fetch(BACKEND_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: `You are an expert content strategist for Indian ${platform} creators. Generate exactly ${count} UNIQUE and DIVERSE viral post titles for the ${niche} niche. Language: ${language}. Tone: ${tone}. IMPORTANT: Create completely different titles each time - avoid repetition. Return ONLY a JSON array of strings, no other text. Seed: ${randomSeed}`,
        messages: [{
          role: "user",
          content: `Generate ${count} engaging and VARIED post titles for ${niche} content on ${platform}. Make them scroll-stopping and relevant to Indian audiences. Each title should be unique and different from common templates. Request ID: ${timestamp}`
        }]
      })
    });

    if (!response.ok) {
      let details = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        details = errorData.message || errorData.error || details;
      } catch {}
      throw new Error(details);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    if (!text) {
      throw new Error("Empty response from API");
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const titles = JSON.parse(clean);

    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error("Invalid response format");
    }

    return titles.slice(0, count);
  } catch (error) {
    console.error("AI title generation failed:", error);
    // Fallback to template system
    return getSampleTitles(niche, count);
  }
}


function distributeDates(year, month, count, mode) {
  const dates = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  if (mode === "mon_wed_fri") {
    for (let d = 1; d <= daysInMonth && dates.length < count; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day === 1 || day === 3 || day === 5) dates.push(d);
    }
  } else if (mode === "tue_thu_sat") {
    for (let d = 1; d <= daysInMonth && dates.length < count; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day === 2 || day === 4 || day === 6) dates.push(d);
    }
  } else if (mode === "even_dates") {
    for (let d = 2; d <= daysInMonth && dates.length < count; d += 2) dates.push(d);
  } else if (mode === "odd_dates") {
    for (let d = 1; d <= daysInMonth && dates.length < count; d += 2) dates.push(d);
  } else {
    for (let d = 1; d <= daysInMonth && dates.length < count; d++) dates.push(d);
  }
  while (dates.length < count) {
    const last = dates[dates.length - 1];
    if (last < daysInMonth) dates.push(last + 1);
    else break;
  }
  return dates.slice(0, count);
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const icon = type === "success" ? "✓" : type === "warning" ? "⚠" : "ℹ";
  return (
    <div className={`toast toast-${type}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ color: type === "success" ? "var(--accent-sage)" : type === "warning" ? "var(--accent-gold)" : "var(--accent-sky)", fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{msg}</span>
    </div>
  );
}

// ─── AURORA BACKGROUND ────────────────────────────────────────────────────────
function AuroraBg() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob" />
      <div className="aurora-blob" />
      <div className="aurora-blob" />
    </div>
  );
}

// ─── PARTICLE HERO ────────────────────────────────────────────────────────────
function ParticleHero() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? "rgba(200,147,74," : "rgba(122,90,196,",
      t: Math.random() * Math.PI * 2,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.t += 0.01;
        p.x += p.vx + Math.sin(p.t) * 0.1;
        p.y += p.vy + Math.cos(p.t * 0.7) * 0.1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const alpha = 0.4 + Math.sin(p.t) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ")";
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(200,147,74,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

// LANDING PAGE
function LandingPage({ onLogin }) {
  const showcasePost = DEMO_POSTS.exam_instagram_hinglish;
  const startupPost = DEMO_POSTS.startup_linkedin_english;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <AuroraBg />

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-violet))", boxShadow: "0 0 15px rgba(200,147,74,0.4)" }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, letterSpacing: "-0.01em" }}>SrijanAI</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-ghost btn-sm" onClick={onLogin}>Login</button>
          <button className="btn-primary btn-sm" onClick={onLogin}>Start Free ✨</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: 80 }}>
        <ParticleHero />

        {/* Floating orbs */}
        <div style={{ position: "absolute", left: "12%", top: "25%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,147,74,0.25), transparent)", filter: "blur(40px)", animation: "float 7s ease-in-out infinite" }} />
        <div style={{ position: "absolute", right: "12%", top: "40%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(122,90,196,0.25), transparent)", filter: "blur(40px)", animation: "float 9s ease-in-out infinite", animationDelay: "2s" }} />
        <div style={{ position: "absolute", left: "45%", bottom: "20%", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,130,196,0.2), transparent)", filter: "blur(30px)", animation: "float 5s ease-in-out infinite", animationDelay: "4s" }} />

        <div style={{ textAlign: "center", maxWidth: 800, padding: "0 24px", position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 24, opacity: 0, animation: "fadeUp 0.6s ease 0.1s forwards" }}>
            AI × CONTENT × INDIA
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 7vw, 72px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 24, opacity: 0, animation: "fadeUp 0.7s ease 0.3s forwards" }}>
            Your Content.
            <br />Every Month.
            <br /><em className="text-gold-gradient" style={{ fontStyle: "italic" }}>Automated.</em>
          </h1>
          <p style={{ fontSize: 17, fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 36px", opacity: 0, animation: "fadeUp 0.6s ease 0.5s forwards" }}>
            India ka pehla AI Content Planner — Hindi, English aur Hinglish mein
            Instagram, YouTube aur LinkedIn ke liye posts automatically generate karta hai.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", opacity: 0, animation: "fadeUp 0.5s ease 0.7s forwards" }}>
            <button className="btn-primary" onClick={onLogin} style={{ fontSize: 15, padding: "14px 36px" }}>
              Start for Free ✨
            </button>
            <button className="btn-ghost" onClick={onLogin} style={{ fontSize: 15, padding: "14px 36px" }}>
              Demo Login →
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "80px 32px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 500 }}>Four steps to a full month</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { n: "01", t: "Pick Your Niche & Platform", d: "Choose from 10 niches and 4 platforms" },
            { n: "02", t: "Set Posts Per Month", d: "8, 12, 15, or 30 posts with smart distribution" },
            { n: "03", t: "Get Calendar + Titles", d: "AI generates unique, viral-worthy titles instantly" },
            { n: "04", t: "Auto-Generate at 9 AM", d: "Full captions, hooks & hashtags — every scheduled day" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 24, animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 500, color: "var(--accent-gold)", marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hinglish Showcase */}
      <section style={{ padding: "60px 32px", position: "relative", zIndex: 1 }}>
        <AuroraBg />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>LIVE EXAMPLES</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 500 }}>AI-Generated Posts, Right Now</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <DemoPostCard post={showcasePost} platform="Instagram" niche="Exam Tips" lang="Hinglish" color="var(--accent-rose)" />
            <DemoPostCard post={startupPost} platform="LinkedIn" niche="Startup" lang="English" color="var(--accent-sky)" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "80px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 400, marginBottom: 16 }}>
          Start Your <em className="text-gold-gradient" style={{ fontStyle: "italic" }}>Content Journey</em>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>
          Join thousands of Indian micro-creators automating their content.
        </p>
        <button className="btn-primary animate-pulse-glow" onClick={onLogin} style={{ fontSize: 16, padding: "16px 48px" }}>
          Create Free Account →
        </button>
      </section>
    </div>
  );
}

function DemoPostCard({ post, platform, niche, lang, color }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{platform}</span>
        <span className="badge badge-pending">{niche}</span>
        <span style={{ background: "rgba(122,90,196,0.12)", color: "var(--accent-violet)", border: "1px solid rgba(122,90,196,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{lang}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.4 }}>
        🎣 {post.hook}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line", maxHeight: 80, overflow: "hidden" }}>
        {post.caption}
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--accent-gold)" }}>
        💡 {post.platform_note}
      </div>
    </div>
  );
}

// AUTH PAGE
function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onAuth({ name: name || email.split("@")[0] || "Creator", email });
    setLoading(false);
  };

  const demoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onAuth({ name: "Dhananjay Narula", email: "demo@creator.in" });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      <AuroraBg />
      {/* Left panel */}
      <div style={{ flex: 1, display: "none", background: "linear-gradient(135deg, var(--bg-surface) 0%, #0C0C18 100%)", borderRight: "1px solid var(--border)", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }} className="auth-left">
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-violet))", margin: "0 auto 24px", animation: "float 5s ease-in-out infinite", boxShadow: "0 0 40px rgba(200,147,74,0.4)" }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 16 }}>
            India ka pehla<br /><em className="text-gold-gradient">AI Content Planner</em>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>
            Apna niche choose karo, schedule set karo,<br />aur baaki sab AI handle karega.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-violet))", boxShadow: "0 0 15px rgba(200,147,74,0.4)" }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>SrijanAI</span>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
            {isLogin ? "Log in to your content dashboard" : "Start automating your content today"}
          </p>

          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isLogin && (
              <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            )}
            <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ marginTop: 4, fontSize: 15, padding: "14px" }} disabled={loading}>
              {loading ? <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
              </span> : (isLogin ? "Sign In →" : "Create Account →")}
            </button>
          </form>

          <div className="divider" />

          <button className="btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={demoLogin} disabled={loading}>
            {loading ? "Loading..." : "⚡ Demo Login (demo@creator.in)"}
          </button>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: "var(--accent-gold)", cursor: "pointer" }} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// DASHBOARD
function DashboardPage({ user, plans, onNewPlan, onViewCalendar }) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ padding: "96px 32px 48px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1, animation: "fadeUp 0.5s ease" }}>
      <AuroraBg />

      {/* Hero greeting */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>DASHBOARD</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 400, marginBottom: 8 }}>
          {greeting()}, {user.name} ☀️
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          {plans.length === 0 ? "Create your first content plan to get started." : `You have ${plans.length} active plan${plans.length > 1 ? "s" : ""} this month.`}
        </p>
      </div>

      {/* Visual orb display */}
      {plans.length > 0 && (
        <div style={{ display: "flex", gap: 32, alignItems: "center", justifyContent: "center", padding: "32px 0 40px", marginBottom: 24 }}>
          {plans.slice(0, 4).map((p, i) => {
            const color = NICHE_COLORS[p.niche] || "var(--accent-gold)";
            const sizes = [80, 60, 70, 50];
            return (
              <div key={p.id} onClick={() => onViewCalendar(p)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: sizes[i % sizes.length], height: sizes[i % sizes.length],
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%, ${color}, ${color}44)`,
                  boxShadow: `0 0 30px ${color}44, 0 0 60px ${color}22`,
                  animation: `float ${5 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 1.5}s`,
                  transition: "transform 0.2s",
                }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>{p.niche}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Plans grid */}
      {plans.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", border: "2px dashed var(--border)", borderRadius: 24, gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✨</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500 }}>No plans yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Create your first AI content plan to get started</p>
          <button className="btn-primary" onClick={onNewPlan} style={{ marginTop: 8 }}>＋ Create First Plan</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {plans.map(p => <PlanCard key={p.id} plan={p} onView={() => onViewCalendar(p)} />)}
        </div>
      )}

      {/* FAB */}
      <button onClick={onNewPlan} style={{
        position: "fixed", bottom: 28, right: 28,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-lt))",
        border: "none", cursor: "pointer", fontSize: 24, zIndex: 200,
        boxShadow: "var(--glow-gold), 0 4px 20px rgba(0,0,0,0.4)",
        transition: "transform 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
      }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        ＋
      </button>
    </div>
  );
}

function PlanCard({ plan, onView }) {
  const generated = plan.posts.filter(p => p.status === "generated").length;
  const total = plan.posts.length;
  const pct = total > 0 ? (generated / total) * 100 : 0;
  const next = plan.posts.find(p => p.status === "pending" || p.status === "confirmed");
  const nColor = NICHE_COLORS[plan.niche] || "var(--accent-gold)";

  return (
    <div className="card" style={{ padding: 24, animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <span style={{ background: `${nColor}22`, color: nColor, border: `1px solid ${nColor}44`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{plan.niche}</span>
        </div>
        <span style={{ fontSize: 20 }}>{PLATFORMS.find(p => p.id === plan.platform)?.icon || "📱"}</span>
      </div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, marginBottom: 6 }}>
        {plan.niche.charAt(0).toUpperCase() + plan.niche.slice(1)} · {plan.platform.charAt(0).toUpperCase() + plan.platform.slice(1)}
      </h3>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        {plan.language} · {plan.tone} · {total} posts
      </div>
      <div className="progress-bar" style={{ marginBottom: 8 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        <span>{generated}/{total} generated</span>
        {next && <span>Next: {plan.month}-{String(next.day).padStart(2, "0")}</span>}
      </div>
      <button className="btn-ghost btn-sm" style={{ width: "100%" }} onClick={onView}>View Calendar →</button>
    </div>
  );
}

// CREATE PLAN WIZARD
function CreatePlanPage({ onBack, onCreate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    niche: "", platform: "", language: "hinglish", tone: "Motivational",
    posts_per_month: 15, distribution_mode: "mon_wed_fri", month: "2025-08"
  });
  const [customNiche, setCustomNiche] = useState("");
  const [customPosts, setCustomPosts] = useState("");
  const [useCustomPosts, setUseCustomPosts] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Resolve the actual niche key for title lookup (custom uses the typed label, lowercase-slugged)
  const resolvedNiche = form.niche === "custom"
    ? (customNiche.trim().toLowerCase().replace(/\s+/g, "-") || "custom")
    : form.niche;

  const resolvedPosts = useCustomPosts
    ? (parseInt(customPosts) || 1)
    : form.posts_per_month;

  const previewDates = distributeDates(2025, 8, resolvedPosts, form.distribution_mode);

  const handleCreate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    
    // Generate titles using AI
    const titles = await generateTitlesWithAI(
      resolvedNiche,
      resolvedPosts,
      form.platform,
      form.language,
      form.tone
    );
    
    const posts = previewDates.map((day, i) => ({
      id: `post-${Date.now()}-${i}`,
      title: titles[i],
      day,
      status: "pending",
      generatedPost: null,
    }));
    const displayNiche = form.niche === "custom" ? (customNiche.trim() || "Custom") : form.niche;
    onCreate({ ...form, niche: displayNiche, posts_per_month: resolvedPosts, id: `plan-${Date.now()}`, posts, createdAt: new Date() });
    setLoading(false);
  };

  const step1Valid = form.niche && form.platform && (form.niche !== "custom" || customNiche.trim().length > 0);

  const [yr, mo] = form.month.split("-").map(Number);
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const firstDow = new Date(yr, mo - 1, 1).getDay();

  return (
    <div style={{ padding: "96px 24px 48px", maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1, animation: "fadeUp 0.5s ease" }}>
      <AuroraBg />

      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back
      </button>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 40 }}>
        <div className={`step-dot ${step >= 1 ? "step-dot-active" : "step-dot-inactive"}`} />
        <div className={`step-dot ${step >= 2 ? "step-dot-active" : step === 2 ? "step-dot-inactive" : "step-dot-inactive"}`} />
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>Step {step} of 2</span>
      </div>

      {step === 1 && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Choose your niche & style</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 36 }}>Tell us who you are and who you create for</p>

          <label style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>YOUR NICHE</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: form.niche === "custom" ? 12 : 28 }}>
            {NICHES.map(n => (
              <div key={n.id} className={`niche-card ${form.niche === n.id ? "selected" : ""}`} onClick={() => set("niche", n.id)}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{n.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: form.niche === n.id ? "var(--accent-gold)" : "var(--text-secondary)" }}>{n.label}</div>
              </div>
            ))}
          </div>

          {/* Custom niche text input — only shown when "custom" is selected */}
          {form.niche === "custom" && (
            <div style={{ marginBottom: 28, animation: "fadeUp 0.3s ease" }}>
              <input
                className="input-field"
                placeholder="e.g. Anime Reviews, Spiritual Healing, Pet Care..."
                value={customNiche}
                onChange={e => setCustomNiche(e.target.value)}
                autoFocus
                style={{ borderColor: customNiche.trim() ? "var(--accent-gold)" : undefined }}
              />
              {customNiche.trim() && (
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                  ✓ Niche set to: <span style={{ color: "var(--accent-gold)" }}>{customNiche.trim()}</span>
                </div>
              )}
            </div>
          )}

          <label style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>PLATFORM</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            {PLATFORMS.map(p => (
              <button key={p.id} className={`platform-btn ${form.platform === p.id ? "selected" : ""}`} onClick={() => set("platform", p.id)}>
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>LANGUAGE</label>
          <div className="seg-control" style={{ marginBottom: 28 }}>
            {["english", "hindi", "hinglish"].map(l => (
              <button key={l} className={`seg-btn ${form.language === l ? "active" : ""}`} onClick={() => set("language", l)}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>TONE</label>
          <select className="input-field" value={form.tone} onChange={e => set("tone", e.target.value)} style={{ marginBottom: 36 }}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>

          <button className="btn-primary" style={{ width: "100%", fontSize: 15, padding: 15 }} disabled={!step1Valid} onClick={() => setStep(2)}>
            Next: Set Schedule →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Set your schedule</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 36 }}>How often do you want to post?</p>

          <label style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>POSTS PER MONTH</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 28 }}>
            {[8, 12, 15, 30].map(n => (
              <div key={n} className={`freq-card ${!useCustomPosts && form.posts_per_month === n ? "selected" : ""}`}
                onClick={() => { set("posts_per_month", n); setUseCustomPosts(false); }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 500, color: !useCustomPosts && form.posts_per_month === n ? "var(--accent-gold)" : "var(--text-primary)" }}>{n}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>posts</div>
              </div>
            ))}
            {/* Custom posts card */}
            <div className={`freq-card ${useCustomPosts ? "selected" : ""}`} onClick={() => setUseCustomPosts(true)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {useCustomPosts ? (
                <input
                  type="number"
                  min={1} max={31}
                  value={customPosts}
                  onChange={e => setCustomPosts(e.target.value)}
                  placeholder="?"
                  onClick={e => e.stopPropagation()}
                  autoFocus
                  style={{
                    width: "100%", background: "transparent", border: "none", outline: "none",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 500,
                    color: "var(--accent-gold)", textAlign: "center",
                    MozAppearance: "textfield",
                  }}
                />
              ) : (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 500, color: "var(--text-muted)" }}>✏️</div>
              )}
              <div style={{ fontSize: 11, color: useCustomPosts ? "var(--accent-gold)" : "var(--text-muted)", marginTop: 4 }}>custom</div>
            </div>
          </div>

          <label style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>DISTRIBUTION</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {[
              ["mon_wed_fri", "Mon/Wed/Fri"],
              ["tue_thu_sat", "Tue/Thu/Sat"],
              ["even_dates", "Even Dates"],
              ["odd_dates", "Odd Dates"],
              ["daily", "Daily"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => set("distribution_mode", id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: `1px solid ${form.distribution_mode === id ? "var(--accent-gold)" : "var(--border)"}`,
                  background: form.distribution_mode === id ? "rgba(200,147,74,0.1)" : "var(--bg-surface-2)",
                  color: form.distribution_mode === id ? "var(--accent-gold)" : "var(--text-secondary)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontWeight: form.distribution_mode === id ? 600 : 400,
                }}
              >{label}</button>
            ))}
          </div>

          {/* Mini calendar preview */}
          <label style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>PREVIEW — AUGUST 2025</label>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)", padding: "4px 0" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const active = previewDates.includes(day);
                return (
                  <div key={day} className={`mini-dot ${active ? "mini-dot-active" : "mini-dot-inactive"}`} style={{ margin: "0 auto" }}>
                    {day}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
              {previewDates.length} posts highlighted in gold
            </div>
          </div>

          <button className="btn-primary" style={{ width: "100%", fontSize: 15, padding: 15 }} onClick={handleCreate}
            disabled={loading || (useCustomPosts && (!parseInt(customPosts) || parseInt(customPosts) < 1))}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                <span style={{ marginLeft: 4, color: "#0A0805" }}>Generating your calendar…</span>
              </span>
            ) : "Generate My Calendar ✨"}
          </button>
        </div>
      )}
    </div>
  );
}

// CALENDAR PAGE
function CalendarPage({ plan, onBack, onUpdate, addToast }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [yr, mo] = plan.month.split("-").map(Number);
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const firstDow = new Date(yr, mo - 1, 1).getDay();

  const postByDay = {};
  plan.posts.forEach(p => { postByDay[p.day] = p; });

  const stats = {
    total: plan.posts.length,
    generated: plan.posts.filter(p => p.status === "generated").length,
    pending: plan.posts.filter(p => p.status === "pending").length,
    skipped: plan.posts.filter(p => p.status === "skipped").length,
    confirmed: plan.posts.filter(p => p.status === "confirmed").length,
  };

  const updatePost = (id, changes) => {
    onUpdate({ ...plan, posts: plan.posts.map(p => p.id === id ? { ...p, ...changes } : p) });
  };

  const simulateGenerate = async (post) => {
    setGenerating(post.id);
    updatePost(post.id, { status: "confirmed" });
    await new Promise(r => setTimeout(r, 1500));

    // Platform-specific content guidelines
    const platformGuidelines = {
      instagram: {
        captionLength: "150-300 words (2200 characters max)",
        hookLength: "1-2 punchy lines",
        hashtagCount: "20-30 hashtags",
        style: "Visual storytelling, emojis encouraged, conversational",
        maxTokens: 1200
      },
      youtube: {
        captionLength: "300-500 words (detailed description)",
        hookLength: "Compelling 2-3 line intro",
        hashtagCount: "10-15 hashtags",
        style: "Detailed, informative, include timestamps if relevant",
        maxTokens: 1500
      },
      linkedin: {
        captionLength: "200-400 words (professional but engaging)",
        hookLength: "Strong professional hook (2-3 lines)",
        hashtagCount: "5-10 relevant hashtags",
        style: "Professional insights, data-driven, thought leadership",
        maxTokens: 1300
      },
      twitter: {
        captionLength: "200-280 characters (concise and punchy)",
        hookLength: "First 100 characters must grab attention",
        hashtagCount: "2-5 hashtags max",
        style: "Brief, witty, thread-worthy if needed",
        maxTokens: 800
      }
    };

    const guidelines = platformGuidelines[plan.platform.toLowerCase()] || platformGuidelines.instagram;

    const parseGeneratedPost = (text) => {
      if (!text) {
        throw new Error("Empty response from API");
      }

      let clean = text.replace(/```json|```/g, "").trim();
      let parsed;

      try {
        parsed = JSON.parse(clean);
      } catch (firstError) {
        console.log("First parse failed, attempting to fix JSON...");
        clean = clean
          .replace(/\r\n/g, "\\n")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t")
          .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");

        try {
          parsed = JSON.parse(clean);
        } catch (secondError) {
          console.error("JSON parse failed even after cleanup:", clean.substring(0, 500));
          throw new Error(`JSON parsing failed: ${secondError.message}`);
        }
      }

      const requiredFields = ["hook", "caption", "hashtags", "cta", "platform_note"];
      const missingFields = requiredFields.filter(field => !parsed[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const captionCheck = validateCaptionLength(plan.platform, parsed.caption);
      if (!captionCheck.valid) {
        throw new Error(`Caption too short: ${captionCheck.actual} ${captionCheck.unit}, expected at least ${captionCheck.min}`);
      }

      return parsed;
    };

    const buildPrompt = (strictLength = false) => ({
      model: CLAUDE_MODEL,
      max_tokens: guidelines.maxTokens,
      system: `You are an expert content creator for Indian ${plan.platform} creators. Return ONLY valid JSON with these exact keys: hook, caption, hashtags, cta, platform_note.

PLATFORM: ${plan.platform}
LANGUAGE: ${plan.language}
TONE: ${plan.tone}
NICHE: ${plan.niche}

PLATFORM-SPECIFIC REQUIREMENTS:
- Caption Length: ${guidelines.captionLength}
- Hook Style: ${guidelines.hookLength}
- Hashtags: ${guidelines.hashtagCount}
- Content Style: ${guidelines.style}

RULES:
1. hook: ${guidelines.hookLength} that stops the scroll
2. caption: Full post body at ${guidelines.captionLength}. Use \\n for line breaks (NOT actual newlines). ${plan.language === "hinglish" ? "Use natural Hinglish as Indian creators do." : ""}
3. hashtags: ${guidelines.hashtagCount}, space-separated, MUST include # symbol before each tag (e.g., "#ContentCreator #IndianCreators #Viral")
4. cta: Warm, platform-appropriate call-to-action
5. platform_note: One practical ${plan.platform} posting tip
${strictLength ? `6. LENGTH COMPLIANCE IS MANDATORY: if the caption is shorter than the required minimum for ${plan.platform}, your answer is invalid. Expand the caption with more substance, examples, and detail before returning.` : ""}

CRITICAL: Use \\n for line breaks, not actual newlines. Return ONLY valid JSON that can be parsed by JSON.parse().`,
      messages: [{
        role: "user",
        content: `Create a complete ${plan.platform} post for this title: "${post.title}". Make it ${guidelines.captionLength} with ${plan.tone} tone in ${plan.language}. Niche: ${plan.niche}.${strictLength ? " Do not return a short caption. Add enough detail to fully satisfy the minimum platform length requirement." : ""}`
      }]
    });

    // Call Claude API via backend proxy
    let generatedPost;
    try {
      const fetchGeneratedPost = async (strictLength = false) => {
        const response = await fetch(BACKEND_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(buildPrompt(strictLength))
        });

        if (!response.ok) {
          let details = `API error: ${response.status}`;
          try {
            const errorData = await response.json();
            details = errorData.message || errorData.error || details;
          } catch {}
          throw new Error(details);
        }

        const data = await response.json();
        return parseGeneratedPost(data.content?.[0]?.text || "");
      };

      try {
        generatedPost = await fetchGeneratedPost(false);
      } catch (error) {
        if (!String(error.message || "").includes("Caption too short")) {
          throw error;
        }
        console.warn("Caption too short on first attempt, retrying with stricter length instruction.");
        generatedPost = await fetchGeneratedPost(true);
      }
    } catch (error) {
      console.error("AI generation failed:", error.message);
      // Fallback to demo data
      const key = `${plan.niche}_${plan.platform}_${plan.language}`;
      generatedPost = DEMO_POSTS[key] || DEMO_POSTS.exam_instagram_hinglish;
    }

    updatePost(post.id, { status: "generated", generatedPost });
    setGenerating(null);
    addToast(`"${post.title.slice(0, 30)}…" is ready! 🎉`, "success");
  };

  const nColor = NICHE_COLORS[plan.niche] || "var(--accent-gold)";

  return (
    <div style={{ padding: "96px 20px 48px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1, animation: "fadeUp 0.4s ease" }}>
      <AuroraBg />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>← Dashboard</button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500 }}>
            {plan.niche.charAt(0).toUpperCase() + plan.niche.slice(1)} · {plan.platform.charAt(0).toUpperCase() + plan.platform.slice(1)} · {plan.language.charAt(0).toUpperCase() + plan.language.slice(1)}
          </h1>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>August 2025</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="badge badge-pending">{stats.pending} pending</span>
          <span className="badge badge-confirmed">{stats.confirmed} confirmed</span>
          <span className="badge badge-generated">{stats.generated} generated</span>
          {stats.skipped > 0 && <span className="badge badge-skipped">{stats.skipped} skipped</span>}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 20px", marginBottom: 24, display: "flex", gap: 24, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{stats.total} posts total</span>
        <div className="progress-bar" style={{ flex: 1, height: 4 }}>
          <div className="progress-fill" style={{ width: `${(stats.generated / stats.total) * 100}%` }} />
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
          {stats.generated}/{stats.total}
        </span>
      </div>

      {/* Calendar grid */}
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", padding: "6px 0", letterSpacing: "0.05em" }}>{d}</div>
          ))}
        </div>
        <div className="cal-grid">
          {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} className="cal-cell cal-cell-inactive" />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const post = postByDay[day];
            if (!post) return (
              <div key={day} className="cal-cell cal-cell-inactive" style={{ minHeight: 90 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>{day}</span>
              </div>
            );
            const isGenerating = generating === post.id;
            return (
              <div key={day} className={`cal-cell ${post.status === "generated" ? "cal-cell-generated" : "cal-cell-active"}`} style={{ animationDelay: `${day * 0.02}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: nColor, fontWeight: 500 }}>{day}</span>
                  <span className={`badge badge-${post.status}`} style={{ fontSize: 9 }}>{post.status}</span>
                </div>
                {editingId === post.id ? (
                  <div>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: "100%", background: "var(--bg-surface-3)", border: "1px solid var(--accent-gold)", borderRadius: 4, color: "var(--text-primary)", fontSize: 11, padding: "3px 6px", fontFamily: "'Outfit', sans-serif", marginBottom: 4 }} />
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ flex: 1, background: "var(--accent-gold)", color: "#0A0805", border: "none", borderRadius: 4, fontSize: 10, padding: "3px", cursor: "pointer" }}
                        onClick={() => { updatePost(post.id, { title: editTitle, status: "confirmed" }); setEditingId(null); }}>Save</button>
                      <button style={{ flex: 1, background: "var(--bg-surface-3)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 10, padding: "3px", cursor: "pointer" }} onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", color: "var(--text-primary)" }}>
                      {post.title}
                    </div>
                    {isGenerating ? (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center", padding: "4px 0" }}>
                        <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                      </div>
                    ) : post.status === "generated" ? (
                      <button style={{ width: "100%", background: "rgba(74,130,196,0.15)", border: "1px solid rgba(74,130,196,0.3)", borderRadius: 6, color: "var(--accent-sky)", fontSize: 10, padding: "4px", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                        onClick={() => setSelectedPost(post)}>
                        View Post →
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {post.status !== "confirmed" && (
                          <button style={{ flex: 1, minWidth: 20, background: "rgba(90,138,106,0.15)", border: "1px solid rgba(90,138,106,0.3)", borderRadius: 4, color: "var(--accent-sage)", fontSize: 9, padding: "3px 2px", cursor: "pointer" }}
                            onClick={() => { updatePost(post.id, { status: "confirmed" }); addToast("Post confirmed!", "success"); }}>✓</button>
                        )}
                        <button style={{ flex: 1, minWidth: 20, background: "rgba(90,90,114,0.1)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-muted)", fontSize: 9, padding: "3px 2px", cursor: "pointer" }}
                          onClick={() => { updatePost(post.id, { status: "skipped" }); addToast("Post skipped", "info"); }}>✗</button>
                        <button style={{ flex: 1, minWidth: 20, background: "rgba(200,147,74,0.1)", border: "1px solid rgba(200,147,74,0.2)", borderRadius: 4, color: "var(--accent-gold)", fontSize: 9, padding: "3px 2px", cursor: "pointer" }}
                          onClick={() => { setEditingId(post.id); setEditTitle(post.title); }}>✎</button>
                        <button style={{ flex: 2, minWidth: 40, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-lt))", border: "none", borderRadius: 4, color: "#0A0805", fontSize: 9, padding: "3px 2px", cursor: "pointer", fontWeight: 600 }}
                          onClick={() => simulateGenerate(post)}>⚡ Gen</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && selectedPost.generatedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onRegenerate={() => { setSelectedPost(null); simulateGenerate(selectedPost); }} addToast={addToast} />
      )}
    </div>
  );
}

// POST DETAIL MODAL
function PostDetailModal({ post, onClose, onRegenerate, addToast }) {
  const gp = post.generatedPost;
  const tags = gp.hashtags.split(" ").filter(Boolean);

  const copyAll = () => {
    const text = `${gp.hook}\n\n${gp.caption}\n\n${gp.hashtags}\n\n${gp.cta}`;
    navigator.clipboard.writeText(text);
    addToast("Copied to clipboard! ✓", "success");
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content scroll-area" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, lineHeight: 1.3, maxWidth: 480 }}>
              {post.title}
            </h2>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <span className="badge badge-generated">Generated</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>Aug {post.day}, 2025</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border)", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "var(--text-muted)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Hook */}
        <div style={{ background: "rgba(200,147,74,0.06)", border: "1px solid rgba(200,147,74,0.2)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>🎣 HOOK</div>
          <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.5, color: "var(--text-primary)" }}>{gp.hook}</div>
        </div>

        {/* Caption */}
        <div style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>📝 CAPTION</div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)", whiteSpace: "pre-line" }}>{gp.caption}</div>
        </div>

        {/* Hashtags */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>#️⃣ HASHTAGS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tags.map((tag, i) => (
              <span key={i} className="hashtag-pill" onClick={() => { navigator.clipboard.writeText(tag); addToast(`Copied ${tag}`, "info"); }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "rgba(200,147,74,0.06)", border: "1px solid rgba(200,147,74,0.15)", borderLeft: "3px solid var(--accent-gold)", borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>📢 CTA</div>
          <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{gp.cta}</div>
        </div>

        {/* Platform note */}
        <div style={{ background: "rgba(90,138,106,0.08)", border: "1px solid rgba(90,138,106,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--accent-sage)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>💡 PLATFORM TIP</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{gp.platform_note}</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ flex: 2 }} onClick={copyAll}>Copy All ✓</button>
          <button className="btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { navigator.clipboard.writeText(gp.caption); addToast("Caption copied!", "success"); }}>Copy Caption</button>
          <button className="btn-ghost btn-sm" style={{ flex: 1 }} onClick={onRegenerate}>↺ Regenerate</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Load initial state from localStorage
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('srijanai_page');
    return saved || "landing";
  });
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('srijanai_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('srijanai_plans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentPlan, setCurrentPlan] = useState(() => {
    const saved = localStorage.getItem('srijanai_currentPlan');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [toasts, setToasts] = useState([]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('srijanai_page', page);
  }, [page]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('srijanai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('srijanai_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('srijanai_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem('srijanai_currentPlan', JSON.stringify(currentPlan));
    } else {
      localStorage.removeItem('srijanai_currentPlan');
    }
  }, [currentPlan]);

  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const handleAuth = (u) => {
    setUser(u);
    setPage("dashboard");
    addToast(`Welcome back, ${u.name}! 👋`, "success");
  };

  const handleNewPlan = () => setPage("create");

  const handleCreatePlan = (plan) => {
    setPlans(p => [...p, plan]);
    setCurrentPlan(plan);
    setPage("calendar");
    addToast(`Calendar created! ${plan.posts.length} posts ready ✨`, "success");
  };

  const handleUpdatePlan = (updated) => {
    setPlans(p => p.map(x => x.id === updated.id ? updated : x));
    setCurrentPlan(updated);
  };

  const handleViewCalendar = (plan) => {
    setCurrentPlan(plan);
    setPage("calendar");
  };

  const handleLogout = () => {
    setUser(null); 
    setPlans([]); 
    setCurrentPlan(null); 
    setPage("landing");
    // Clear localStorage on logout
    localStorage.removeItem('srijanai_user');
    localStorage.removeItem('srijanai_plans');
    localStorage.removeItem('srijanai_currentPlan');
    localStorage.setItem('srijanai_page', 'landing');
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}>
      <FontLoader />

      {/* Navbar for authenticated pages */}
      {user && (
        <nav className="navbar" style={{ zIndex: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("dashboard")}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-violet))", boxShadow: "0 0 15px rgba(200,147,74,0.4)" }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>SrijanAI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {page !== "dashboard" && (
              <button className="btn-ghost btn-sm" onClick={() => setPage("dashboard")}>Dashboard</button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-gold)44, var(--accent-violet)44)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "var(--accent-gold)" }}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{user.name}</span>
            </div>
            <button className="btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      )}

      {/* Pages */}
      {page === "landing" && <LandingPage onLogin={() => setPage("auth")} />}
      {page === "auth" && <AuthPage onAuth={handleAuth} />}
      {page === "dashboard" && user && <DashboardPage user={user} plans={plans} onNewPlan={handleNewPlan} onViewCalendar={handleViewCalendar} />}
      {page === "create" && <CreatePlanPage onBack={() => setPage("dashboard")} onCreate={handleCreatePlan} />}
      {page === "calendar" && currentPlan && <CalendarPage plan={currentPlan} onBack={() => setPage("dashboard")} onUpdate={handleUpdatePlan} addToast={addToast} />}

      {/* Toast container */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999 }}>
        {toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => setToasts(x => x.filter(tt => tt.id !== t.id))} />)}
      </div>
    </div>
  );
}
