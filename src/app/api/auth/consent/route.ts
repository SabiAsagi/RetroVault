import { NextResponse } from 'next/server';
import { CONSENT_COOKIE, CONSENT_TTL_SECONDS, createConsentToken, registrationConsentSchema } from '@/lib/registration-consent';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: '잘못된 요청입니다.' }, { status: 403 });
  }
  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ message: '잘못된 요청입니다.' }, { status: 400 });
  }
  if (!registrationConsentSchema.safeParse(input).success) {
    return NextResponse.json({ message: '만 14세 이상 확인과 필수 동의가 필요합니다.' }, { status: 400 });
  }
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return NextResponse.json({ message: '가입 설정을 확인 중입니다.' }, { status: 503 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONSENT_COOKIE, createConsentToken(secret), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/', maxAge: CONSENT_TTL_SECONDS,
  });
  return response;
}
