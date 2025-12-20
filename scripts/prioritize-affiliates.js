// Script to identify which tools to prioritize for affiliate programs
// Run with: node scripts/prioritize-affiliates.js

const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('opentools_complete.json', 'utf-8'));

// Filter published, non-NSFW tools
const publishedTools = data.filter(t => t.published && !t.archived && !t.nsfw);

// Score tools based on multiple factors
const scoredTools = publishedTools.map(tool => {
  const rating = tool.average_rating || 0;
  const reviews = tool.review_count || 0;
  const favorites = tool.favouriteCount || 0;
  const monthFavs = tool.monthFavourites || 0;

  const score =
    (rating * 20) +                        // Rating weight (max 100)
    (Math.log(reviews + 1) * 10) +         // Review count (logarithmic)
    (Math.log(favorites + 1) * 15) +       // Favorites (logarithmic)
    (tool.verified ? 50 : 0) +             // Verified bonus
    (monthFavs * 5);                       // Recent popularity

  return {
    id: tool.id,
    name: tool.tool_name,
    category: tool.category,
    url: tool.tool_url,
    rating: rating.toFixed(1),
    reviews: reviews,
    favorites: favorites,
    monthFavorites: monthFavs,
    verified: tool.verified,
    score: Math.round(score)
  };
});

// Sort by score
scoredTools.sort((a, b) => b.score - a.score);

console.log('\n🎯 TOP 50 TOOLS TO PRIORITIZE FOR AFFILIATE PROGRAMS\n');
console.log('Focus on these first - they\'ll drive the most revenue!\n');
console.log('─'.repeat(120));

scoredTools.slice(0, 50).forEach((tool, i) => {
  console.log(`${(i + 1).toString().padStart(2)}. ${tool.name.substring(0, 35).padEnd(35)} | ⭐${tool.rating} (${tool.reviews}r) | ❤️${tool.favorites} | Score: ${tool.score}`);
});

console.log('\n─'.repeat(120));
console.log('\n📊 CATEGORY BREAKDOWN (Top 50):');

const categoryBreakdown = scoredTools.slice(0, 50).reduce((acc, tool) => {
  acc[tool.category] = (acc[tool.category] || 0) + 1;
  return acc;
}, {});

Object.entries(categoryBreakdown)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([cat, count]) => {
    console.log(`  ${cat.substring(0, 40).padEnd(40)}: ${count} tools`);
  });

// Export detailed list to CSV for easy tracking
const csvHeader = 'Rank,Tool Name,Category,Rating,Reviews,Favorites,URL,Tool ID\n';
const csvRows = scoredTools.slice(0, 100).map((tool, i) =>
  `${i + 1},"${tool.name}","${tool.category}",${tool.rating},${tool.reviews},${tool.favorites},"${tool.url}","${tool.id}"`
).join('\n');

fs.writeFileSync('top-100-tools-for-affiliates.csv', csvHeader + csvRows);

console.log('\n✅ Exported top 100 tools to: top-100-tools-for-affiliates.csv');
console.log('   Import this into a spreadsheet to track your affiliate applications!\n');

// Suggest some quick wins
console.log('\n💡 QUICK WINS - Popular Tools That Likely Have Affiliate Programs:\n');

const likelyAffiliates = [
  'Claude', 'ChatGPT', 'Notion', 'Canva', 'Grammarly', 'Jasper',
  'Copy.ai', 'Descript', 'Riverside', 'Synthesia', 'Runway',
  'Midjourney', 'ElevenLabs', 'Pictory', 'HeyGen'
];

scoredTools
  .filter(t => likelyAffiliates.some(name => t.name.toLowerCase().includes(name.toLowerCase())))
  .slice(0, 10)
  .forEach(tool => {
    console.log(`  ✓ ${tool.name} (Rating: ${tool.rating}, ${tool.favorites} favorites)`);
    console.log(`    ${tool.url}\n`);
  });

console.log('💰 TIP: Start with affiliate networks like:');
console.log('   - PartnerStack (many SaaS tools)');
console.log('   - Impact.com (major brands)');
console.log('   - ShareASale (wide variety)');
console.log('   - Direct programs (check tool websites)\n');
