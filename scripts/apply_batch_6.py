
from mass_enrichment_engine import update_tool, clean_name, calculate_quality_score
import psycopg2
import os

# Data derived from Agentic Web Search
batch_data = {
    "1": { # @kuki_ai
        "name": "Kuki AI",
        "tagline": "Award-Winning AI Companion Chatbot",
        "description": "Kuki AI is an embodied AI chatbot designed for open-ended conversation, social engagement, and emotional connection across multiple platforms.",
        "features": ["Open-ended Conversation", "Emotional Intelligence", "Multi-channel Integration", "Gamified Interaction"],
        "pricing_model": "freemium"
    },
    "2": { # 123RF
        "name": "123RF AI",
        "tagline": "AI-Powered Stock Image Generation",
        "description": "123RF's AI Image Generator transforms text prompts into high-quality photorealistic stock images with commercial licensing and legal protection.",
        "features": ["Text-to-Image Generation", "$25k Legal Guarantee", "Commercial Licensing", "Generative Fill"],
        "pricing_model": "freemium"
    },
    "3": { # 10Web
        "tagline": "AI Website Builder & Hosting",
        "description": "10Web is an automated WordPress platform that uses AI to build, host, and optimize websites in minutes, including recreating existing sites.",
        "features": ["AI Website Builder", "WordPress Hosting", "Site Recreation", "PageSpeed Booster"],
        "pricing_model": "freemium"
    },
    "4": { # 123RF Duplicate -> Update anyway or skip? Update to be safe.
        "name": "123RF AI Image Generator",
        "tagline": "AI-Powered Stock Image Generation",
        "description": "123RF's AI Image Generator transforms text prompts into high-quality photorealistic stock images with commercial licensing and legal protection.",
        "features": ["Text-to-Image Generation", "$25k Legal Guarantee", "Commercial Licensing", "Generative Fill"],
        "pricing_model": "freemium"
    },
    "5": { # 16x Prompt
        "tagline": "Desktop Prompt Engineering Tool",
        "description": "16x Prompt is a desktop application for developers that streamlines prompt creation for LLMs with source code context and privacy.",
        "features": ["Source Code Context", "Local Processing", "Visual Diff Viewer", "Multi-LLM Support"],
        "pricing_model": "freemium"
    },
    "6": { # 15 Minute Plan
        "tagline": "AI Business Plan Generator",
        "description": "15MinutePlan.ai generates comprehensive, SBA-approved business plans in minutes using AI to structure strategy and financial projections.",
        "features": ["SBA-Approved Format", "Talk-to-Plan Editing", "Multi-language Support", "Financial Projections"],
        "pricing_model": "paid"
    },
    "8": { # 2short.ai (Note: ID 8 from list, skipped 7 which was missing in output)
        "tagline": "Viral Short Clips from Long Video",
        "description": "2short.ai uses AI to automatically extract engaging short clips from long-form YouTube videos for TikTok, Reels, and Shorts.",
        "features": ["Auto-Clip Extraction", "Face Tracking", "Animated Subtitles", "Vertical Cropping"],
        "pricing_model": "freemium"
    },
    "9": { # Adrenaline
        "tagline": "AI Debugger for Developers",
        "description": "Adrenaline is an AI coding assistant that fixes errors by analyzing stack traces and codebase context to suggest root-cause solutions.",
        "features": ["Stack Trace Analysis", "Codebase Awareness", "One-Click Fixes", "GitHub Integration"],
        "pricing_model": "freemium"
    }
}

if __name__ == "__main__":
    print(f"Applying Batch 6 updates for {len(batch_data)} tools...")
    for tid, data in batch_data.items():
        print(f"Updating ID {tid}...")
        update_tool(tid, data)
    print("Batch 6 applied successfully.")
