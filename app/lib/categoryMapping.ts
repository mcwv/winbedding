// Map 600+ messy categories to 20 clean ones
export const MAIN_CATEGORIES = [
  "AI Chat & Assistants",
  "Image & Art Generation",
  "Video Generation",
  "Music & Audio",
  "Writing & Content",
  "Code & Development",
  "Business & Productivity",
  "Marketing & SEO",
  "Data & Analytics",
  "Design & Graphics",
  "Voice & Speech",
  "Translation & Language",
  "Education & Learning",
  "Research & Summarization",
  "Automation & Workflows",
  "E-commerce & Sales",
  "Social Media",
  "Gaming & Entertainment",
  "Finance & Crypto",
  "Other"
] as const

type MainCategory = typeof MAIN_CATEGORIES[number]

// Comprehensive mapping of messy categories to clean ones
const categoryMap: Record<string, MainCategory> = {
  // AI Chat & Assistants
  "chatbot": "AI Chat & Assistants",
  "ai assistant": "AI Chat & Assistants",
  "conversational ai": "AI Chat & Assistants",
  "virtual assistant": "AI Chat & Assistants",
  "ai chatbot": "AI Chat & Assistants",
  "chat": "AI Chat & Assistants",
  "assistant": "AI Chat & Assistants",
  "ai chat": "AI Chat & Assistants",
  "sex chatbot": "AI Chat & Assistants",
  "character ai": "AI Chat & Assistants",
  "companion": "AI Chat & Assistants",

  // Image & Art Generation
  "image generation": "Image & Art Generation",
  "image generator": "Image & Art Generation",
  "ai image": "Image & Art Generation",
  "art generator": "Image & Art Generation",
  "photo generator": "Image & Art Generation",
  "image": "Image & Art Generation",
  "art": "Image & Art Generation",
  "photo editing": "Image & Art Generation",
  "image editing": "Image & Art Generation",
  "avatar generator": "Image & Art Generation",
  "logo generator": "Image & Art Generation",
  "nude generator": "Image & Art Generation",
  "deep fake nude generator": "Image & Art Generation",
  "deep fake generator": "Image & Art Generation",
  "headshot generator": "Image & Art Generation",
  "portrait": "Image & Art Generation",
  "face swap": "Image & Art Generation",

  // Video Generation
  "video generator": "Video Generation",
  "video generation": "Video Generation",
  "ai video": "Video Generation",
  "video editing": "Video Generation",
  "video": "Video Generation",
  "music video generator": "Video Generation",
  "ai-video-generator，text-to-video": "Video Generation",
  "text-to-video": "Video Generation",
  "video editor": "Video Generation",
  "video creator": "Video Generation",

  // Music & Audio
  "music": "Music & Audio",
  "music generation": "Music & Audio",
  "music generator": "Music & Audio",
  "audio": "Music & Audio",
  "audio editing": "Music & Audio",
  "lyrics generator": "Music & Audio",
  "voice generator": "Music & Audio",
  "text-to-speech": "Voice & Speech",
  "speech-to-text": "Voice & Speech",
  "voice": "Voice & Speech",
  "voice cloning": "Voice & Speech",
  "podcast": "Music & Audio",

  // Writing & Content
  "writing": "Writing & Content",
  "content creation": "Writing & Content",
  "copywriting": "Writing & Content",
  "blog writing": "Writing & Content",
  "essay writing": "Writing & Content",
  "story generator": "Writing & Content",
  "paraphrasing": "Writing & Content",
  "grammar checker": "Writing & Content",
  "email": "Writing & Content",
  "email writing": "Writing & Content",
  "summarization": "Research & Summarization",
  "summary": "Research & Summarization",
  "document interaction": "Research & Summarization",

  // Code & Development
  "code": "Code & Development",
  "coding": "Code & Development",
  "programming": "Code & Development",
  "code generator": "Code & Development",
  "developer tools": "Code & Development",
  "code assistant": "Code & Development",
  "sql": "Code & Development",
  "no-code": "Code & Development",
  "low-code": "Code & Development",
  "website builder": "Code & Development",
  "app builder": "Code & Development",

  // Business & Productivity
  "productivity": "Business & Productivity",
  "task management": "Business & Productivity",
  "project management": "Business & Productivity",
  "note-taking": "Business & Productivity",
  "calendar": "Business & Productivity",
  "meeting assistant": "Business & Productivity",
  "scheduling": "Business & Productivity",
  "crm": "Business & Productivity",
  "business": "Business & Productivity",
  "hr": "Business & Productivity",
  "recruiting": "Business & Productivity",
  "utilities": "Business & Productivity",

  // Marketing & SEO
  "marketing": "Marketing & SEO",
  "seo": "Marketing & SEO",
  "digital marketing": "Marketing & SEO",
  "content marketing": "Marketing & SEO",
  "email marketing": "Marketing & SEO",
  "market research": "Marketing & SEO",
  "advertising": "Marketing & SEO",
  "ad generator": "Marketing & SEO",
  "landing page": "Marketing & SEO",

  // Data & Analytics
  "data analytics": "Data & Analytics",
  "analytics": "Data & Analytics",
  "data": "Data & Analytics",
  "data management": "Data & Analytics",
  "data visualization": "Data & Analytics",
  "chart generator": "Data & Analytics",
  "dashboard": "Data & Analytics",
  "spreadsheet": "Data & Analytics",
  "database": "Data & Analytics",

  // Design & Graphics
  "design": "Design & Graphics",
  "graphic design": "Design & Graphics",
  "designapplication": "Design & Graphics",
  "ui design": "Design & Graphics",
  "ux design": "Design & Graphics",
  "figma plugin": "Design & Graphics",
  "presentation": "Design & Graphics",
  "3d": "Design & Graphics",
  "3d generator": "Design & Graphics",

  // Translation & Language
  "translation": "Translation & Language",
  "translator": "Translation & Language",
  "language": "Translation & Language",
  "language learning": "Education & Learning",

  // Education & Learning
  "education": "Education & Learning",
  "learning": "Education & Learning",
  "tutoring": "Education & Learning",
  "study": "Education & Learning",
  "research": "Research & Summarization",
  "academic": "Education & Learning",

  // Automation & Workflows
  "automation": "Automation & Workflows",
  "workflow": "Automation & Workflows",
  "integration": "Automation & Workflows",
  "api": "Code & Development",

  // E-commerce & Sales
  "e-commerce": "E-commerce & Sales",
  "ecommerce": "E-commerce & Sales",
  "sales": "E-commerce & Sales",
  "shopping": "E-commerce & Sales",
  "product": "E-commerce & Sales",

  // Social Media
  "social media": "Social Media",
  "instagram": "Social Media",
  "tiktok": "Social Media",
  "twitter": "Social Media",
  "linkedin": "Social Media",
  "youtube": "Social Media",

  // Gaming & Entertainment
  "gaming": "Gaming & Entertainment",
  "game": "Gaming & Entertainment",
  "entertainment": "Gaming & Entertainment",
  "fun": "Gaming & Entertainment",

  // Finance & Crypto
  "finance": "Finance & Crypto",
  "crypto": "Finance & Crypto",
  "cryptocurrency": "Finance & Crypto",
  "trading": "Finance & Crypto",
  "investment": "Finance & Crypto",
  "accounting": "Finance & Crypto",
}

export function mapCategory(originalCategory: string): MainCategory {
  if (!originalCategory) return "Other"

  const normalized = originalCategory.toLowerCase().trim()

  // Direct match
  if (categoryMap[normalized]) {
    return categoryMap[normalized]
  }

  // Partial match - check if any keyword is contained
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  return "Other"
}

export function getCategoryColor(category: MainCategory): string {
  const colors: Record<MainCategory, string> = {
    "AI Chat & Assistants": "#3b82f6",
    "Image & Art Generation": "#ec4899",
    "Video Generation": "#8b5cf6",
    "Music & Audio": "#f59e0b",
    "Writing & Content": "#10b981",
    "Code & Development": "#06b6d4",
    "Business & Productivity": "#6366f1",
    "Marketing & SEO": "#f97316",
    "Data & Analytics": "#14b8a6",
    "Design & Graphics": "#a855f7",
    "Voice & Speech": "#f43f5e",
    "Translation & Language": "#84cc16",
    "Education & Learning": "#22c55e",
    "Research & Summarization": "#0ea5e9",
    "Automation & Workflows": "#64748b",
    "E-commerce & Sales": "#eab308",
    "Social Media": "#ef4444",
    "Gaming & Entertainment": "#f472b6",
    "Finance & Crypto": "#10b981",
    "Other": "#9ca3af"
  }
  return colors[category]
}
