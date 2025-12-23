import { MetadataRoute } from 'next'
import { getAllTools } from './lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://bedwinning.com'

    // Fetch all tools from DB
    let tools: any[] = []
    try {
        tools = await getAllTools()
    } catch (error) {
        console.error('Error fetching tools for sitemap:', error)
    }

    const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
        url: `${baseUrl}/tools/${tool.slug}`,
        lastModified: new Date(tool.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
    }))

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    return [
        ...staticPages,
        ...toolEntries
    ]
}
