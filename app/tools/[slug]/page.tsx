import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import NeomorphHeader from "@/app/components/neomorph/neomorph-header"
import NeomorphToolBrowser from "@/app/components/neomorph/neomorph-tool-browser"
import { getAllTools, getToolBySlug, getSimilarTools } from "@/app/lib/db"
import NeomorphSimilarTools from "@/app/components/neomorph/neomorph-similar-tools"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const tool = await getToolBySlug(slug)

    if (!tool) {
        return {
            title: 'Tool Not Found | Bedwinning'
        }
    }

    const title = `${tool.name} - ${tool.category} AI Tool | Bedwinning`
    const description = tool.description.slice(0, 160)

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [tool.logoUrl || '/favicon.png'],
        },
        alternates: {
            canonical: `https://www.bedwinning.com/tools/${slug}`,
        },
    }
}

import NeomorphStandaloneTool from "@/app/components/neomorph/neomorph-standalone-tool"

export default async function ToolDetailPage({ params }: PageProps) {
    const { slug } = await params

    let selectedTool = null
    let similarTools: any[] = []

    try {
        selectedTool = await getToolBySlug(slug)
        if (selectedTool) {
            similarTools = await getSimilarTools(selectedTool.id, selectedTool.category, 4)
        }
    } catch (e) {
        console.error('Database error in tool detail page:', e)
    }

    if (!selectedTool) {
        notFound()
    }

    // Handle 301 Redirect if accessed via legacy slug
    if (selectedTool.slug !== slug) {
        redirect(`/tools/${selectedTool.slug}`)
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: selectedTool.name,
        description: selectedTool.description,
        applicationCategory: selectedTool.category,
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        image: selectedTool.logoUrl || 'https://www.bedwinning.com/favicon.png',
    }

    return (
        <div className="min-h-screen flex flex-col pb-20" style={{ background: '#F0F0F3' }}>
            <NeomorphHeader />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="flex-1 container mx-auto px-4 max-w-7xl">
                <NeomorphStandaloneTool tool={selectedTool} />
                <NeomorphSimilarTools tools={similarTools} />
            </main>
        </div>
    )
}
