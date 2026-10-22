'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { hasRegistrationConsent, POLICY_VERSION, type RegistrationConsent } from '@/lib/legal';

export default function SocialSignIn({ consent }: { consent?: RegistrationConsent }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const start = async (provider: string) => {
    setError('');
    if (consent && !hasRegistrationConsent(consent)) { setError('가입 전 만 14세 이상 확인과 필수 동의를 완료해주세요.'); return; }
    setBusy(true);
    try {
      if (consent) {
        const response = await fetch('/api/auth/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...consent, policyVersion: POLICY_VERSION }) });
        if (!response.ok) throw new Error('가입 확인을 저장하지 못했습니다. 다시 시도해주세요.');
      }
      await signIn(provider, { callbackUrl: '/' });
    } catch { setError('소셜 로그인을 시작하지 못했습니다. 설정을 확인하거나 다시 시도해주세요.'); }
    finally { setBusy(false); }
  };
  return <div className="relative z-10 mt-4"><div className="flex gap-3">{[['google','구글'],['kakao','카카오'],['naver','네이버']].map(([provider,label]) => <button key={provider} type="button" disabled={busy} onClick={() => start(provider)} className="min-h-11 flex-1 rounded-lg border border-vault-border bg-vault-surface px-3 py-3 text-sm font-bold text-text-primary transition-colors hover:border-mint disabled:opacity-50">{label}</button>)}</div>{error && <p role="alert" className="mt-3 text-sm leading-6 text-coral">{error}</p>}</div>;
}
