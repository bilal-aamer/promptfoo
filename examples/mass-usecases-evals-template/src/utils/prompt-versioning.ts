/**
 * Prompt Versioning & Audit Trail
 * Track prompt changes with full history and metadata
 */

export interface PromptVersion {
  id: string;
  content: string;
  timestamp: Date;
  semanticTag: string; // e.g., "v1.0.0"
  version: string;
  notes: string;
  createdBy: string;
  isProduction: boolean;
}

export interface VersionMetadata {
  datasetUsed: string;
  modelsEvaluated: string[];
  metricsSnapshot: {
    accuracy: number;
    f1: number;
    cost: number;
  };
  approvedBy?: string;
  approvedAt?: Date;
}

/**
 * Generate semantic version tag
 */
export function generateSemanticTag(major: number, minor: number, patch: number): string {
  return `v${major}.${minor}.${patch}`;
}

/**
 * Track version iteration with metadata
 */
export function createVersionRecord(
  content: string,
  metadata: {
    notes: string;
    datasetId: string;
    modelIds: string[];
    metrics: any;
    createdBy: string;
  }
) {
  const now = new Date();

  return {
    id: `version-${now.getTime()}`,
    content,
    timestamp: now,
    version: now.toISOString(), // ISO timestamp
    semanticTag: generateSemanticTag(1, 0, 0), // Could be smarter
    notes: metadata.notes,
    createdBy: metadata.createdBy,
    isProduction: false,
    metadata: {
      datasetUsed: metadata.datasetId,
      modelsEvaluated: metadata.modelIds,
      metricsSnapshot: metadata.metrics,
    },
  };
}

/**
 * Generate audit trail for version history
 */
export function generateAuditTrail(versions: PromptVersion[]) {
  return versions
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .map((v, index) => ({
      index: index + 1,
      date: v.timestamp.toISOString().split('T')[0],
      tag: v.semanticTag,
      notes: v.notes,
      createdBy: v.createdBy,
      status: v.isProduction ? '🔴 PRODUCTION' : '⚪ DRAFT',
    }));
}

/**
 * Quick rollback: which version to revert to?
 */
export function suggestRollback(
  versions: PromptVersion[],
  reason: 'performance_regression' | 'user_complaint' | 'other'
): PromptVersion | null {
  // Sort by production status first, then by date
  const productionVersions = versions
    .filter((v) => v.isProduction)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (reason === 'performance_regression') {
    // Go back to previous production version
    return productionVersions[1] || null;
  }

  return productionVersions[0] || null;
}
