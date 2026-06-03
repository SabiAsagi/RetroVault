"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("아이디 또는 비밀번호를 확인해주세요.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-vault-bg px-4">
      <div className="glass-panel border border-vault-border rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/5 to-transparent pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint to-neon-blue mx-auto flex items-center justify-center crt-lines shadow-lg neon-mint mb-4">
            <span className="font-pixel text-[12px] text-vault-bg font-bold">RV</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">RetroVault 로그인</h2>
          <p className="text-sm text-text-muted">나만의 레트로 게임 아카이브에 오신 것을 환영합니다.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-coral/10 border border-coral/30 text-coral text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-white focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
              placeholder="admin@retrovault.kr"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-white focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
              placeholder="비밀번호 입력"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(74,237,196,0.3)] hover:shadow-[0_0_25px_rgba(74,237,196,0.5)] flex items-center justify-center gap-2 mt-6"
          >
            <LogIn size={18} />
            이메일로 로그인
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4 text-xs text-text-muted relative z-10">
          <div className="flex-1 h-px bg-vault-border" />
          <span>데모 계정: demo@retrovault.kr / demo1234</span>
          <div className="flex-1 h-px bg-vault-border" />
        </div>
      </div>
    </div>
  );
}
