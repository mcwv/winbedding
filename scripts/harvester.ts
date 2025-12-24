// scripts/harvester.ts
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const TWEET_LIMIT = 150;

function getSearchQuery(tool: any) {
    if (tool.website_url) {
        try {
            const url = new URL(tool.website_url);
            let domain = url.hostname.replace('www.', '');
            if (domain.length > 4) return domain; 
        } catch (e) {}
    }
    return `"${tool.name}" (review OR scam OR love OR hate OR "not working" OR "worth it")`;
}

async function harvest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('⚠️  LOG IN TO X.COM NOW...');
    await page.goto('https://x.com/login');
    await page.waitForSelector('[data-testid="AppTabBar_Home_Link"]', { timeout: 180000 });
    console.log('✅ Login detected! Starting Harvest...');

    while (true) {
        // Find tools that don't have tweets yet
        const { data: tool } = await supabase.from('tools')
            .select('id, name, website_url')
            .is('raw_tweets', null) // Only get un-harvested tools
            .limit(1).single();

        if (!tool) { console.log('🏁 All tools harvested!'); break; }

        const query = getSearchQuery(tool);
        console.log(`\n🌾 Harvesting: ${tool.name} (Query: ${query})`);

        try {
            await page.goto(`https://x.com/search?q=${encodeURIComponent(query)}&f=live`);
            await page.waitForTimeout(3000); 

            let tweets: string[] = [];
            let noNewTweetsCount = 0;

            for (let i = 0; i < 8; i++) {
                await page.keyboard.press('End');
                await page.waitForTimeout(Math.random() * 2000 + 2000);
                
                const currentTweets = await page.evaluate(() => 
                    Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
                        .map(p => (p as HTMLElement).innerText)
                );

                if (currentTweets.length === tweets.length) noNewTweetsCount++;
                else noNewTweetsCount = 0;

                tweets = currentTweets;
                if (tweets.length >= TWEET_LIMIT || noNewTweetsCount >= 2) break;
            }
            
            tweets = [...new Set(tweets)].slice(0, TWEET_LIMIT);

            // SAVE RAW DATA IMMEDIATELY
            await supabase.from('tools').update({ 
                raw_tweets: tweets 
            }).eq('id', tool.id);

            console.log(`   📦 Saved ${tweets.length} tweets to DB.`);

        } catch (err) {
            console.error(`   ❌ Error:`, err);
            // On error, save empty array so we don't get stuck in a loop
            await supabase.from('tools').update({ raw_tweets: [] }).eq('id', tool.id);
        }
        
        await new Promise(r => setTimeout(r, 5000));
    }
    await browser.close();
}

harvest();