import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { POLICY_VERSION } from './legal';

export const CONSENT_COOKIE = 'rv-registration-consent';
export const CONSENT_TTL_SECONDS = 600;
export const registrationConsentSchema = z.object({
  ageConfirmed: z.literal(true), termsAccepted: z.literal(true),
  privacyAccepted: z.literal(true), policyVersion: z.literal(POLICY_VERSION),
});

export function createConsentToken(secret: string, now = Date.now()) {
  if (!secret) throw new Error('Missing auth secret');
  const payload = Buffer.from(JSON.stringify({ version: POLICY_VERSION, issuedAt: now })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyConsentToken(token: string | undefined, secret: string | undefined, now = Date.now()) {
  if (!token || !secret) return false;
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra !== undefined) return false;
    const expected = createHmac('sha256', secret).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.version === POLICY_VERSION && Number.isFinite(decoded.issuedAt) &&
      decoded.issuedAt <= now && now - decoded.issuedAt < CONSENT_TTL_SECONDS * 1000;
  } catch { return false; }
}
