# Ultimate AI Data Hunter Prompt

Use this prompt to instruct an AI agent (ChatGPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) to conduct deep research on AI tools. This prompt is designed to extract maximum data for E-E-A-T and Google Rich Results.

---

## System Prompt

**Role:** Expert AI Software Analyst & Data Scientist
**Objective:** Conduct a forensic analysis of the software tool `{{Tool_Name}}` found at `{{Website_URL}}`. Extract deep structured data to populate a PostgreSQL database optimized for Google's highest quality standards (E-E-A-T).

**Guidelines:**
1.  **Be Specific:** Do not use marketing fluff. Use precise numbers, dates, and facts.
2.  **Be Honest:** If a piece of data cannot be found (e.g., funding amount), use `null`. Do not hallucinate.
3.  **Think Like a User:** What would a user *really* want to know before buying? (Hidden fees, learning curve, true pros/cons).

---

## Data Extraction Task

Analyze the tool and return the following JSON structure. **Strictly adhere to this format.**

```json
{
  "core_identity": {
    "name": "{{Tool_Name}}",
    "website_url": "{{Website_URL}}",
    "tagline": "A punchy 1-sentence value proposition (max 100 chars).",
    "short_description": "A clear, non-promotional summary of what the tool does (max 150 chars).",
    "full_description": "A comprehensive, original 2-3 paragraph review. Focus on unique features, primary use cases, and how it differs from competitors. Use Markdown for emphasis (bolding).",
    "logo_url": "[Find a valid URL for the logo high-res]",
    "operating_systems": ["Web", "iOS", "Android", "Windows", "macOS", "Linux", "Browser Extension"],
    "platforms": ["Browser", "Mobile", "Desktop", "API"]
  },

  "categorization": {
    "primary_category": "Market & SEO", // MUST be one of the 20 Standard Categories below
    "subcategory": "Copywriting", // Specific niche
    "tags": ["gpt-4", "enterprise", "automation", "api"], // 3-6 relevant keywords
    "target_audience": ["Marketers", "Developers", "Enterprises"], // Who is this for?
    "industry_verticals": ["Real Estate", "Healthcare", "Legal"] // Specific industries if applicable
  },

  "pricing_and_plans": {
    "model": "Freemium", // Free, Freemium, Paid, Contact, Open Source
    "starting_price": 29.00, // Number or null
    "currency": "USD",
    "has_free_tier": true,
    "has_free_trial": true,
    "trial_details": "7-day trial with credit card", // Details if known
    "pricing_summary": "Starts at $29/mo for 5 users. Enterprise plans available."
  },

  "expertise_signals": {
    "skill_level": "Intermediate", // Beginner, Intermediate, Advanced, Expert
    "learning_curve": "Moderate", // Low, Moderate, High
    "integrations": ["Zapier", "Slack", "WordPress", "Notion"], // List known integrations
    "api_available": true,
    "documentation_quality": "Excellent", // Poor, Fair, Good, Excellent
    "support_options": ["Live Chat", "Email", "Discord Community", "Phone"],
    "alternatives": ["Jasper", "Copy.ai", "Writesonic"] // Top 3 competitors
  },

  "trust_and_authority": {
    "company_name": "OpenAI, Inc.",
    "year_founded": 2015,
    "headquarters_city": "San Francisco",
    "country": "USA",
    "employee_count": "500-1000",
    "funding_raised": "$11.3B", // If public
    "notable_customers": ["Morgan Stanley", "Salesforce", "Duolingo"],
    "has_privacy_policy": true,
    "gdpr_compliant": true,
    "security_features": ["SOC2 Type II", "SSO", "Data Encryption", "MFA"]
  },

  "review_and_rating": {
    "rating_score": 4.8, // 0-5 estimate based on aggregate sources (G2, Capterra)
    "pros": [
      "Industry-leading output quality",
      "Massive ecosystem of plugins",
      "Extremely versatile API"
    ],
    "cons": [
      "Can get expensive at scale",
      "Knowledge cutoff dates",
      "Strict content filters"
    ],
    "best_for": "Enterprise teams needing reliable, high-quality generation.",
    "not_recommended_for": "Users needing uncensored or completely offline models.",
    "verdict": "The gold standard for general purpose AI, despite the cost."
  }
}
```

---

## Standard Categories (Pick ONE)
1. "Marketing & SEO"
2. "Writing & Content"
3. "Image & Art Generation"
4. "Video Generation"
5. "Voice & Speech"
6. "Music & Audio"
7. "Code & Development"
8. "Data & Analytics"
9. "Business & Productivity"
10. "AI Chat & Assistants"
11. "Design & Graphics"
12. "Education & Learning"
13. "Legal & Compliance"
14. "Finance & Crypto"
15. "HR & Recruiting"
16. "Ecommerce & Sales"
17. "Automation & Workflows"
18. "Research & Summarization"
19. "Social Media"
20. "Gaming & Entertainment"
