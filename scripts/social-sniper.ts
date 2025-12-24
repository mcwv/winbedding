import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const jitter = (min = 8000, max = 15000) => Math.floor(Math.random() * (max - min) + min);

async function rebuiltSniper() {
  // Added slowMo to make the browser act more human and less "bot-like"
  const browser = await chromium.launch({ headless: false, slowMo: 100 }); 
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  let isFirstTool = true;

  while (true) {
    const { data: tools } = await supabase
      .from('tools')
      .select('id, name')
      .is('reddit_morsels', null)
      .limit(1);

    if (!tools || tools.length === 0) {
      console.log("🏁 All tools processed. Go to bed!");
      break;
    }

    const tool = tools[0];
    let allMorsels: string[] = [];

    // TIERED SEARCH: Forced Forums, Reddit, Twitter, YouTube
    const queries = [
      `${tool.name} AI`,                                  
      `site:reddit.com "${tool.name}" AI`,               
      `site:x.com "${tool.name}" AI OR tool`,            
      `site:youtube.com "${tool.name}" reviews`          
    ];

    console.log(`🎯 Gathering Deep Salt for: ${tool.name}`);

    for (const query of queries) {
      if (allMorsels.length >= 8) break; 

      const forumParam = query === queries[0] ? '&udm=18' : '';
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}${forumParam}`;

      try {
        // Wait for full load so snippets have time to exist
        await page.goto(searchUrl, { waitUntil: 'load', timeout: 60000 });

        // CAPTCHA CHECK: Give you time to solve if Google blocks
        const captcha = await page.evaluate(() => 
          document.body.innerText.includes('Confirm you’re a human') || 
          document.body.innerText.includes('not a robot')
        );

        if (captcha || isFirstTool) {
          const gracePeriod = isFirstTool ? 60000 : 120000;
          console.log(`🛡️ PAUSING: Solve the Captcha. Waiting up to ${gracePeriod/1000}s...`);
          await page.waitForSelector('h3', { timeout: gracePeriod }).catch(() => null);
          isFirstTool = false; 
        } else {
          // Normal human-like pause to let dynamic content hydrate
          await page.waitForTimeout(4000); 
          await page.waitForSelector('h3', { timeout: 20000 }).catch(() => null);
        }

        const tierMorsels = await page.evaluate(() => {
          const results: string[] = [];
          const headers = Array.from(document.querySelectorAll('h3'));

          for (const h3 of headers) {
            let container = h3.parentElement;
            // Climb up the tree to find the snippet block
            for (let i = 0; i < 5; i++) {
              if (container && container.innerText.length > 100) break;
              container = container?.parentElement || null;
            }

            if (container) {
              const text = container.innerText
                .replace(h3.innerText, '') 
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              if (text.length > 60) results.push(text);
            }
            if (results.length >= 5) break; 
          }
          return results;
        });

        allMorsels = [...allMorsels, ...tierMorsels];
        console.log(`   🔎 Tier [${query}] provided ${tierMorsels.length} snippets.`);

      } catch (err) {
        console.error(`   ❌ Search error:`, err);
      }
    }

    // DEDUPLICATE AND SAVE
    const uniqueMorsels = [...new Set(allMorsels)].slice(0, 12);
    const finalData = uniqueMorsels.length > 0 ? uniqueMorsels : ["NO_HUMAN_SALT_FOUND"];

    await supabase.from('tools').update({ reddit_morsels: finalData }).eq('id', tool.id);
    console.log(`   ✅ TOTAL SALT: ${uniqueMorsels.length} snippets for ${tool.name}`);

    const wait = jitter();
    console.log(`   ⏳ Jittering for ${Math.round(wait/1000)}s...`);
    await new Promise(r => setTimeout(r, wait));
  }

  await browser.close();
}

rebuiltSniper().catch(console.error);