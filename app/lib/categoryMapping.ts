// Map 600+ messy categories to 20 clean ones
// Taxonomy v2: 6 high-intent categories
export const MAIN_CATEGORIES = [
  "Code",
  "Writing",
  "Business",
  "Image",
  "Video",
  "Audio",
  "Chatbot",
  "Productivity",
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
    "Code": "#06b6d4",
    "Writing": "#10b981",
    "Business": "#6366f1",
    "Image": "#ec4899",
    "Video": "#f59e0b",
    "Audio": "#8b5cf6",
    "Chatbot": "#0ea5e9",
    "Productivity": "#f43f5e",
    "Other": "#9ca3af"
  }
  return colors[category] || colors["Other"]
}
