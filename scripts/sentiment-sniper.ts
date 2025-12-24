import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { pipeline } from '@xenova/transformers'; 
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// HELPER: Extract the clean domain for searching
function getSearchQuery(tool: any) {
    if (tool.website_url) {
        try {
            // Remove https://, www., and trailing slashes to get the raw domain
            const url = new URL(tool.website_url);
            let domain = url.hostname.replace('www.', '');
            // If it's a subdomain like "app.tool.com", keep it.
            return domain; 
        } catch (e) {
            // If URL is invalid, fall back to name
        }
    }
    // Fallback: Add "AI" to the name to reduce noise
    return `"${tool.name}" AI`;
}

async function smartSentimentSniper() {
    console.log('📦 Loading DistilBERT & BART...');
    const sentimentAnalysis = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    const summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');

    console.log('✅ Models ready. Launching Browser...');
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('⚠️  PLEASE LOG IN TO X.COM MANUALLY NOW...');
    await page.goto('https://x.com/login');
    await page.waitForSelector('[data-testid="AppTabBar_Home_Link"]', { timeout: 180000 });
    console.log('✅ Login detected! Starting Smart Sniper Loop...');

    while (true) {
        // Fetch tools including the website_url
        const { data: tool } = await supabase.from('tools')
            .select('id, name, website_url, reddit_morsels')
            .is('sentiment_score', null)
            .limit(1).single();

        if (!tool) {
            console.log('🏁 Queue empty. All tools scored.');
            break;
        }

        const query = getSearchQuery(tool);
        console.log(`\n🎯 Sniping: ${tool.name} (Query: ${query})`);

        try {
            const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&f=live`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(4000); 

            // Scrape Tweets
            const tweets = await page.evaluate(() => 
                Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
                    .map(p => (p as HTMLElement).innerText)
                    .slice(0, 30) 
            );

            // LOGIC: If domain search fails (0 tweets), try Name search as backup
            if (tweets.length === 0 && query.includes('.')) {
                console.log(`   ⚠️ No results for domain. Retrying with name...`);
                const backupQuery = `"${tool.name}" AI`;
                await page.goto(`https://x.com/search?q=${encodeURIComponent(backupQuery)}&f=live`);
                await page.waitForTimeout(4000);
                // Scrape again
                const retryTweets = await page.evaluate(() => 
                     Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
                        .map(p => (p as HTMLElement).innerText).slice(0, 30));
                tweets.push(...retryTweets);
            }

            // --- SCORING LOGIC (Same as before) ---
            let totalScore = 0;
            if (tweets.length > 0) {
                for(const t of tweets) {
                    const res = await sentimentAnalysis(t);
                    if ((res[0] as any).label === 'POSITIVE') totalScore += 100;
                }
            }
            const twitterScore = tweets.length > 0 ? Math.round(totalScore / tweets.length) : 50;

            // Grade Reddit Salt
            let redditScore = 50;
            const redditText = tool.reddit_morsels ? tool.reddit_morsels.join('. ') : "";
            if (redditText.length > 10) {
                const redditRes = await sentimentAnalysis(redditText.substring(0, 512));
                redditScore = (redditRes[0] as any).label === 'POSITIVE' ? 100 : 0;
            }

            // Summary Verdict
            const allText = [...tweets, redditText].join(' ').substring(0, 2000);
            let verdict = "No data found.";
            if (allText.length > 50) {
                const summaryRes = await summarizer(allText);
                verdict = (summaryRes[0] as any).summary_text;
            }

            const finalScore = Math.round((redditScore * 0.6) + (twitterScore * 0.4));

            // Save to DB
            await supabase.from('tools').update({ 
                sentiment_score: finalScore,
                peoples_verdict: verdict 
            }).eq('id', tool.id);

            console.log(`   📊 Score: ${finalScore}% | Verdict: "${verdict.substring(0, 50)}..."`);

        } catch (err) {
            console.error(`   ❌ Error on ${tool.name}:`, err);
            await supabase.from('tools').update({ sentiment_score: 50 }).eq('id', tool.id);
        }
        
        await new Promise(r => setTimeout(r, 2000));
    }
    await browser.close();
}

smartSentimentSniper();