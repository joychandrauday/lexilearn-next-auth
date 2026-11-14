import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'lexilearn-secret-key-at-least-32-chars-long-2026'
);

export interface TokenPayload {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export async function signMobileToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyMobileToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getMobileAuthUser(req: Request): Promise<TokenPayload | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return null;
  return await verifyMobileToken(token);
}
