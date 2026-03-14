import 'dotenv/config';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * Basic seed data generator for organizations, teams, users, and roles.
 * Run with: npm run seed:db
 */

export async function seedDatabase() {
  console.log('\n🌱 Seeding basic data...\n');

  // Generate sample data
  const orgId = uuid();
  const org = {
    id: orgId,
    name: 'Acme Corp',
    description: 'Sample organization for testing eval framework',
  };

  const teamId = uuid();
  const team = {
    id: teamId,
    org_id: orgId,
    name: 'AI Safety Team',
    description: 'Evaluating LLM safety and moderation',
  };

  const userId = uuid();
  const user = {
    id: userId,
    email: 'admin@acme.local',
    name: 'Admin User',
    password_hash: await bcrypt.hash('admin123', 10),
    role: 'admin',
    api_key: uuid(),
    is_active: true,
  };

  const userTeamRole = {
    id: uuid(),
    user_id: userId,
    team_id: teamId,
    role: 'owner',
  };

  console.log('✅ Organization:');
  console.log(`   ID: ${orgId}`);
  console.log(`   Name: ${org.name}`);

  console.log('\n✅ Team:');
  console.log(`   ID: ${teamId}`);
  console.log(`   Name: ${team.name}`);

  console.log('\n✅ User:');
  console.log(`   ID: ${userId}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   API Key: ${user.api_key}`);

  console.log('\n📝 Seed data ready. Now run: npm run seed:moderation\n');

  return { org, team, user, userTeamRole };
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
