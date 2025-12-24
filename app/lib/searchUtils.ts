// Comprehensive mapping of user intent to database metadata
export const SYNONYM_MAP: Record<string, string[]> = {
    'maker': ['builder', 'generator', 'creator'],
    'builder': ['maker', 'generator', 'creator'],
    'generator': ['maker', 'builder', 'creator'],
    'creator': ['maker', 'builder', 'generator'],
    'bot': ['chatbot', 'assistant', 'conversational'],
    'chatbot': ['bot', 'assistant', 'conversational'],
    'assistant': ['bot', 'chatbot', 'chat'],
    'site': ['website', 'landing page', 'web'],
    'website': ['site', 'landing page', 'web'],
    'writing': ['copywriting', 'content', 'script', 'essay'],
    'copywriting': ['writing', 'content', 'marketing'],
    'image': ['photo', 'picture', 'art', 'graphic', 'designer'],
    'photo': ['image', 'picture', 'art'],
    'art': ['image', 'graphic', 'design', 'illustration'],
    'video': ['movie', 'clip', 'animation', 'editing'],
    'audio': ['sound', 'music', 'voice', 'speech'],
    'voice': ['speech', 'audio', 'sound', 'talking'],
    'speech': ['voice', 'audio', 'sound'],
    'code': ['programming', 'developer', 'software', 'app'],
    'coding': ['code', 'programming', 'developer'],
    'app': ['software', 'application', 'tool'],
    'marketing': ['seo', 'advertising', 'sales', 'growth'],
    'seo': ['marketing', 'search', 'ranking'],
    'data': ['analytics', 'metrics', 'statistics', 'chart'],
    'analytics': ['data', 'metrics', 'insights'],
    'legal': ['lawyer', 'compliance', 'contract'],
    'medical': ['health', 'doctor', 'doctor assistant'],
    'career': ['job', 'interview', 'resume', 'hiring', 'recruitment'],
    'hiring': ['career', 'recruitment', 'job', 'interview'],
    'interview': ['career', 'job', 'hiring'],
}

/**
 * Tokenizes a query into groups based on user intent.
 * Example: 'website maker' -> [['website', 'site'], ['maker', 'builder', 'generator']]
 */
export function tokenizeQuery(query: string): string[][] {
    if (!query) return []

    const words = query.toLowerCase().trim().split(/\s+/)
    return words.map(word => {
        const group = new Set<string>([word])
        if (SYNONYM_MAP[word]) {
            SYNONYM_MAP[word].forEach(syn => group.add(syn))
        }

        // Variations
        if (word.endsWith('s') && word.length > 3) group.add(word.slice(0, -1))
        if (word.endsWith('ing') && word.length > 5) group.add(word.slice(0, -3))

        return Array.from(group)
    })
}

/**
 * Expands a search query by adding synonyms for each word.
 * Kept for backward compatibility but tokenizeQuery is preferred for precision.
 */
export function expandQuery(query: string): string[] {
    const tokens = tokenizeQuery(query)
    return Array.from(new Set(tokens.flat()))
}

/**
 * Calculates a relevance score for a tool against a search query.
 * Weights:
 * - Name: 10
 * - Category: 7
 * - Description: 2
 */
export function calculateRelevanceScore(tool: any, query: string): number {
    if (!query) return 0

    const tokenGroups = tokenizeQuery(query)
    if (tokenGroups.length === 0) return 0

    let totalScore = 0
    const queryLower = query.toLowerCase()
    const nameLower = tool.name.toLowerCase()

    // Exact name match (Highest Priority: 100)
    if (nameLower === queryLower) {
        totalScore += 100
    } else if (nameLower.startsWith(queryLower)) {
        // Starts with name match (High Priority: 50)
        totalScore += 50
    }

    // Check each requirement group (AND logic)
    const allGroupsMatch = tokenGroups.every(group => {
        let groupMatched = false

        group.forEach(word => {
            const w = word.toLowerCase()

            // Name bit match (Weight 20)
            if (nameLower.includes(w)) {
                totalScore += 20
                groupMatched = true
            }

            // Category match (Weight 10)
            if (tool.category?.toLowerCase().includes(w)) {
                totalScore += 10
                groupMatched = true
            }

            // Tags match (Weight 15)
            if (tool.v2_tags?.some((t: string) => t.toLowerCase().includes(w))) {
                totalScore += 15
                groupMatched = true
            }

            // Description match (Weight 5)
            if (tool.description?.toLowerCase().includes(w)) {
                totalScore += 5
                groupMatched = true
            }
        })

        return groupMatched
    })

    const finalScore = allGroupsMatch ? totalScore : 0

    // Quality Boost: Scores can be boosted by up to 100% based on data quality
    const qualityBoost = 1 + (tool.quality_score / 100)

    return finalScore * qualityBoost
}

/**
 * Client-side fuzzy check for a tool against a raw query string.
 */
export function matchesQuery(tool: any, query: string): boolean {
    return calculateRelevanceScore(tool, query) > 0
}
