import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const BATCH_SIZE = 50;
const DELAY_MS = 800; // Slightly slower to allow for heavier page scraping

// Initialize Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --- DEFINITIONS ---
interface ScrapedData {
  socials: Record<string, string>;
  meta: {
    title: string;
    description: string;
    image_url: string;
    logo_url: string;
  };
}

// --- HELPER FUNCTIONS ---

function getDomain(urlStr: string | null): string {
  if (!urlStr) return '';
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

function generateKeywords(name: string, domain: string, category: string): string[] {
  const keywords = new Set<string>();
  
  if (domain) keywords.add(domain);

  const nameClean = name.split('|')[0].trim();
  const words = nameClean.split(/\s+/);

  if (words.length === 1) {
    keywords.add(`${nameClean} ${category}`);
    keywords.add(`${nameClean} tool`);
    keywords.add(`${nameClean} ai`);
  } else if (nameClean.toLowerCase().includes('million dollar') || nameClean.toLowerCase().includes('best idea')) {
    keywords.add(`"${nameClean}"`);
  } else {
    keywords.add(nameClean);
  }

  return Array.from(keywords);
}

async function scrapeSiteData(urlStr: string | null): Promise<ScrapedData> {
  const data: ScrapedData = {
    socials: {},
    meta: { title: '', description: '', image_url: '', logo_url: '' }
  };

  if (!urlStr) return data;

  try {
    // 5 second timeout to avoid hanging on slow sites
    const response = await fetch(urlStr, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return data;

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. GET SOCIALS
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.toLowerCase() || '';
      
      if (href.includes('twitter.com/') || href.includes('x.com/')) {
        if (!href.includes('/status/') && !href.includes('/intent/')) {
          data.socials.twitter = $(el).attr('href')!;
        }
      } else if (href.includes('reddit.com/r/')) {
        data.socials.reddit = $(el).attr('href')!;
      } else if (href.includes('discord.gg') || href.includes('discord.com/invite')) {
        data.socials.discord = $(el).attr('href')!;
      } else if (href.includes('linkedin.com/company')) {
        data.socials.linkedin = $(el).attr('href')!;
      }
    });

    // 2. GET IMAGES (OG Tags preferrred)
    data.meta.image_url = $('meta[property="og:image"]').attr('content') || 
                          $('meta[name="twitter:image"]').attr('content') || '';

    // 3. GET LOGO (Favicons)
    let logo = $('link[rel="apple-touch-icon"]').attr('href') || 
               $('link[rel="icon"]').attr('href') || '';
    
    // Fix relative logo URLs (e.g. "/favicon.ico" -> "https://site.com/favicon.ico")
    if (logo && !logo.startsWith('http')) {
        try {
            const origin = new URL(urlStr).origin;
            // Remove leading slash if present to avoid double slash issues if needed, 
            // but URL constructor usually handles it.
            logo = new URL(logo, origin).href;
        } catch (e) { /* ignore invalid URL construction */ }
    }
    data.meta.logo_url = logo;

    // 4. GET TEXT
    data.meta.description = $('meta[property="og:description"]').attr('content') || 
                            $('meta[name="description"]').attr('content') || '';
                            
    data.meta.title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';

  } catch (error) {
    // Silent fail is okay here; we just return empty data for this site
  }
  return data;
}

// --- MAIN EXECUTION ---

async function main() {
  console.log('🚀 Unleashing the Beast (Data Enrichment)...');

  // 1. Check connection
  const { count, error } = await supabase.from('tools').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('❌ Supabase Connection Error:', error.message);
    return;
  }
  const totalCount = count || 0;
  console.log(`📊 Processing ${totalCount} tools.`);

  let currentOffset = 0;
  let processedCount = 0;

  while (currentOffset < totalCount) {
    console.log(`\n📥 Fetching batch ${currentOffset} - ${currentOffset + BATCH_SIZE}...`);

    const { data: tools } = await supabase
      .from('tools')
      .select('*')
      .range(currentOffset, currentOffset + BATCH_SIZE - 1);

    if (!tools || tools.length === 0) break;

    for (const tool of tools) {
      process.stdout.write(`   [${Math.round((processedCount/totalCount)*100)}%] enrichment: ${tool.name.substring(0, 20)}...\r`);

      // A. Logic (Keywords)
      const domain = getDomain(tool.website_url);
      const category = tool.category_name || tool.v2_category || 'Software';
      const keywords = generateKeywords(tool.name, domain, category);

      // B. Hunting (Scraping)
      const scraped = await scrapeSiteData(tool.website_url);

      // C. Packing the Backpack
      // We store the NEW scraped data in 'scraped_content' so we don't overwrite manual data yet
      const trackingMetadata = {
        search_keywords: keywords,
        official_channels: scraped.socials,
        scraped_content: scraped.meta, // <--- THE NEW GOLD
        sentiment_status: 'ready',
        last_enriched: new Date().toISOString().split('T')[0]
      };

      // D. Saving
      await supabase
        .from('tools')
        .update({ tracking_metadata: trackingMetadata })
        .eq('id', tool.id);

      processedCount++;
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }

    currentOffset += BATCH_SIZE;
  }

  console.log('\n🎉 DONE! The database is now fully enriched.');
}

main();