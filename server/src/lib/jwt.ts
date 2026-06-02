import jwt from 'jsonwebtoken';

const INSECURE_DEFAULT = 'dev-secret-change-me';
const isProduction = process.env.NODE_ENV === 'production';

// Resolve the signing secret with fail-fast safety:
// - In production, refuse to start without a strong, non-default secret.
// - In development, fall back to a clearly-marked dev secret (with a warning).
function resolveSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (isProduction) {
    if (!secret || secret === INSECURE_DEFAULT || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be set to a strong value (>= 32 chars) in production. Refusing to start with a weak or default secret.',
      );
    }
    return secret;
  }

  if (!secret) {
    console.warn('[security] JWT_SECRET not set — using an insecure development default. Do NOT use in production.');
    return INSECURE_DEFAULT;
  }
  return secret;
}

const JWT_SECRET = resolveSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: number;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
