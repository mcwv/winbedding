-- Refined Batch 1 Enrichment (Tools 1-10)
-- Verified by Antigravity AI (2025-12-25)

-- ID 1: @kuki_ai
UPDATE tools SET 
    description = 'Kuki is an award-winning conversational AI chatbot developed using AIML, designed for engagement, entertainment, and companionship. It has famously partnered with brands like H&M, where it boosted ad recall by 11x.', 
    tagline = 'The most human AI in the world.',
    v2_category = 'Chatbots', 
    features = '{"Conversational AI", "AIML-powered", "Brand Ambassador API", "Cross-platform (Web, Roblox, Social)"}', 
    pricing_model = 'free',
    updated_at = NOW() 
WHERE id = 1;

-- ID 2: 123RF
UPDATE tools SET 
    description = '123RF offers an AI Image Generator integrated with its massive stock library. It includes tools for face-swapping, background removal, and generative fill, backed by $25,000 in legal coverage for commercial use.', 
    v2_category = 'AI Image Generation', 
    features = '{"Text-to-Image", "Face Swap", "Generative Fill", "Background Remix", "Legal Indemnity"}', 
    pricing_model = 'freemium',
    cons = '{"Requires credits for high-res downloads", "Image acceptance for contributors varies"}',
    pros = '{"Huge stock library integration", "Verified legal safety", "Free 7-day trial"}',
    updated_at = NOW() 
WHERE id = 2;

-- ID 3: 10Web
UPDATE tools SET 
    description = '10Web is an AI-powered WordPress platform that automates website building, hosting, and PageSpeed optimization. It features an AI builder that can recreate any website or build a new one from a prompt.', 
    v2_category = 'Website Builders', 
    features = '{"AI WordPress Builder", "Managed Google Cloud Hosting", "PageSpeed Booster (90+ Score)", "Elementor-based Editing"}', 
    pricing_model = 'subscription',
    cons = '{"Locked to WordPress ecosystem", "AI output can be repetitive for simple prompts"}',
    updated_at = NOW() 
WHERE id = 3;

-- ID 4: 123RF AI Image Generator
UPDATE tools SET 
    description = 'The specialized AI wing of 123RF, focusing on prompt-to-image creation and advanced AI editing tools like Image Extender and Upscaler.', 
    v2_category = 'AI Image Generation', 
    features = '{"Text-to-Image", "Image Extender", "AI Upscaler", "Stealth Mode Privacy"}', 
    pricing_model = 'freemium',
    updated_at = NOW() 
WHERE id = 4;

-- ID 5: 16x Prompt
UPDATE tools SET 
    description = 'A desktop-based prompt engineering tool designed specifically for developers to manage source code context and optimize prompts for models like GPT-4 and Gemini.', 
    v2_category = 'Developer Tools', 
    features = '{"Context Management", "Local Source Code Mapping", "Multi-OS (Win, Mac, Linux)", "Anthropic/OpenAI API Integration"}', 
    pricing_model = 'paid',
    updated_at = NOW() 
WHERE id = 5;

-- ID 6: 15 Minute Plan
UPDATE tools SET 
    description = 'An AI business plan generator that guides users through a questionnaire to create professional, investor-ready business plans in 15 minutes.', 
    v2_category = 'Business Planning', 
    features = '{"AI Questionnaire", "Financial Projections", "Investor-Ready Layouts", "Market Analysis Generation"}', 
    pricing_model = 'paid',
    updated_at = NOW() 
WHERE id = 6;

-- ID 8: 2short.ai
UPDATE tools SET 
    description = 'An AI tool that automatically extracts viral short clips from long-form YouTube videos, featuring facial tracking and animated captions.', 
    v2_category = 'Video Editing', 
    features = '{"AI Highlight Detection", "Center Stage Facial Tracking", "One-click Animated Subtitles", "Multi-language Support"}', 
    pricing_model = 'freemium',
    pros = '{"Watermark-free 1080p exports", "Automated branding overlays"}',
    updated_at = NOW() 
WHERE id = 8;

-- ID 9: Adrenaline
UPDATE tools SET 
    description = 'An AI debugger and codebase comprehension tool that connects to GitHub to help developers understand, fix, and visualize complex code.', 
    v2_category = 'Developer Tools', 
    features = '{"AI Debugging", "Codebase Visualization", "GitHub Integration", "Runnable Patches"}', 
    pricing_model = 'freemium',
    updated_at = NOW() 
WHERE id = 9;

-- ID 17: AISEO
UPDATE tools SET 
    description = 'An advanced AI writing assistant focused on creating human-like, SEO-optimized long-form content with built-in readability and paraphrasing tools.', 
    v2_category = 'AI Writing', 
    features = '{"SEO Humanizer", "Long-form Article Writer", "Topical Authority Tools", "26+ Language Support"}', 
    pricing_model = 'subscription',
    updated_at = NOW() 
WHERE id = 17;

-- ID 55: Chat EQ
UPDATE tools SET 
    description = 'A conflict resolution tool that uses AI to help users navigate difficult conversations using psychologically-backed compassionate communication (NVC).', 
    v2_category = 'Personal Development', 
    features = '{"Conflict Analysis", "Compassionate Communication Guidance", "Response Scenarios", "Privacy-focused Analysis"}', 
    pricing_model = 'freemium',
    updated_at = NOW() 
WHERE id = 55;
