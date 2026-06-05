import { useState } from 'react';
import { X, Mail, Github, Key, Gamepad2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleDemoLogin = (provider: string) => {
    login(provider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div 
        className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-vault-border bg-vault-surface-light">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-mint" size={20} />
            <h2 className="text-lg font-black text-text-primary">RetroVault</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex gap-4 mb-8">
            <button 
              className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${mode === 'login' ? 'border-mint text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
              onClick={() => setMode('login')}
            >
              로그인
            </button>
            <button 
              className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${mode === 'signup' ? 'border-mint text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
              onClick={() => setMode('signup')}
            >
              회원가입
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">닉네임</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" placeholder="예: 레트로 마스터" className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-mint focus:outline-none transition-colors" />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">이메일</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" placeholder="retro@vaultgame.io" className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-mint focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">비밀번호</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="password" placeholder="••••••••" className="w-full bg-vault-bg border border-vault-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-mint focus:outline-none transition-colors" />
              </div>
            </div>

            <button 
              onClick={() => handleDemoLogin('email')}
              className="w-full bg-mint text-vault-surface font-black text-sm py-3 rounded-lg hover:bg-mint-dim transition-all shadow-[0_0_15px_rgba(74,237,196,0.2)] hover:shadow-[0_0_20px_rgba(74,237,196,0.4)] mt-2"
            >
              {mode === 'login' ? '로그인' : '회원가입 시작하기'}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-vault-border"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-text-muted">또는 소셜 계정으로</span>
              <div className="flex-grow border-t border-vault-border"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleDemoLogin('google')}
                className="flex items-center justify-center gap-2 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                Google
              </button>
              <button 
                onClick={() => handleDemoLogin('github')}
                className="flex items-center justify-center gap-2 py-2.5 bg-[#24292e] text-text-primary rounded-lg text-sm font-bold hover:bg-[#2c3238] transition-colors border border-vault-border"
              >
                <Github size={16} />
                GitHub
              </button>
            </div>
            
            <p className="text-[10px] text-center text-text-muted mt-4">
              * MVP 버전에서는 실제 인증 없이 데모 계정으로 바로 로그인됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
