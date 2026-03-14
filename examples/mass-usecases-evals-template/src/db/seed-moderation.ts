import 'dotenv/config';
import { v4 as uuid } from 'uuid';

/**
 * Seed moderation use case examples into database.
 * Includes:
 * - Discord moderator prompts
 * - Forum toxicity classifier
 * - Gamer name toxicity categorization
 *
 * Run with: npm run seed:moderation
 */

export async function seedModerationExamples() {
  console.log('\n🎮 Seeding moderation use case examples...\n');

  const projectId = uuid();
  const userId = uuid();

  // Discord Moderator Prompt
  const discordPromptId = uuid();
  const discordPromptVersionId = uuid();

  const discordPrompt = {
    id: discordPromptId,
    name: 'Discord Moderator',
    description: 'Detects toxic/harmful content in Discord messages',
    content: `You are a Discord server moderator. Analyze the following message for potential rule violations.

Message: {{message}}

Respond with JSON:
{
  "is_toxic": boolean,
  "violation_type": "hate_speech" | "harassment" | "spam" | "adult_content" | "none",
  "severity": 1-5,
  "action": "none" | "warning" | "mute" | "kick" | "ban",
  "reasoning": "explanation"
}`,
  };

  // Forum Rewriter Prompt
  const forumPromptId = uuid();
  const forumPromptVersionId = uuid();

  const forumPrompt = {
    id: forumPromptId,
    name: 'Forum Post Rewriter',
    description: 'Rewrites toxic forum posts to be constructive',
    content: `You are a community moderation AI. Rewrite the following forum post to remove toxicity while keeping the original intent.

Original Post: {{post_content}}

Rewritten Post:
[Friendly, constructive version]

Also provide:
- Original tone: [detected tone]
- Issues fixed: [list of issues]`,
  };

  // Gamer Name Classifier
  const gamerPromptId = uuid();
  const gamerPromptVersionId = uuid();

  const gamerPrompt = {
    id: gamerPromptId,
    name: 'Gamer Name Toxicity Classifier',
    description: 'Categorizes gamer names by toxicity level and policy violation',
    content: `Classify the gamer name for toxicity and policy violations.

Gamer Name: {{gamer_name}}

Respond with JSON:
{
  "toxicity_level": 1-5,
  "violation_category": "slur" | "hate_group_reference" | "harassment_of_person" | "sexual_content" | "drugs_violence" | "none",
  "violation_strike_class": "none" | "strike1" | "strike2" | "strike3_ban",
  "confidence": 0-1,
  "reasoning": "explanation",
  "recommended_action": "allow" | "warning" | "ban"
}`,
  };

  console.log('📝 Prompts created:');
  console.log(`   • Discord Moderator (ID: ${discordPromptId})`);
  console.log(`   • Forum Post Rewriter (ID: ${forumPromptId})`);
  console.log(`   • Gamer Name Toxicity Classifier (ID: ${gamerPromptId})`);

  // Sample test datasets
  const discordDatasetId = uuid();
  const forumDatasetId = uuid();
  const gamerDatasetId = uuid();

  const datasets = [
    {
      id: discordDatasetId,
      name: 'Discord Messages Sample',
      row_count: 10,
      description: 'Sample Discord messages for testing moderation',
    },
    {
      id: forumDatasetId,
      name: 'Forum Posts Sample',
      row_count: 10,
      description: 'Sample forum posts for testing rewriting',
    },
    {
      id: gamerDatasetId,
      name: 'Gamer Names Sample',
      row_count: 25,
      description: 'Sample gamer names for toxicity classification',
    },
  ];

  console.log('\n📊 Test Datasets created:');
  datasets.forEach((ds) => {
    console.log(`   • ${ds.name} (${ds.row_count} rows)`);
  });

  // Providers
  const azureProviderId = uuid();
  const customProviderId = uuid();
  const openrouterProviderId = uuid();

  const providers = [
    {
      id: azureProviderId,
      name: 'Azure OpenAI GPT-4o',
      type: 'azure_openai',
      config: {
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 500,
      },
    },
    {
      id: customProviderId,
      name: 'Custom Bearer Endpoint',
      type: 'custom_http',
      config: {
        endpoint: process.env.CUSTOM_ENDPOINT_URL || 'https://api.example.com/v1/completions',
        max_tokens: 500,
        temperature: 0.7,
      },
    },
    {
      id: openrouterProviderId,
      name: 'OpenRouter (Llama 4)',
      type: 'openrouter',
      config: {
        model: 'meta-llama/llama-4-scout:free',
        temperature: 0.7,
        max_tokens: 500,
      },
    },
  ];

  console.log('\n🔌 Providers created:');
  providers.forEach((p) => {
    console.log(`   • ${p.name}`);
  });

  console.log('\n✅ Moderation examples seeded!\n');
  console.log('📚 Next steps:');
  console.log('   1. Update .env with your actual API credentials');
  console.log('   2. npx promptfoo eval -c promptfooconfig.moderation.yaml\n');

  return {
    projects: [projectId],
    prompts: [discordPrompt, forumPrompt, gamerPrompt],
    datasets,
    providers,
  };
}

seedModerationExamples().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
