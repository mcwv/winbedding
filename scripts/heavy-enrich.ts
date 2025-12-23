import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- CONFIG ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = 10;
const BROWSER_TIMEOUT = 10000; // 10s timeout (Fail fast!)

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase keys in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const turndownService = new TurndownService();

async function main() {
  console.log('🚀 Starting Heavy Enrichment (Double-Tap Safety Mode)...');

  const browser = await chromium.launch({ headless: true });
  
  const { count } = await supabase.from('tools').select('*', { count: 'exact', head: true });
  const totalCount = count || 0;
  console.log(`📊 Total Tools: ${totalCount}`);

  let currentOffset = 0;
  let processedCount = 0;

  while (currentOffset < totalCount) {
    console.log(`\n📥 Fetching batch ${currentOffset} - ${currentOffset + BATCH_SIZE}...`);

    const { data: tools } = await supabase
      .from('tools')
      .select('*')
      .range(currentOffset, currentOffset + BATCH_SIZE - 1);

    if (!tools || tools.length === 0) break;

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    for (const tool of tools) {
      
      // 1. RESUME CHECK
      // If ANY text exists (even "Attempting..."), we assume it's done or burned.
      // @ts-ignore
      const existingText = tool.tracking_metadata?.scraped_content?.clean_text;
      if (existingText) {
         process.stdout.write(`   ⏭️  Skipping ${tool.name.substring(0, 15)}... (Done/Burned)\r`);
         processedCount++;
         continue;
      }

      // 2. THE SAFETY LOCK (Write "Attempting" BEFORE crawling)
      // This ensures if the script crashes/hangs here, the tool is "burned" for next time.
      const pendingMetadata = {
        ...tool.tracking_metadata,
        scraped_content: {
          ...tool.tracking_metadata?.scraped_content,
          clean_text: "Attempting..." 
        }
      };
      await supabase.from('tools').update({ tracking_metadata: pendingMetadata }).eq('id', tool.id);

      const page = await context.newPage();
      process.stdout.write(`   [${Math.round((processedCount/totalCount)*100)}%] Crawling: ${tool.name.substring(0, 20)}... `);

      try {
        await page.goto(tool.website_url, { waitUntil: 'domcontentloaded', timeout: BROWSER_TIMEOUT });
        
        const html = await page.content();
        const doc = new JSDOM(html, { url: tool.website_url });
        const document = doc.window.document;

        // GRAB IMAGES
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || 
                        document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';

        let logo = document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') || 
                   document.querySelector('link[rel="icon"]')?.getAttribute('href') || '';
        
        if (logo && !logo.startsWith('http') && !logo.startsWith('data:')) {
            try { logo = new URL(logo, tool.website_url).href; } catch (e) {}
        }

        const reader = new Readability(document);
        const article = reader.parse();

        if (article) {
          const markdown = turndownService.turndown(article.content);
          
          const scrapedContent = {
            title: article.title,
            description: article.excerpt, 
            clean_text: markdown,
            image_url: ogImage,
            logo_url: logo,
            crawled_at: new Date().toISOString().split('T')[0]
          };

          // 3. SUCCESS UPDATE (Overwrite "Attempting..." with real data)
          const finalMetadata = {
            ...tool.tracking_metadata,
            scraped_content: { ...tool.tracking_metadata?.scraped_content, ...scrapedContent }
          };

          await supabase.from('tools').update({ tracking_metadata: finalMetadata }).eq('id', tool.id);
          console.log(`✅ (${markdown.length} chars)`);
        } else {
          throw new Error("No readable content");
        }

      } catch (e) {
        console.log(`❌ (Failed)`);
        
        // 4. FAILURE UPDATE (Overwrite "Attempting..." with FAILED)
        const failedMetadata = {
          ...tool.tracking_metadata,
          scraped_content: {
            ...tool.tracking_metadata?.scraped_content,
            clean_text: "CRAWL_FAILED",
            crawled_at: new Date().toISOString().split('T')[0]
          }
        };
        await supabase.from('tools').update({ tracking_metadata: failedMetadata }).eq('id', tool.id);
      } finally {
        await page.close();
      }
      processedCount++;
    }
    
    await context.close();
    currentOffset += BATCH_SIZE;
  }

  await browser.close();
  console.log('\n🎉 DONE!');
}

main();