// Merge Strapi and Bedwinning datasets into one unified collection
const fs = require('fs');
const path = require('path');

console.log('🔄 Merging Bedwinning & Strapi datasets...\n');

// Load Strapi data
const strapiData = JSON.parse(fs.readFileSync('strapi_ai_tools_directory.json', 'utf-8'));
console.log(`✓ Loaded ${strapiData.length} tools from Strapi dataset`);

// Load Bedwinning CSV
const csvContent = fs.readFileSync('bedwinning - AI-Tools.csv', 'utf-8');
const csvLines = csvContent.split('\n').slice(1); // Skip header
console.log(`✓ Loaded ${csvLines.length} tools from Bedwinning CSV`);

// Parse CSV to objects
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

const bedwinningTools = csvLines
  .filter(line => line.trim())
  .map(line => {
    const fields = parseCSVLine(line);
    return {
      title: fields[0],
      company: fields[1],
      category: fields[2],
      short_description: fields[3],
      featured: fields[4] === 'TRUE',
      featured_description: fields[5],
      tags: fields[6],
      affiliate_link: fields[7],
      apply_link: fields[8],
      source: fields[9],
      notes: fields[10],
      date_added: fields[11],
      thumbs: fields[12],
      logos: fields[13]
    };
  });

console.log(`✓ Parsed ${bedwinningTools.length} Bedwinning tools\n`);

// Convert to unified format
function convertStrapi(tool) {
  return {
    id: `strapi-${tool.id}`,
    name: tool.name,
    description: tool.description || '',
    shortDescription: tool.shortDescription || '',
    visitURL: tool.visitURL || '',
    slug: tool.slug,
    thumbnail: null,
    logo: null,
    category: tool.tags && tool.tags[0] ? tool.tags[0] : 'Other',
    tags: tool.tags || [],
    rating: tool.rating || 0,
    likes: tool.likes || 0,
    reviewCount: null,
    isFeatured: tool.isFeatured || false,
    isVerified: tool.isVerified || false,
    isTopTool: tool.isTopTool || false,
    pricingModel: tool.pricingModel || 'Inquire',
    costs: tool.costs || 'Inquire',
    hasAffiliateLink: tool.affiliatePartner || false,
    affiliateURL: null,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
    publishedAt: tool.publishedAt,
    source: 'strapi'
  };
}

function convertBedwinning(tool) {
  return {
    id: `bed-${tool.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    name: tool.title,
    description: tool.short_description || tool.featured_description || '',
    shortDescription: tool.short_description || '',
    visitURL: tool.affiliate_link || tool.apply_link || '',
    slug: tool.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    thumbnail: tool.thumbs || null,
    logo: tool.logos || null,
    category: tool.category || 'Other',
    tags: tool.tags ? tool.tags.split('|').map(t => t.trim()) : [],
    rating: 0,
    likes: 0,
    reviewCount: null,
    isFeatured: tool.featured,
    isVerified: false,
    isTopTool: false,
    pricingModel: 'Inquire',
    costs: 'Inquire',
    hasAffiliateLink: !!tool.affiliate_link,
    affiliateURL: tool.affiliate_link || null,
    createdAt: tool.date_added || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    source: 'bedwinning'
  };
}

// Convert both datasets
const strapiConverted = strapiData.map(convertStrapi);
const bedwinningConverted = bedwinningTools.map(convertBedwinning);

console.log('📊 Conversion complete:');
console.log(`   Strapi: ${strapiConverted.length} tools`);
console.log(`   Bedwinning: ${bedwinningConverted.length} tools\n`);

// Merge and deduplicate
const toolsMap = new Map();

// Add Strapi tools first (they're higher quality)
strapiConverted.forEach(tool => {
  const key = tool.name.toLowerCase().trim();
  toolsMap.set(key, tool);
});

// Add Bedwinning tools, but only if not already present
let duplicates = 0;
bedwinningConverted.forEach(tool => {
  const key = tool.name.toLowerCase().trim();
  if (!toolsMap.has(key)) {
    toolsMap.set(key, tool);
  } else {
    duplicates++;
    // If Bedwinning has affiliate link but Strapi doesn't, merge it
    const existing = toolsMap.get(key);
    if (tool.hasAffiliateLink && !existing.hasAffiliateLink) {
      existing.hasAffiliateLink = true;
      existing.affiliateURL = tool.affiliateURL;
      existing.source = 'merged';
    }
  }
});

const mergedTools = Array.from(toolsMap.values());

console.log('🎯 Merge Results:');
console.log(`   Total unique tools: ${mergedTools.length}`);
console.log(`   Duplicates removed: ${duplicates}`);
console.log(`   Tools with affiliate links: ${mergedTools.filter(t => t.hasAffiliateLink).length}`);
console.log(`   Featured tools: ${mergedTools.filter(t => t.isFeatured).length}`);
console.log(`   Verified tools: ${mergedTools.filter(t => t.isVerified).length}\n`);

// Save merged dataset
fs.writeFileSync(
  'merged_tools_dataset.json',
  JSON.stringify(mergedTools, null, 2)
);

console.log('✅ Saved to: merged_tools_dataset.json');
console.log('\n🚀 Ready to use in your app!\n');

// Generate stats by category
const categoryStats = {};
mergedTools.forEach(tool => {
  const cat = tool.category;
  categoryStats[cat] = (categoryStats[cat] || 0) + 1;
});

console.log('📈 Top 20 Categories:');
Object.entries(categoryStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(30)}: ${count} tools`);
  });
