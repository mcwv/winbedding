import psycopg2
import os
import json
from dotenv import load_dotenv

# Use the production DB URL
DB_URL = "postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

def fetch_tools_needing_enrichment(limit=50):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, website_url 
        FROM tools 
        WHERE (tagline IS NULL OR tagline = '')
        AND website_url IS NOT NULL
        LIMIT %s
    """, (limit,))
    rows = cur.fetchall()
    conn.close()
    return rows

def normalize_pricing(pricing):
    allowed = ['free', 'freemium', 'paid', 'contact', 'open-source']
    pricing = str(pricing).lower().strip()
    if pricing in allowed:
        return pricing
    if 'sub' in pricing or 'paid' in pricing or 'monthly' in pricing:
        return 'paid'
    if 'free' in pricing and 'premium' in pricing:
        return 'freemium'
    if 'free' in pricing:
        return 'free'
    if 'contact' in pricing or 'quote' in pricing:
        return 'contact'
    return 'paid' # Default to paid

def clean_name(name):
    # Strip SEO fluff like "| Free Online Tool", "(Hugging Face)", etc.
    if not name: return name
    for separator in [' | ', ' - ', ' (']:
        if separator in name:
            name = name.split(separator)[0]
    return name.strip()

def calculate_quality_score(data):
    # Start with a base score
    score = 40 
    # Add points for data depth
    if data.get('pricing_model') and data.get('pricing_model') != 'contact': score += 15
    if len(data.get('features', [])) >= 4: score += 20
    if len(data.get('description', '')) > 100: score += 15
    if data.get('tagline') and len(data.get('tagline')) > 10: score += 10
    return min(score, 100)

def update_tool(tool_id, data):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    pricing = normalize_pricing(data.get('pricing_model'))
    name = clean_name(data.get('name', ''))
    score = calculate_quality_score(data)
    
    cur.execute("""
        UPDATE tools 
        SET 
            name = %s,
            tagline = %s,
            description = %s,
            features = %s,
            pricing_model = %s,
            quality_score = %s,
            updated_at = NOW()
        WHERE id = %s
    """, (
        name,
        data.get('tagline'),
        data.get('description'),
        data.get('features'),
        pricing,
        score,
        tool_id
    ))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    tools_data = {
        "BuzzSumo": {
            "tagline": "Content Marketing & Topic Discovery Tool",
            "description": "BuzzSumo helps marketers discover trending content, generate ideas, and identify key influencers through deep social media analytics and backlink data.",
            "features": ["Trending Content Discovery", "Content Ideas Generator", "Influencer Identification", "Backlink Analysis"],
            "pricing_model": "paid"
        },
        "Vondy": {
            "tagline": "Next Generation AI Productivity Apps",
            "description": "Vondy is a comprehensive AI platform offering custom-built applications for marketing, content creation, and data analysis in a single user-centric dashboard.",
            "features": ["Custom AI App Builder", "Multi-model Chat Assistant", "Smart Content Generation", "Multi-language Translation"],
            "pricing_model": "freemium"
        },
        "Coconaut": {
            "tagline": "Build Custom AI Chatbots in Minutes",
            "description": "Coconaut AI allows businesses to train and deploy personalized chatbots using their own websites and documents, supporting over 50 languages.",
            "features": ["Custom Knowledge Base Training", "50+ Language Support", "Multi-Model Integration (GPT-4)", "One-line Code Embed"],
            "pricing_model": "freemium"
        },
        "Rem BG": {
            "tagline": "Effortless AI Background Removal",
            "description": "Rem BG provides high-quality, professional-grade background removal for images with advanced AI models like Bria RMBG 2.0.",
            "features": ["AI Background Removal", "Bulk Image Editing", "API Integration", "High-Resolution Processing"],
            "pricing_model": "freemium"
        },
        "Broken Bear": {
            "tagline": "Your Anonymous AI Emotional Support Teddy",
            "description": "Broken Bear is an AI-powered teddy bear chatbot that provides a safe, anonymous space for users to vent feelings and receive emotional comfort.",
            "features": ["Anonymous Emotional Support", "24/7 Availability", "Non-judgmental Interaction", "Crisis Assistance Referral"],
            "pricing_model": "free"
        },
        "Crystal": {
            "tagline": "Personality-Driven Communication Insights",
            "description": "Crystal (Crystal Knows) analyzes public data to identify people's personality types (DISC/Enneagram), helping teams communicate more effectively based on behavioral insights.",
            "features": ["Personality Detection", "Behavioral Communication Tips", "DISC Assessment", "Salesforce Integration"],
            "pricing_model": "freemium"
        },
        "Hypergro": {
            "tagline": "AI-Powered Growth Marketing for Social",
            "description": "Hypergro is an 4th generation AI platform that optimizes social media ad spend and content creation through deep audience analytics and UGC hooks.",
            "features": ["AI Audience Targeting", "Multi-Platform Integration", "Real-time Performance Insights", "UGC Content Creation"],
            "pricing_model": "paid"
        },
        "PicTales": {
            "tagline": "Transform Your Photos into Narratives",
            "description": "PicTales uses AI to turn individual photos into fully illustrated, multi-page personalized stories with audio narrations for children and families.",
            "features": ["AI Story Illustration", "Audio Narration Sync", "Personalized Storybooks", "Multi-language support"],
            "pricing_model": "freemium"
        },
        "Arting NSFW AI Image Generator": {
            "name": "Arting",
            "tagline": "Real-time AI Image & Video Studio",
            "description": "Arting.ai provides a comprehensive creative suite for generating high-resolution AI art and cinematic videos from simple text descriptions.",
            "features": ["Real-time Image Generation", "Cinematic Video Creation", "Voice Synthesis Studio", "API Creative Access"],
            "pricing_model": "free"
        },
        "ARTIRO": {
            "tagline": "Original AI Content & Transcription",
            "description": "ARTIRO is a versatile AI generator that creates original marketing copy, artistic images, and provides high-accuracy file transcriptions.",
            "features": ["AI Content Templates", "Multi-lingual Transcription", "AI Image Generation", "Creative Writing Assistant"],
            "pricing_model": "paid"
        },
        "DevGPT": {
            "tagline": "The Complete AI Developer Toolset",
            "description": "DevGPT (formerly DevKit) provides over 30 AI mini-tools designed to automate boilerplate code, unit testing, and component creation for solo devs and teams.",
            "features": ["Natural Language Code Gen", "Automated Unit Testing", "Repository-Aware Training", "Component Scaffolding"],
            "pricing_model": "paid"
        },
        "Ask Marcus Aurelius": {
            "tagline": "Your Personal Stoic AI Mentor",
            "description": "Ask Marcus Aurelius provides daily Stoic lessons and philosophical advice through a conversational AI assistant available on Telegram.",
            "features": ["Daily Stoic Lessons", "Philosophical Chat", "Telegram Integration", "Stoicism Quizzes"],
            "pricing_model": "free"
        },
        "SideKik": {
            "name": "Sidekick AI",
            "tagline": "AI-Powered Scheduling Assistant",
            "description": "Sidekick AI automates the back-and-forth of meeting scheduling by intelligently coordinating calendars and interaction preferences.",
            "features": ["Intelligent Calendar Coordination", "Unlimited Scheduling Pages", "Multi-source Sync", "Team Booking Links"],
            "pricing_model": "freemium"
        },
        "SingleStoreDB": {
            "name": "SingleStore",
            "tagline": "Real-time AI & Vector Database",
            "description": "SingleStore is a high-performance database designed to power real-time AI applications with built-in vector search and hybrid processing capabilities.",
            "features": ["Built-in Vector Search", "Hybrid Data Processing", "Multi-model Support", "Real-time SQL Analytics"],
            "pricing_model": "paid"
        },
        "Clipdrop": {
            "tagline": "Professional AI Photo Editing Suite",
            "description": "Clipdrop (by Stability AI) provides a suite of advanced imaging tools for relighting, upscaling, and removing objects or backgrounds with a single click.",
            "features": ["AI Image Upscaling", "One-click Object Removal", "Advanced Photo Relighting", "Background Extraction"],
            "pricing_model": "freemium"
        },
        "OpenAI": {
            "name": "ChatGPT",
            "tagline": "The World's Most Advanced AI Assistant",
            "description": "ChatGPT is the leading conversational AI platform for writing, coding, reasoning, and multimodal content creation across web and mobile.",
            "features": ["Multimodal Chat (Vision/Voice)", "GPT-4 Reasoning Models", "DALL-E 3 Image Generation", "Advanced Data Analysis"],
            "pricing_model": "freemium"
        },
        "Slayer": {
            "name": "ThreatSlayer",
            "tagline": "AI-Powered Browser Security & Protection",
            "description": "ThreatSlayer is an AI-driven browser extension that protects users from web-based threats while rewarding participation with blockchain tokens.",
            "features": ["Real-time Web Protection", "AI Threat Detection", "Web3 Privacy Security", "Participation Rewards"],
            "pricing_model": "free"
        },
        "OutSystems": {
            "tagline": "AI-Powered Enterprise Low-Code Platform",
            "description": "OutSystems is a high-performance low-code platform that leverages AI to accelerate the build, deployment, and management of business-critical applications.",
            "features": ["AI-Driven App Generation", "Built-in DevSecOps", "Enterprise Security", "Full-stack Visual Development"],
            "pricing_model": "contact"
        },
        "Recast": {
            "tagline": "Turn Your Reading List into Podcasts",
            "description": "Recast uses AI to transform long-form articles and documents into engaging, bite-sized audio summaries and mini-podcasts.",
            "features": ["Text-to-Podcast Conversion", "Private RSS Feeds", "Offline Audio Listening", "Multi-document Support"],
            "pricing_model": "freemium"
        },
        "Madgicx": {
            "tagline": "AI-Powered Ad Optimization & Scale",
            "description": "Madgicx is an advanced advertising platform that uses AI to automate Meta ad scaling, creative testing, and ROI optimization for brands.",
            "features": ["AI Meta Ad Marketer", "Creative Optimization", "ROI Analytics", "Ad Spend Automation"],
            "pricing_model": "paid"
        },
        "Jarvis": {
            "name": "Jasper",
            "tagline": "High-Performance AI Writing Assistant",
            "description": "Jasper (formerly Jarvis) is an enterprise-grade AI writing platform designed to help teams create high-quality, brand-consistent content at scale.",
            "features": ["Brand Voice Customization", "SEO Campaign Builder", "Team Collaboration Tools", "Marketing Template Library"],
            "pricing_model": "paid"
        },
        "Trenz": {
            "tagline": "Dominate TikTok with AI & Data",
            "description": "Trenz AI helps creators and brands scale on TikTok by using data-driven insights to find winning products and automate video content creation.",
            "features": ["TikTok Trend Discovery", "AI Script Writing", "Competitor ROI Tracking", "Creator Performance Analytics"],
            "pricing_model": "freemium"
        },
        "CinemaFlow AI": {
            "tagline": "One-Click Script to Cinematic Video",
            "description": "CinemaFlow AI instantly transforms written scripts into polished cinematic videos with AI-powered cinematography and 4K UHD output.",
            "features": ["Script-to-Video Engine", "AI Cinematography", "4K UHD Export", "Professional Editing Suite"],
            "pricing_model": "paid"
        },
        "Ocean.io": {
            "tagline": "B2B Lookalike Search & ABM Platform",
            "description": "Ocean.io uses AI to analyze CRM data and identify high-value B2B prospects through intelligent lookalike searches and lead scoring.",
            "features": ["Prospect Lookalike Search", "B2B Lead Scoring", "Data Enrichment", "CRM Direct Integration"],
            "pricing_model": "paid"
        },
        "Daystack": {
            "tagline": "AI-Powered Collaborative Workspace",
            "description": "Daystack unifies team communications and project management with AI-driven insights to streamline daily operations and productivity.",
            "features": ["Unified Workspace", "AI Productivity Insights", "Project Collaboration", "Operations Management"],
            "pricing_model": "free"
        }
    }

    print(f"Feeding {len(tools_data)} tools into the database...")
    for tid, name, url in fetch_tools_needing_enrichment(200):
        # We check both raw name and potentially folder name or cleaned name
        tool_entry = None
        for key in tools_data:
            if key.lower() in name.lower() or name.lower() in key.lower():
                tool_entry = tools_data[key]
                break
        
        if tool_entry:
            tool_entry['name'] = tool_entry.get('name', name) # keep specific name if set
            print(f"Updating {name} (ID: {tid})...")
            update_tool(tid, tool_entry)
    print("Done! The fifth batch is cooked.")
