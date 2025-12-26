
from mass_enrichment_engine import update_tool
import psycopg2
import os

batch_data = {
    # --- Pass 1 Tools ---
    "128": {"name": "AI Hairstyle", "tagline": "Virtual Hairstyle Try-On", "description": "AI Hairstyle lets users visualize different haircuts and colors using AI, offering credit-based or subscription plans for generated previews.", "features": ["Virtual Hairstyle Try-On", "Color Simulation", "Gender-Neutral Styles", "Photo-Realistic Output"], "pricing_model": "paid"},
    # "AI Helpers" -> skipped, too generic/ambiguous in search results
    "138": {"name": "AI Holiday Cards", "tagline": "Personalized AI Holiday Greetings", "description": "AI Holiday Cards generates realistic themed photos and custom postcards for couples and families using AI.", "features": ["Themed Photo Generation", "Custom Postcards", "Couple/Family Focus", "One-time Purchase"], "pricing_model": "paid"},
    "139": {"name": "AI Magicx", "tagline": "AI Graphics & Content Generator", "description": "AI Magicx is a comprehensive suite for generating AI graphics, logos, and content, offering lifetime deals and high-volume business plans.", "features": ["AI Graphic Design", "Logo Generator", "Content Writing", "Lifetime Deals"], "pricing_model": "paid"},
    "144": {"name": "AiMaps", "tagline": "Deep Learning for Geospatial Data", "description": "AiMaps by IDS GeoRadar uses deep learning to process and analyze massive geospatial datasets for accurate mapping and subsurface detection.", "features": ["Deep Learning Processing", "Geospatial Analysis", "Subsurface Detection", "Cloud Streaming"], "pricing_model": "paid"},
    "147": {"name": "AI Named My Pet", "tagline": "Creative Pet Name Generator", "description": "AI Named My Pet is a fun, free tool that uses AI to generate unique and personalized names for pets based on their characteristics.", "features": ["Personalized Name Generation", "Pet Characteristic Analysis", "Simple Interface", "Instant Results"], "pricing_model": "free"},
    "148": {"name": "AI Pal", "tagline": "Advanced AI Chat Assistant", "description": "AI Pal is a versatile AI chat assistant offering unlimited messaging, image generation, and long-form content support across various mobile and web platforms.", "features": ["Unlimited Chat", "AI Image Generation", "Long-form Content", "Multi-platform"], "pricing_model": "paid"},
    # "150": AI Photo / IXEAU -> pricing unclear, skipping ensuring high quality
    "152": {"name": "AI Placeholder", "tagline": "AI Dummy Data Generator", "description": "AI Placeholder provides a free API for developers to generate varied, realistic dummy content for testing and prototyping using GPT models.", "features": ["Dummy Data API", "GPT-3.5 Integration", "Realistic Content Gen", "Developer Friendly"], "pricing_model": "free"},
    
    # --- Pass 2 Tools ---
    "162": {"name": "Ai Prolific", "tagline": "AI Content & Marketing Suite", "description": "Ai Prolific offers a range of AI tools for content creation and marketing, with both free basic access and premium features.", "features": ["Content Generation", "Marketing Tools", "Free Basic Access", "Premium Tiers"], "pricing_model": "freemium"},
    # "170": Sitekick -> pricing missing
    "172": {"name": "AI Sidekick", "tagline": "AI Team Assistant & Q&A", "description": "AI Sidekick (Sidekick Pro) acts as a virtual team member, handling Q&A, chat assistance, and knowledge retrieval for Slack and other platforms.", "features": ["Team Q&A", "Knowledge Retrieval", "Slack Integration", "24/7 Support"], "pricing_model": "freemium"},
    # "173", "177", "180" -> pricing missing
    "182": {"name": "Chat AI", "tagline": "AI Chatbot Assistant", "description": "Chat AI is a mobile and web-based chatbot assistant offering conversational AI capabilities, often used for productivity and general queries.", "features": ["Conversational AI", "Productivity Assistance", "Mobile App", "Subscription Options"], "pricing_model": "freemium"},
    # "183" Maestra -> pricing ambiguous
    "186": {"name": "AI SuitUp", "tagline": "Professional AI Headshots", "description": "AI SuitUp generates professional business headshots from casual photos using advanced AI, with rapid turnaround times.", "features": ["Professional Headshot Gen", "1-3 Hour Turnaround", "Business Style Focus", "One-time Payment"], "pricing_model": "paid"},
    "188": {"name": "AI Tab Group", "tagline": "Automatic Browser Tab Organizer", "description": "AI Tab Group automatically categorizes and organizes browser tabs using AI to declutter workspaces and improve productivity.", "features": ["Auto-Categorization", "Tab Hierarchy", "Workspace Saving", "Chrome Extension"], "pricing_model": "freemium"},
    "189": {"name": "Headliner", "tagline": "AI Video & Audiogram Maker", "description": "Headliner uses AI to repurpose audio content into engaging social media videos and audiograms, with automated transcription and waveform viz.", "features": ["Audiogram Creation", "Auto-Transcription", "Social Video Export", "Podcast Promo Tools"], "pricing_model": "freemium"},
    # "191" -> pricing missing
    "192": {"name": "mabl", "tagline": "Intelligent Test Automation", "description": "mabl is a low-code, AI-driven test automation platform for quality engineering, supporting end-to-end testing for web and mobile apps.", "features": ["Low-Code Testing", "Self-Healing Tests", "Cloud Execution", "End-to-End Coverage"], "pricing_model": "paid"},
    # "196" -> pricing missing
    "197": {"name": "Clipchamp", "tagline": "Quick & Easy Video Editor", "description": "Clipchamp (by Microsoft) is a user-friendly video editor with AI automations like auto-captions, text-to-speech, and speaker coaching.", "features": ["AI Auto-Captions", "Text-to-Speech", "Speaker Coach", "Microsoft Integration"], "pricing_model": "freemium"},
    "198": {"name": "BetterPic", "tagline": "4K AI Professional Headshots", "description": "BetterPic generates high-resolution 4K professional headshots with multiple styles and AI editing capabilities for individuals and teams.", "features": ["4K Resolution", "Multiple Styles", "Commercial License", "Fast Turnaround"], "pricing_model": "paid"},
    "199": {"name": "Visla", "tagline": "AI-Powered Video Recording & Editing", "description": "Visla is an all-in-one video platform that uses AI to record, edit, and polish videos for business communication and content creation.", "features": ["AI Video Generation", "Teleprompter", "Text-Based Editing", "Auto-Silence Removal"], "pricing_model": "freemium"},
    # "200" -> pricing missing
}

if __name__ == "__main__":
    print(f"Applying Batch 8 (Scaled) updates for {len(batch_data)} high-quality matches...")
    for tid, data in batch_data.items():
        print(f"Updating ID {tid}...")
        update_tool(tid, data)
    print("Batch 8 applied successfully.")
