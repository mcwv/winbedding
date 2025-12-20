# Affiliate Link Setup Guide

## 🚀 Smart Strategy: Start Small, Scale Up

You have **8,000 tools** - you DON'T need affiliate links for all of them! Focus on the top performers first.

## Step 1: Find Your Top Opportunities

Run the prioritization script to see which tools to focus on:

```bash
node scripts/prioritize-affiliates.js
```

This will:
- ✅ Rank all 8,000 tools by score (rating + popularity + engagement)
- ✅ Show you the top 50 tools to prioritize
- ✅ Export top 100 to CSV for tracking
- ✅ Suggest quick wins (popular tools with known affiliate programs)

**Focus on the top 50-100 tools first** - they'll drive 80% of your traffic!

## Step 2: Join Affiliate Networks

Instead of applying to 8,000 individual programs, join networks that cover multiple tools:

### Top Networks to Join:

1. **PartnerStack** (https://partnerstack.com)
   - Covers: Notion, Grammarly, Jasper, many SaaS tools
   - Commission: Usually 20-30% recurring
   - Apply once, get access to hundreds of programs

2. **Impact** (https://impact.com)
   - Covers: Major brands, enterprise tools
   - Commission: Varies by program
   - Professional tracking & reporting

3. **ShareASale** (https://shareasale.com)
   - Covers: Wide variety of tools
   - Commission: Varies widely
   - Easy to join

4. **Direct Programs**
   - Check each tool's website for "/affiliates" or "/partners"
   - Often better commissions than networks
   - Examples: Claude, OpenAI, many indie tools

## Step 3: Add Your Affiliate Links

Edit `app/lib/affiliateLinks.ts` and add your links:

```typescript
export const affiliateLinks: AffiliateLink[] = [
  {
    toolId: "6601e5ffa1b2b5ce0d248614",  // Get this from the CSV or database
    affiliateUrl: "https://notion.so/?ref=YOUR_CODE",
    network: "PartnerStack",
    commission: "30% recurring",
    notes: "Approved on 2025-01-15"
  },
  {
    toolId: "another-tool-id",
    affiliateUrl: "https://example.com/?affiliate=YOUR_ID",
    network: "Direct",
    commission: "20% one-time"
  },
  // Add more as you get approved...
]
```

**That's it!** The app automatically uses your affiliate link when it exists, and falls back to the original URL (with your UTM tracking) when it doesn't.

## Step 4: Track Your Progress

Use the exported CSV (`top-100-tools-for-affiliates.csv`) to track:
- ✅ Which programs you've applied to
- ✅ Approval status
- ✅ Commission rates
- ✅ Your affiliate codes

## Realistic Timeline

**Week 1:**
- Apply to 3-4 affiliate networks
- Focus on top 10 tools with direct programs

**Month 1:**
- Get 20-30 affiliate links set up
- These will cover your most popular tools

**Month 3:**
- 50-100 affiliate links
- Covering 80%+ of your traffic

**Month 6:**
- 200+ affiliate links
- Now you're making serious money!

## Pro Tips

### 1. Start with the Obvious Wins
These tools definitely have affiliate programs:
- Claude (Anthropic)
- Notion
- Grammarly
- Canva
- Jasper
- Copy.ai
- ElevenLabs
- Synthesia

### 2. Batch Your Applications
Apply to 5-10 programs at once, then wait for approvals before applying to more.

### 3. Focus on Recurring Commissions
Tools with subscription pricing = recurring monthly income for you!

### 4. Track Everything
Keep notes in the `affiliateLinks.ts` file:
- When you applied
- Approval date
- Commission rate
- Any special terms

## What About the Other 7,900 Tools?

**You don't need affiliate links for all of them!**

The system automatically adds YOUR tracking (utm_source=ai-tools-hub) to any tool without an affiliate link. This lets you:
- Track which tools get clicks
- Prioritize which ones to get affiliate links for next
- Build relationships with tool creators
- Potentially negotiate direct partnerships

## Revenue Expectations

**Conservative estimate** with just top 100 tools:
- 10,000 monthly visitors
- 5% click-through rate = 500 clicks
- 2% conversion = 10 sales
- Average $50 commission = $500/month

**As you scale to 500+ affiliate links:**
- Same traffic could generate $2,000-5,000/month

## Need Help?

Common questions:

**Q: How do I find a tool's ID?**
A: It's in the CSV export, or check the browser console when viewing a tool

**Q: What if my affiliate link gets rejected?**
A: No problem! The original URL (with your tracking) will still work

**Q: Can I use short links (like bit.ly)?**
A: Yes! The system doesn't care what URL format you use

**Q: Should I disclose affiliate links?**
A: YES! Add a disclaimer to your site. It's required by FTC and builds trust.

---

## Quick Start Checklist

- [ ] Run `node scripts/prioritize-affiliates.js`
- [ ] Open `top-100-tools-for-affiliates.csv`
- [ ] Apply to PartnerStack, Impact, and ShareASale
- [ ] Check top 10 tools for direct affiliate programs
- [ ] Add your first affiliate link to `affiliateLinks.ts`
- [ ] Test it works (click through and check the URL)
- [ ] Add affiliate disclosure to your site
- [ ] Keep adding links as you get approved!

**You got this! 🚀**
