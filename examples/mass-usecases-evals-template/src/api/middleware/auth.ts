import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Extracts and validates JWT tokens from Authorization header
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization scheme' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as {
      id: string;
      email: string;
      role: string;
    };

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * API Key Authentication Middleware
 * For service-to-service communication
 */
export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  // In production, validate against database
  // For now, accept any non-empty key
  req.user = {
    id: 'api-client',
    email: 'api@internal.local',
    role: 'evaluator',
  };

  next();
}

/**
 * Combo: JWT or API Key
 */
export function authComboMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (authHeader) {
    return authMiddleware(req, res, next);
  }

  if (apiKey) {
    return apiKeyMiddleware(req, res, next);
  }

  return res.status(401).json({ error: 'No auth credentials provided' });
}
