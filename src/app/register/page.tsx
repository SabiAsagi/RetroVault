"use client";
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import RegistrationConsent from '@/components/RegistrationConsent';
import SocialSignIn from '@/components/SocialSignIn';
import { EMPTY_REGISTRATION_CONSENT, hasRegistrationConsent, POLICY_VERSION } from '@/lib/legal';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(EMPTY_REGISTRATION_CONSENT);
  const [requiresConsent, setRequiresConsent] = useState(false);
  useEffect(() => {
    setRequiresConsent(new URLSearchParams(window.location.search).get('notice') === 'consent-required');
  }, []);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!hasRegistrationConsent(consent)) {
      setError('만 14세 이상 확인과 필수 동의를 완료해주세요.');
      return;
    }

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
        body: JSON.stringify({ email, password, nickname, ...consent, policyVersion: POLICY_VERSION }),
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">겜자취 회원가입</h2>
          <p className="text-sm text-text-muted">나만의 레트로 게임 아카이브를 시작하세요.</p>
        </div>

        {requiresConsent && <p role="status" className="relative z-10 mb-5 rounded-lg border border-vault-border p-4 text-sm leading-7 text-text-secondary">처음 사용하는 소셜 계정입니다. 아래 가입 전 확인을 완료한 뒤 소셜 로그인 제공자를 다시 선택해주세요.</p>}
        {error && (
          <div role="alert" className="mb-4 p-3 rounded bg-coral/10 border border-coral/30 text-coral text-sm text-center relative z-10">
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
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
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
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
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
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
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
              className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint/30 transition-all"
              placeholder="비밀번호 다시 입력"
            />
          </div>

          <RegistrationConsent value={consent} onChange={setConsent} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(74,237,196,0.3)] hover:shadow-[0_0_25px_rgba(74,237,196,0.5)] flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <UserPlus size={18} />
            {loading ? "가입 처리 중..." : "회원가입하기"}
          </button>
        </form>
        
        <div className="mt-6 flex items-center gap-4 text-xs text-text-muted relative z-10">
          <div className="flex-1 h-px bg-vault-border" />
          <span>소셜 계정으로 시작</span>
          <div className="flex-1 h-px bg-vault-border" />
        </div>

        <SocialSignIn consent={consent} />

        <div className="mt-6 text-center text-sm relative z-10">
          <span className="text-text-muted">이미 계정이 있으신가요? </span>
          <Link href="/login" className="text-neon-blue hover:underline font-bold">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
