// scripts/lab.ts
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers'; 
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function analyze() {
    console.log(`📦 Loading Models...`);
    // These load instantly once downloaded
    const sentimentAnalysis = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    const summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');

    // Process everything that has tweets but no score
    const { data: tools } = await supabase.from('tools')
        .select('id, name, raw_tweets, reddit_morsels')
        .not('raw_tweets', 'is', null)
        .is('sentiment_score', null);

    if (!tools) return;

    console.log(`🧪 Analyzing ${tools.length} harvested tools...`);

    for (const tool of tools) {
        const tweets = tool.raw_tweets as string[];
        
        if (!tweets || tweets.length === 0) {
            console.log(`   ⚠️ ${tool.name}: No tweets. Skipping.`);
            await supabase.from('tools').update({ sentiment_score: 50, peoples_verdict: "No data." }).eq('id', tool.id);
            continue;
        }

        // SCORING
        let positiveCount = 0;
        for(const t of tweets) {
            const res = await sentimentAnalysis(t.substring(0, 512));
            if ((res[0] as any).label === 'POSITIVE') positiveCount++;
        }
        const twitterScore = Math.round((positiveCount / tweets.length) * 100);

        // REDDIT FACTOR
        let redditScore = 50;
        if (tool.reddit_morsels && tool.reddit_morsels.length > 0) {
            const rRes = await sentimentAnalysis(tool.reddit_morsels.join(' ').substring(0, 512));
            redditScore = (rRes[0] as any).label === 'POSITIVE' ? 100 : 0;
        }

        // SUMMARY
        const combined = tweets.slice(0, 20).join(' ') + " " + (tool.reddit_morsels || []).join(' ');
        const summaryRes = await summarizer(combined.substring(0, 3000), { max_new_tokens: 60 });
        const verdict = (summaryRes[0] as any).summary_text;

        const finalScore = Math.round((redditScore * 0.4) + (twitterScore * 0.6));

        await supabase.from('tools').update({ 
            sentiment_score: finalScore, 
            peoples_verdict: verdict 
        }).eq('id', tool.id);

        console.log(`   ✅ ${tool.name}: ${finalScore}% | "${verdict.substring(0, 30)}..."`);
    }
}

analyze();