import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const turndownService = new TurndownService();

async function main() {
    const browser = await chromium.launch({ headless: true });
    console.log('🚀 Heavy Triage Started: Verifying unreachable tools...');

    while (true) {
        // Fetch a batch of tools needing triage
        const { data: tools, error } = await supabase
            .from('tools')
            .select('*')
            .eq('enrichment_status', 'needs_triage')
            .limit(10);

        if (error || !tools || tools.length === 0) {
            console.log('💤 No tools currently in needs_triage. Waiting 30s...');
            await new Promise(r => setTimeout(r, 30000));
            // Re-check once more then exit if still empty and marking script might be done
            const { data: recheck } = await supabase.from('tools').select('id').eq('enrichment_status', 'needs_triage').limit(1);
            if (!recheck || recheck.length === 0) break;
            continue;
        }

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        });

        for (const tool of tools) {
            console.log(`🔎 Triaging: ${tool.name} (${tool.website_url})`);
            const page = await context.newPage();
            try {
                await page.goto(tool.website_url, { waitUntil: 'load', timeout: 30000 });
                await page.waitForTimeout(2000);

                const rawData = await page.evaluate(() => ({
                    title: document.title,
                    bodyText: document.body.innerText,
                    html: document.documentElement.innerHTML,
                }));

                const dom = new JSDOM(rawData.html, { url: tool.website_url });
                const reader = new Readability(dom.window.document);
                const article = reader.parse();

                let markdown = article?.content ? turndownService.turndown(article.content) : "";
                if (markdown.length < 200) {
                    markdown = rawData.bodyText.substring(0, 10000);
                }

                if (markdown.length > 50) {
                    console.log(`   ✅ ALIVE - Extracted ${markdown.length} chars`);
                    await supabase.from('tools').update({
                        enrichment_status: 'reachable',
                        tracking_metadata: {
                            ...tool.tracking_metadata,
                            scraped_content: { clean_text: markdown, crawled_at: new Date().toISOString() }
                        }
                    }).eq('id', tool.id);
                } else {
                    throw new Error("Empty content");
                }

            } catch (e: any) {
                console.log(`   ❌ DEAD: ${e.message}`);
                await supabase.from('tools').update({
                    enrichment_status: 'dead',
                    is_published: false
                }).eq('id', tool.id);
            }
            await page.close();
        }
        await context.close();
    }

    await browser.close();
    console.log('🏁 Triage session complete.');
}

main();
