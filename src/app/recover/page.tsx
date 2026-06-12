"use client";
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-vault-bg px-4 py-8">
      <div className="glass-panel border border-vault-border rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple mx-auto flex items-center justify-center crt-lines shadow-lg mb-4">
            <Mail size={24} className="text-vault-bg" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">비밀번호 찾기</h2>
          <p className="text-sm text-text-muted">가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.</p>
        </div>

        {submitted ? (
          <div className="text-center relative z-10">
            <div className="bg-mint/10 border border-mint/30 rounded-lg p-6 mb-6">
              <p className="text-text-primary font-bold mb-2">이메일이 발송되었습니다!</p>
              <p className="text-sm text-text-secondary">{email} 계정으로 전송된 링크를 확인해주세요.</p>
            </div>
            <Link href="/login" className="text-mint hover:text-mint-dim font-bold flex items-center justify-center gap-2">
              로그인 화면으로 돌아가기 <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
                placeholder="가입한 이메일 입력"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neon-blue hover:bg-neon-blue/80 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(28,126,214,0.3)] hover:shadow-[0_0_25px_rgba(28,126,214,0.5)] flex items-center justify-center gap-2 mt-6"
            >
              재설정 링크 받기
            </button>
            
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-text-muted hover:text-text-primary">
                돌아가기
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
