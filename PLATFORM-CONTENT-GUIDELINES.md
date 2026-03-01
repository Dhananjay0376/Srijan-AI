# Platform-Specific Content Guidelines

## Overview
The AI Content Planner now generates platform-optimized content with appropriate lengths and styles for each social media platform.

---

## Instagram 📸

### Content Length
- **Caption**: 150-300 words (2200 characters max)
- **Hook**: 1-2 punchy lines
- **Hashtags**: 20-30 hashtags

### Style
- Visual storytelling
- Emojis encouraged
- Conversational and engaging
- Break text into short paragraphs

### Best Practices
- First 125 characters are crucial (shown before "more")
- Use line breaks for readability
- Mix popular and niche hashtags
- Include call-to-action

### AI Token Limit
1200 tokens

---

## YouTube 🎥

### Content Length
- **Description**: 300-500 words (detailed)
- **Hook**: Compelling 2-3 line intro
- **Hashtags**: 10-15 hashtags

### Style
- Detailed and informative
- Include timestamps if relevant
- SEO-optimized descriptions
- Link to related content

### Best Practices
- First 2-3 lines appear in search results
- Include relevant keywords
- Add chapter timestamps
- Link to playlists and other videos

### AI Token Limit
1500 tokens

---

## LinkedIn 💼

### Content Length
- **Post**: 200-400 words (professional but engaging)
- **Hook**: Strong professional hook (2-3 lines)
- **Hashtags**: 5-10 relevant hashtags

### Style
- Professional insights
- Data-driven content
- Thought leadership
- Industry-specific language

### Best Practices
- Start with a compelling question or stat
- Use bullet points for key takeaways
- Tag relevant people/companies
- Professional but conversational tone

### AI Token Limit
1300 tokens

---

## Twitter/X 🐦

### Content Length
- **Tweet**: 200-280 characters (concise and punchy)
- **Hook**: First 100 characters must grab attention
- **Hashtags**: 2-5 hashtags max

### Style
- Brief and witty
- Thread-worthy if needed
- Direct and impactful
- News-style or conversational

### Best Practices
- Get to the point immediately
- Use threads for longer content
- Engage with trending topics
- Keep hashtags minimal

### AI Token Limit
800 tokens

---

## Implementation Details

### How It Works
1. User selects platform when creating content plan
2. AI receives platform-specific guidelines in system prompt
3. Content is generated with appropriate:
   - Length (word count)
   - Style (tone and format)
   - Hashtag count
   - Hook structure

### Code Location
- File: `ai-content-planner.jsx`
- Function: `simulateGenerate()`
- Lines: ~1490-1560

### Platform Guidelines Object
```javascript
const platformGuidelines = {
  instagram: { captionLength, hookLength, hashtagCount, style, maxTokens },
  youtube: { ... },
  linkedin: { ... },
  twitter: { ... }
};
```

---

## Testing Checklist

- [ ] Instagram: 150-300 word captions with 20-30 hashtags
- [ ] YouTube: 300-500 word descriptions with 10-15 hashtags
- [ ] LinkedIn: 200-400 word posts with 5-10 hashtags
- [ ] Twitter: 200-280 character tweets with 2-5 hashtags

---

## Future Enhancements

### Potential Additions
- Facebook-specific guidelines
- TikTok caption optimization
- Pinterest description formatting
- Thread generation for Twitter
- Carousel post formatting for Instagram

### Advanced Features
- Character count validation
- Hashtag performance tracking
- A/B testing different lengths
- Platform-specific emoji suggestions

---

✅ Platform-optimized content generation is now active!
