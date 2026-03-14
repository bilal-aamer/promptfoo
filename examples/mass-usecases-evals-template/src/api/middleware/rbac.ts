import type { Request, Response, NextFunction } from 'express';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based permissions
 */

type UserRole = 'admin' | 'evaluator' | 'viewer';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        actual: userRole,
      });
    }

    next();
  };
}

/**
 * Usage examples:
 * - POST create evaluation: requireRole('admin', 'evaluator')
 * - GET view results: requireRole('admin', 'evaluator', 'viewer')
 * - DELETE evaluation: requireRole('admin')
 * - PATCH approve: requireRole('admin')
 */

export const permissions = {
  // Who can view evaluations
  view: (role: UserRole) =>
    ['admin', 'evaluator', 'viewer'].includes(role),

  // Who can create evaluations
  create: (role: UserRole) =>
    ['admin', 'evaluator'].includes(role),

  // Who can edit/delete evaluations
  modify: (role: UserRole) =>
    ['admin', 'evaluator'].includes(role),

  // Who can approve for production
  approve: (role: UserRole) =>
    ['admin'].includes(role),

  // Who can manage users
  manageUsers: (role: UserRole) =>
    ['admin'].includes(role),
};
