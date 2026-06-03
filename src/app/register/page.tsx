"use client";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    if (password.length < 6) {
      setError("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "회원가입 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }

      // Auto login after successful registration
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!loginRes?.error) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("서버와의 통신에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-vault-bg px-4 py-8">
      <div className="glass-panel border border-vault-border rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/5 to-transparent pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint to-neon-blue mx-auto flex items-center justify-center crt-lines shadow-lg neon-mint mb-4">
            <span className="font-pixel text-[12px] text-vault-bg font-bold">RV</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">RetroVault 회원가입</h2>
          <p className="text-sm text-text-muted">나만의 레트로 게임 아카이브를 시작하세요.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-coral/10 border border-coral/30 text-coral text-sm text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-white focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">닉네임</label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-white focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
              placeholder="레트로매니아"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">비밀번호 (6자리 이상)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-white focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
              placeholder="비밀번호 입력"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">비밀번호 확인</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-white focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
              placeholder="비밀번호 다시 입력"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(74,237,196,0.3)] hover:shadow-[0_0_25px_rgba(74,237,196,0.5)] flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <UserPlus size={18} />
            {loading ? "가입 처리 중..." : "회원가입하기"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm relative z-10">
          <span className="text-text-muted">이미 계정이 있으신가요? </span>
          <Link href="/login" className="text-mint hover:underline font-medium">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
