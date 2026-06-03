import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginRequired() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint to-neon-blue mx-auto flex items-center justify-center crt-lines shadow-lg neon-mint mb-6">
        <span className="font-pixel text-[12px] text-vault-bg font-bold">RV</span>
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-3">로그인이 필요합니다</h2>
      <p className="text-sm text-text-secondary mb-8 max-w-md">
        컬렉션 관리와 분석 기능은 로그인 후 이용할 수 있습니다. 나만의 레트로 게임 아카이브를 시작해보세요.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mx-auto">
        <Link 
          href="/login" 
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(74,237,196,0.3)] hover:shadow-[0_0_25px_rgba(74,237,196,0.5)]"
        >
          <LogIn size={18} />
          로그인
        </Link>
        <Link 
          href="/register" 
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-vault-surface-light border border-vault-border hover:border-mint text-text-primary font-bold rounded-lg transition-all"
        >
          <UserPlus size={18} />
          회원가입
        </Link>
      </div>
      
      <Link href="/" className="mt-8 text-xs text-text-muted hover:text-text-primary transition-colors">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
