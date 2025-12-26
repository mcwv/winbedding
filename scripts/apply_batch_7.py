
from mass_enrichment_engine import update_tool
import psycopg2
import os

batch_data = {
    "17": { # AISEO
        "name": "AISEO",
        "tagline": "AI SEO Writing Assistant",
        "description": "AISEO is an AI-powered writing assistant that helps content creators generate SEO-optimized articles, paraphrase text, and humanize AI content.",
        "features": ["SEO Article Writer", "Humanize AI Content", "Topical Authority", "Readability Booster"],
        "pricing_model": "freemium"
    },
    "55": { # Chat EQ
        "name": "Chat EQ",
        "tagline": "AI for Conflict Resolution",
        "description": "Chat EQ provides AI-powered coaching to help users navigate difficult conversations and resolve conflicts using research-based communication strategies.",
        "features": ["Conflict Resolution Coaching", "Emotional Tone Analysis", "Compassionate Communication", "Real-time Feedback"],
        "pricing_model": "freemium"
    },
    "78": { # Clona AI
        "name": "Clona AI",
        "tagline": "Create & Chat with AI Clones",
        "description": "Clona AI allows users to create and interact with digital replicas of personalities, offering unrestricted conversations and custom photo generation.",
        "features": ["Digital Clone Creation", "Unrestricted Chat", "Audio Responses", "Custom Photo Generation"],
        "pricing_model": "freemium"
    },
    "79": { # AI Cover
        "name": "AI Cover Design",
        "tagline": "AI Book Cover Generator",
        "description": "AI Cover Design uses generative AI to create professional book cover concepts, artistic mockups, and visual inspiration for authors.",
        "features": ["AI Cover Generation", "Midjourney Integration", "Book Mockups", "Design Inspiration"],
        "pricing_model": "freemium"
    },
    "80": { # Ai Deep Nude - Neutral description
        "name": "Ai Deep Nude",
        "tagline": "AI Image Transformation Tool",
        "description": "Ai Deep Nude utilizes generative adversarial networks (GANs) to perform advanced body-aware image processing and transformation.",
        "features": ["Generative Adversarial Networks", "Image Transformation", "Body-Aware Processing", "Automated Editing"],
        "pricing_model": "freemium"
    },
    "102": { # Charisma
        "name": "Charisma.ai",
        "tagline": "Interactive Storytelling Engine",
        "description": "Charisma.ai enables creators to build immersive interactive stories with believable virtual characters that remember context and express emotion.",
        "features": ["Interactive Story Engine", "Emotional AI Voices", "Memory & Context", "Unity/Unreal SDKs"],
        "pricing_model": "freemium"
    },
    "103": { # ContentDojo AI
        "name": "ContentDojo",
        "tagline": "AI Content & SEO Assistant",
        "description": "ContentDojo is an AI workspace for generating and optimizing content, offering tools for SEO analysis, idea generation, and multilingual writing.",
        "features": ["SEO Content Optimization", "Idea Generation", "Multilingual Support", "Collaborative Workspace"],
        "pricing_model": "paid"
    }
}

if __name__ == "__main__":
    print(f"Applying Batch 7 updates for {len(batch_data)} tools...")
    for tid, data in batch_data.items():
        print(f"Updating ID {tid}...")
        update_tool(tid, data)
    print("Batch 7 applied successfully.")
