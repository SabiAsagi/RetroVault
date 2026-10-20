import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/lib/legal';

export default function RecoverPage() {
  return <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-5 py-12">
    <h1 className="mb-4 text-3xl font-bold text-text-primary">계정 복구 문의</h1>
    <p className="mb-4 text-base leading-8 text-text-secondary">자동 비밀번호 재설정 메일 기능은 아직 제공하지 않습니다. 가입한 이메일로 아래 운영팀 주소에 복구를 요청해 주세요. 소셜 계정은 해당 제공자의 계정 복구를 이용해 주세요.</p>
    <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('[겜자취] 계정 복구 요청')}`} className="my-3 min-h-11 break-all rounded-xl bg-mint px-5 py-4 text-center font-bold text-vault-bg">{SUPPORT_EMAIL}</a>
    <p className="mt-3 text-sm leading-7 text-text-muted">가입 이메일과 계정 닉네임을 적어주세요. 비밀번호와 인증 코드는 보내지 마세요. 운영팀이 본인 확인과 후속 절차를 안내합니다.</p>
    <Link href="/login" className="mt-6 min-h-11 py-3 text-center text-mint hover:underline">로그인으로 돌아가기</Link>
  </section>;
}