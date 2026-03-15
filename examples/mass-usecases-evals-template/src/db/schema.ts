import {
  mysqlTable,
  text,
  varchar,
  int,
  decimal,
  boolean,
  timestamp,
  json,
  mysqlEnum,
  primaryKey,
  foreignKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ===========================
// ORGANIZATIONS & TEAMS
// ===========================

export const organizations = mysqlTable('organizations', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
});

export const teams = mysqlTable('teams', {
  id: varchar('id', { length: 36 }).primaryKey(),
  orgId: varchar('org_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => {
  return {
    orgIdIdx: index('teams_org_id_idx').on(table.orgId),
    fk: foreignKey({ columns: [table.orgId], foreignColumns: [organizations.id] }),
  };
});

export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 36 }).primaryKey(),
  teamId: varchar('team_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => {
  return {
    teamIdIdx: index('projects_team_id_idx').on(table.teamId),
    fk: foreignKey({ columns: [table.teamId], foreignColumns: [teams.id] }),
  };
});

// ===========================
// USERS & ROLES
// ===========================

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }), // nullable for OAuth
  role: mysqlEnum('role', ['admin', 'evaluator', 'viewer']).default('viewer'),
  apiKey: varchar('api_key', { length: 255 }).unique(), // For API access
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => {
  return {
    emailUnique: uniqueIndex('users_email_idx').on(table.email),
  };
});

export const userTeamRoles = mysqlTable('user_team_roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  teamId: varchar('team_id', { length: 36 }).notNull(),
  role: mysqlEnum('role', ['owner', 'lead', 'contributor', 'viewer']).default('viewer'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdx: index('user_team_roles_user_id_idx').on(table.userId),
    teamIdx: index('user_team_roles_team_id_idx').on(table.teamId),
    fkUser: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
    fkTeam: foreignKey({ columns: [table.teamId], foreignColumns: [teams.id] }),
  };
});

// ===========================
// PROMPTS & VERSIONS
// ===========================

export const prompts = mysqlTable('prompts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  projectId: varchar('project_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  currentVersionId: varchar('current_version_id', { length: 36 }), // Which version is active
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => {
  return {
    projectIdx: index('prompts_project_id_idx').on(table.projectId),
    fk: foreignKey({ columns: [table.projectId], foreignColumns: [projects.id] }),
    fkCreatedBy: foreignKey({ columns: [table.createdBy], foreignColumns: [users.id] }),
  };
});

export const promptVersions = mysqlTable('prompt_versions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  promptId: varchar('prompt_id', { length: 36 }).notNull(),
  version: varchar('version', { length: 50 }).notNull(), // e.g., "1.0", "1.1"
  semanticTag: varchar('semantic_tag', { length: 50 }), // e.g., "v1.0.0"
  content: text('content').notNull(), // The actual prompt text
  timestamp: timestamp('timestamp').defaultNow(), // When this version was created
  notes: text('notes'), // Human description of changes
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  isProduction: boolean('is_production').default(false), // Is this the active production version?
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    promptIdx: index('prompt_versions_prompt_id_idx').on(table.promptId),
    fk: foreignKey({ columns: [table.promptId], foreignColumns: [prompts.id] }),
    fkUser: foreignKey({ columns: [table.createdBy], foreignColumns: [users.id] }),
  };
});

// ===========================
// MODELS & PROVIDERS
// ===========================

export const providers = mysqlTable('providers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  projectId: varchar('project_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., "OpenAI GPT-4", "Azure GPT-4o", "Custom Endpoint"
  type: mysqlEnum('type', [
    'openai',
    'azure_openai',
    'custom_http',
    'openrouter',
    'local',
    'anthropic',
    'google',
    'aws',
  ]).default('openai'),
  config: json('config').notNull(), // { model, temperature, max_tokens, endpoint, etc }
  isActive: boolean('is_active').default(true),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => {
  return {
    projectIdx: index('providers_project_id_idx').on(table.projectId),
    fk: foreignKey({ columns: [table.projectId], foreignColumns: [projects.id] }),
    fkUser: foreignKey({ columns: [table.createdBy], foreignColumns: [users.id] }),
  };
});

// ===========================
// TEST DATASETS
// ===========================

export const testDatasets = mysqlTable('test_datasets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  projectId: varchar('project_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sourceFile: varchar('source_file', { length: 255 }), // Path to CSV/JSON
  rowCount: int('row_count').default(0),
  schema: json('schema'), // Column names & types for reference
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    projectIdx: index('test_datasets_project_id_idx').on(table.projectId),
    fk: foreignKey({ columns: [table.projectId], foreignColumns: [projects.id] }),
    fkUser: foreignKey({ columns: [table.createdBy], foreignColumns: [users.id] }),
  };
});

export const testCases = mysqlTable('test_cases', {
  id: varchar('id', { length: 36 }).primaryKey(),
  datasetId: varchar('dataset_id', { length: 36 }).notNull(),
  rowNumber: int('row_number').notNull(),
  inputs: json('inputs').notNull(), // { language: "French", input: "Hello" }
  expectedOutputs: json('expected_outputs'), // For validation
  metadata: json('metadata'), // Extra context
}, (table) => {
  return {
    datasetIdx: index('test_cases_dataset_id_idx').on(table.datasetId),
    fk: foreignKey({ columns: [table.datasetId], foreignColumns: [testDatasets.id] }),
  };
});

// ===========================
// EVALUATION RUNS & RESULTS
// ===========================

export const evaluationRuns = mysqlTable('evaluation_runs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  projectId: varchar('project_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  config: json('config').notNull(), // Entire promptfooconfig.yaml
  datasetId: varchar('dataset_id', { length: 36 }), // Which test dataset was used
  selectedPromptVersionIds: json('selected_prompt_version_ids'), // Which prompt versions
  selectedProviderIds: json('selected_provider_ids'), // Which providers
  status: mysqlEnum('status', [
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
  ]).default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  totalTests: int('total_tests').default(0),
  passedTests: int('passed_tests').default(0),
  failedTests: int('failed_tests').default(0),
  errorMessage: text('error_message'),
  rawResults: json('raw_results'), // Raw promptfoo output
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    projectIdx: index('evaluation_runs_project_id_idx').on(table.projectId),
    statusIdx: index('evaluation_runs_status_idx').on(table.status),
    fk: foreignKey({ columns: [table.projectId], foreignColumns: [projects.id] }),
    fkDataset: foreignKey({ columns: [table.datasetId], foreignColumns: [testDatasets.id] }),
    fkUser: foreignKey({ columns: [table.createdBy], foreignColumns: [users.id] }),
  };
});

export const evaluationResults = mysqlTable('evaluation_results', {
  id: varchar('id', { length: 36 }).primaryKey(),
  runId: varchar('run_id', { length: 36 }).notNull(),
  testCaseId: varchar('test_case_id', { length: 36 }),
  providerId: varchar('provider_id', { length: 36 }).notNull(),
  promptVersionId: varchar('prompt_version_id', { length: 36 }).notNull(),
  input: json('input').notNull(),
  output: text('output'),
  expectedOutput: text('expected_output'),
  passed: boolean('passed'),
  score: decimal('score', { precision: 5, scale: 4 }), // 0-1 score
  latencyMs: int('latency_ms'),
  tokenUsage: json('token_usage'), // { prompt_tokens, completion_tokens, total_tokens }
  cost: decimal('cost', { precision: 10, scale: 6 }),
  errors: text('errors'),
  assertions: json('assertions'), // Array of assertion results
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    runIdx: index('evaluation_results_run_id_idx').on(table.runId),
    providerIdx: index('evaluation_results_provider_id_idx').on(table.providerId),
    fkRun: foreignKey({ columns: [table.runId], foreignColumns: [evaluationRuns.id] }),
    fkProvider: foreignKey({ columns: [table.providerId], foreignColumns: [providers.id] }),
    fkPrompt: foreignKey({ columns: [table.promptVersionId], foreignColumns: [promptVersions.id] }),
  };
});

// ===========================
// METRICS & AGGREGATIONS
// ===========================

export const metricsAggregations = mysqlTable('metrics_aggregations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  runId: varchar('run_id', { length: 36 }).notNull(),
  providerId: varchar('provider_id', { length: 36 }).notNull(),
  promptVersionId: varchar('prompt_version_id', { length: 36 }).notNull(),
  
  // Quality metrics
  accuracy: decimal('accuracy', { precision: 5, scale: 4 }),
  precision: decimal('precision', { precision: 5, scale: 4 }),
  recall: decimal('recall', { precision: 5, scale: 4 }),
  f1Score: decimal('f1_score', { precision: 5, scale: 4 }),
  
  // Performance metrics
  avgLatencyMs: decimal('avg_latency_ms', { precision: 10, scale: 2 }),
  minLatencyMs: int('min_latency_ms'),
  maxLatencyMs: int('max_latency_ms'),
  
  // Cost metrics
  totalCost: decimal('total_cost', { precision: 12, scale: 6 }),
  avgCostPerTest: decimal('avg_cost_per_test', { precision: 10, scale: 6 }),
  
  // Token metrics
  totalPromptTokens: int('total_prompt_tokens'),
  totalCompletionTokens: int('total_completion_tokens'),
  avgTokensPerTest: decimal('avg_tokens_per_test', { precision: 10, scale: 2 }),
  
  // Consistency
  consistencyScore: decimal('consistency_score', { precision: 5, scale: 4 }),
  
  // Test counts
  totalTests: int('total_tests'),
  passedTests: int('passed_tests'),
  failedTests: int('failed_tests'),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    runIdx: index('metrics_aggregations_run_id_idx').on(table.runId),
    providerIdx: index('metrics_aggregations_provider_id_idx').on(table.providerId),
    fkRun: foreignKey({ columns: [table.runId], foreignColumns: [evaluationRuns.id] }),
    fkProvider: foreignKey({ columns: [table.providerId], foreignColumns: [providers.id] }),
  };
});

// ===========================
// APPROVALS & WORKFLOW
// ===========================

export const approvals = mysqlTable('approvals', {
  id: varchar('id', { length: 36 }).primaryKey(),
  runId: varchar('run_id', { length: 36 }).notNull(),
  status: mysqlEnum('status', [
    'draft',
    'pending_review',
    'approved',
    'rejected',
  ]).default('draft'),
  approvedBy: varchar('approved_by', { length: 36 }), // User ID
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  deployedTo: mysqlEnum('deployed_to', [
    'development',
    'staging',
    'production',
  ]),
  deployedAt: timestamp('deployed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => {
  return {
    runIdx: index('approvals_run_id_idx').on(table.runId),
    fkRun: foreignKey({ columns: [table.runId], foreignColumns: [evaluationRuns.id] }),
    fkApprovedBy: foreignKey({ columns: [table.approvedBy], foreignColumns: [users.id] }),
  };
});

// ===========================
// AUDIT LOGS
// ===========================

export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }),
  action: varchar('action', { length: 100 }).notNull(), // e.g., "prompt_created", "eval_started"
  resourceType: varchar('resource_type', { length: 50 }).notNull(), // e.g., "prompt", "evaluation", "user"
  resourceId: varchar('resource_id', { length: 36 }),
  projectId: varchar('project_id', { length: 36 }),
  details: json('details'), // Changes, reason, etc
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdx: index('audit_logs_user_id_idx').on(table.userId),
    projectIdx: index('audit_logs_project_id_idx').on(table.projectId),
    resourceIdx: index('audit_logs_resource_type_resource_id_idx').on(table.resourceType, table.resourceId),
    fkUser: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
    fkProject: foreignKey({ columns: [table.projectId], foreignColumns: [projects.id] }),
  };
});

// ===========================
// RELATIONS (for Drizzle queries)
// ===========================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.orgId],
    references: [organizations.id],
  }),
  projects: many(projects),
  userRoles: many(userTeamRoles),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  prompts: many(prompts),
  providers: many(providers),
  datasets: many(testDatasets),
  evaluationRuns: many(evaluationRuns),
  auditLogs: many(auditLogs),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  project: one(projects, {
    fields: [prompts.projectId],
    references: [projects.id],
  }),
  versions: many(promptVersions),
}));

export const promptVersionsRelations = relations(promptVersions, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptVersions.promptId],
    references: [prompts.id],
  }),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  project: one(projects, {
    fields: [providers.projectId],
    references: [projects.id],
  }),
  results: many(evaluationResults),
}));

export const evaluationRunsRelations = relations(evaluationRuns, ({ one, many }) => ({
  project: one(projects, {
    fields: [evaluationRuns.projectId],
    references: [projects.id],
  }),
  results: many(evaluationResults),
  metrics: many(metricsAggregations),
  approval: one(approvals),
}));
