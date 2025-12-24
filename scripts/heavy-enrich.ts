import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const turndownService = new TurndownService();

async function main() {
  const browser = await chromium.launch({ headless: true });
  console.log('🚀 Sniper Mode Engaged: Targeted Scraping starting...');

  while (true) {
    // 1. FETCH: Only get tools that are low quality
    const { data: tools, error } = await supabase
      .from('tools')
      .select('*')
      .lt('quality_score', 40)
      .order('updated_at', { ascending: true })
      .limit(10);

    if (error || !tools || tools.length === 0) break;

    const context = await browser.newContext({ userAgent: 'Mozilla/5.0...' });
    const page = await context.newPage();

    for (const tool of tools) {
      console.log(`🔎 Processing: ${tool.name}`);
      try {
        // Mark as "Attempting" and bump timestamp
        await supabase.from('tools').update({ 
          updated_at: new Date().toISOString(),
          tracking_metadata: { ...tool.tracking_metadata, scraped_content: { clean_text: "Attempting..." } }
        }).eq('id', tool.id);

        await page.goto(tool.website_url, { waitUntil: 'load', timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(2000);

        // Bypasses the "__name is not defined" error by extracting raw first
        const rawData = await page.evaluate(() => ({
          title: document.title,
          bodyText: document.body.innerText,
          html: document.documentElement.innerHTML,
        })).catch(() => null);

        if (!rawData) throw new Error("Extraction failed");

        // Use JSDOM locally so we don't crash the browser's JS scope
        const dom = new JSDOM(rawData.html, { url: tool.website_url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        // FALLBACK LOGIC: If it's a "boring" math tool like Wolfram, grab the body text
        let markdown = article?.content ? turndownService.turndown(article.content) : "";
        if (markdown.length < 200) {
          console.log(`   💡 Using Body Fallback for ${tool.name}`);
          markdown = rawData.bodyText.substring(0, 5000); 
        }

        await supabase.from('tools').update({ 
          tracking_metadata: { 
            ...tool.tracking_metadata, 
            scraped_content: { clean_text: markdown, crawled_at: new Date().toISOString() } 
          }
        }).eq('id', tool.id);

        console.log(`   ✅ Success`);
      } catch (e: any) {
        console.log(`   ❌ Failed: ${e.message}`);
      }
    }
    await page.close();
    await context.close();
  }
  await browser.close();
  console.log('🏁 All done. Go to sleep.');
}

main();