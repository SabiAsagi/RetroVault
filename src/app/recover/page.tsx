"use client";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual password recovery API call
    setIsSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-vault-bg px-4">
      <div className="glass-panel border border-vault-border rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/5 to-transparent pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint to-neon-blue mx-auto flex items-center justify-center crt-lines shadow-lg neon-mint mb-4">
            <span className="font-pixel text-[12px] text-vault-bg font-bold">RV</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">비밀번호 찾기</h2>
          <p className="text-sm text-text-muted">가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-6 relative z-10">
            <div className="p-4 bg-mint/10 border border-mint/30 rounded-lg text-mint text-sm">
              <p>비밀번호 재설정 링크가 전송되었습니다.</p>
              <p className="font-bold mt-1">{email}</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 bg-vault-surface border border-vault-border hover:bg-vault-surface-light text-text-primary font-bold rounded-lg transition-all"
            >
              로그인 화면으로 돌아가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleRecover} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
                placeholder="가입 시 사용한 이메일"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(74,237,196,0.3)] hover:shadow-[0_0_25px_rgba(74,237,196,0.5)] flex items-center justify-center gap-2"
            >
              <Mail size={18} />
              재설정 링크 전송
            </button>
          </form>
        )}

        <div className="mt-8 text-center relative z-10">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-mint transition-colors">
            <ArrowLeft size={16} /> 로그인 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
