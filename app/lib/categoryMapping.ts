// Taxonomy v2: 20 high-intent categories
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

export function mapCategory(originalCategory: string): MainCategory {
  if (!originalCategory) return "Other"
  const normalized = originalCategory.trim()
  const match = MAIN_CATEGORIES.find(c => c.toLowerCase() === normalized.toLowerCase())
  return match || "Other"
}

export function getCategoryColor(category: MainCategory): string {
  const colors: Record<MainCategory, string> = {
    "AI Chat & Assistants": "#0ea5e9",
    "Image & Art Generation": "#ec4899",
    "Video Generation": "#f59e0b",
    "Music & Audio": "#8b5cf6",
    "Writing & Content": "#10b981",
    "Code & Development": "#06b6d4",
    "Business & Productivity": "#f43f5e",
    "Marketing & SEO": "#6366f1",
    "Data & Analytics": "#6366f1",
    "Design & Graphics": "#ec4899",
    "Voice & Speech": "#8b5cf6",
    "Translation & Language": "#10b981",
    "Education & Learning": "#f59e0b",
    "Research & Summarization": "#0ea5e9",
    "Automation & Workflows": "#06b6d4",
    "E-commerce & Sales": "#f43f5e",
    "Social Media": "#ec4899",
    "Gaming & Entertainment": "#f59e0b",
    "Finance & Crypto": "#10b981",
    "Other": "#9ca3af"
  }
  return colors[category] || colors["Other"]
}
