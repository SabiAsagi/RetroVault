'use client';
import Link from 'next/link';
import type { RegistrationConsent as ConsentValue } from '@/lib/legal';

export default function RegistrationConsent({ value, onChange }: { value: ConsentValue; onChange: (value: ConsentValue) => void }) {
  const rowClass = 'flex min-h-11 items-start gap-3 py-2 text-sm leading-6 text-text-secondary';
  return <fieldset className="rounded-xl border border-vault-border p-4"><legend className="px-2 text-sm font-semibold text-text-primary">가입 전 확인</legend>
    <label className={rowClass}><input type="checkbox" checked={value.ageConfirmed} onChange={event => onChange({ ...value, ageConfirmed: event.target.checked })} className="mt-1 h-4 w-4 shrink-0"/><span>[필수] 만 14세 이상입니다.</span></label>
    <label className={rowClass}><input type="checkbox" checked={value.termsAccepted} onChange={event => onChange({ ...value, termsAccepted: event.target.checked })} className="mt-1 h-4 w-4 shrink-0"/><span>[필수] <Link href="/terms" target="_blank" className="text-mint underline">이용약관</Link>에 동의합니다.</span></label>
    <label className={rowClass}><input type="checkbox" checked={value.privacyAccepted} onChange={event => onChange({ ...value, privacyAccepted: event.target.checked })} className="mt-1 h-4 w-4 shrink-0"/><span>[필수] <Link href="/privacy" target="_blank" className="text-mint underline">개인정보 수집·이용 안내</Link>를 확인하고 동의합니다.</span></label>
    <p className="mt-2 text-xs leading-6 text-text-muted">목적: 계정 생성·인증·서비스 제공. 필수 항목: 이메일·닉네임·비밀번호 해시(이메일 가입), 계정 식별자 및 제공에 동의한 프로필 정보(소셜 가입). 보유: 회원 관계 및 기능 제공 기간. 동의를 거부할 수 있으나 회원가입은 제한됩니다.</p>
  </fieldset>;
}
