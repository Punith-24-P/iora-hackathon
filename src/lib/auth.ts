import crypto from 'crypto';

// Salted hash for secure password storage
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Simple signed session token
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'aiora-hackathon-2026-secure-session-key-random-981273918237';

export function createSessionToken(username: string, role: string): string {
  const payload = {
    username,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): { username: string; role: string } | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) return null;

    return { username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}
