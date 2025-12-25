// Taxonomy v3: Active high-intent categories (Short Names)
export const MAIN_CATEGORIES = [
  "Code",
  "Business",
  "Writing",
  "Image",
  "Chatbot",
  "Productivity",
  "Video",
  "Audio",
  "Other"
] as const

type MainCategory = typeof MAIN_CATEGORIES[number]

export function mapCategory(originalCategory: string): MainCategory {
  if (!originalCategory) return "Other"
  const normalized = originalCategory.trim()
  // Direct match check first
  if ((MAIN_CATEGORIES as unknown as string[]).includes(normalized)) {
    return normalized as MainCategory
  }

  // Legacy mapping (optional, but good for safety if old data persists)
  const lower = normalized.toLowerCase()
  if (lower.includes("code") || lower.includes("dev")) return "Code"
  if (lower.includes("business")) return "Business"
  if (lower.includes("writing") || lower.includes("copy")) return "Writing"
  if (lower.includes("image") || lower.includes("art")) return "Image"
  if (lower.includes("chat") || lower.includes("assistant")) return "Chatbot"
  if (lower.includes("productivity")) return "Productivity"
  if (lower.includes("video")) return "Video"
  if (lower.includes("music") || lower.includes("audio")) return "Audio"

  return "Other"
}

export function getCategoryColor(category: string): string {
  // Normalize category to ensure we match even if casing is off
  const cat = mapCategory(category)

  const colors: Record<MainCategory, string> = {
    "Code": "#06b6d4",        // Cyan
    "Business": "#f43f5e",    // Rose
    "Writing": "#10b981",     // Emerald
    "Image": "#ec4899",       // Pink
    "Chatbot": "#0ea5e9",     // Sky
    "Productivity": "#f97316", // Orange
    "Video": "#eab308",       // Yellow -> distinct from Orange
    "Audio": "#8b5cf6",       // Violet
    "Other": "#9ca3af"        // Gray
  }
  return colors[cat] || colors["Other"]
}

