"use client";

import { useState } from "react";
import { ShieldAlert, Calendar, CheckCircle2, ArrowLeft, Lock } from "lucide-react";
import { calculateAge, setAgeVerified } from "@/lib/ageVerification";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AgeVerificationModal({ isOpen, onClose, onSuccess }: AgeVerificationModalProps) {
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState<number>(2000);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const age = calculateAge(selectedYear, selectedMonth, selectedDay);

    if (age >= 19) {
      setAgeVerified(true);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      setErrorMsg(`만 ${age}세는 만 19세 미만이므로 이용할 수 없습니다.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-vault-surface border border-vault-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-coral via-amber to-coral" />

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-full bg-coral/10 border border-coral/30 flex items-center justify-center text-coral shadow-[0_0_20px_rgba(255,107,107,0.3)]">
            <Lock size={32} />
          </div>

          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 bg-coral/20 border border-coral/40 text-coral font-black text-xs rounded-full">
              19세 이상 이용가
            </span>
            <h2 className="text-2xl font-black text-text-primary">연령 확인</h2>
          </div>

          <p className="text-xs text-text-muted leading-relaxed max-w-xs">
            이 게임은 청소년에게 부적절한 내용을 포함하고 있습니다. 본인 확인을 위해 생년월일을 선택해주세요.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <Calendar size={14} className="text-mint" /> 생년월일 선택
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Year Select */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-xs text-text-primary font-bold focus:border-mint focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>

              {/* Month Select */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-xs text-text-primary font-bold focus:border-mint focus:outline-none cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>

              {/* Day Select */}
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-xs text-text-primary font-bold focus:border-mint focus:outline-none cursor-pointer"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}일
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-coral/10 border border-coral/30 rounded-xl flex items-start gap-2.5 text-xs font-bold text-coral animate-shake">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-vault-bg border border-vault-border hover:bg-vault-surface-light text-text-muted font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} /> 돌아가기
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-coral hover:bg-coral/90 text-white font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(255,107,107,0.4)] flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} /> 인증 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
