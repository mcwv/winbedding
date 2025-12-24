import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function adamsWriter() {
  console.log('🚀 Starting the Standardized Adams Writer...');

  while (true) {
    const { data: tools } = await supabase
      .from('tools')
      .select('id, name, description, tracking_metadata, reddit_morsels')
      .not('reddit_morsels', 'is', null)
      .is('adams_description', null)
      .limit(5);

    if (!tools || tools.length === 0) {
      console.log('🏁 Queue empty. Waiting 30s...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      continue;
    }

    for (const tool of tools) {
      const websiteContext = tool.tracking_metadata?.scraped_content?.clean_text || tool.description || "No website data available.";
      const socialContext = JSON.stringify(tool.reddit_morsels);

const prompt = `Write a product description for "${tool.name}" in the dry, British, cynical, cosmic wit of Douglas Adams.

### CONTEXT:
TOOL NAME: ${tool.name}
WEBSITE DATA: ${websiteContext.substring(0, 1500)}
HUMAN SALT: ${socialContext}

### MANDATORY MECHANICAL RULES:
1. THE FIRST SENTENCE MUST START with the name of the tool (e.g., "${tool.name} is a...").
2. FORBIDDEN WORDS (DO NOT USE): "Ah", "yes", "Behold", "Greetings", "taken", "upon", "itself", "task", "unenviable".
3. NO FILLER: Do not say "Here is a description" or acknowledge the prompt.
4. METAPHOR REQUIREMENT: Use the HUMAN SALT to find a unique, weird metaphor. (e.g. if salt says "scam," describe it as a cosmic pyramid scheme).
5. PUNCTUATION: No em-dashes (—) or en-dashes (–). Use commas or full stops.
6. If Human Salt is "NO_HUMAN_SALT_FOUND", describe it as peacefully anonymous in the void.`;
      try {
        const msg = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        });

        const content = msg.content[0].type === 'text' ? msg.content[0].text : '';

        // SAVE TO DATABASE
        await supabase.from('tools').update({ adams_description: content }).eq('id', tool.id);

        // PRINT TO TERMINAL
        console.log(`\n✨ --- NEW PUBLICATION: ${tool.name} ---`);
        console.log(content);
        console.log(`------------------------------------------\n`);

      } catch (e: any) {
        console.log(`   ❌ Error for ${tool.name}: ${e.message}`);
      }
    }
  }
}

adamsWriter();