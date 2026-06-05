"use client";
import { useState } from 'react';
import { User, Shield, Github, Mail, Camera, Save, Key, Globe, EyeOff, Palette, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from 'next-themes';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isPublic, setIsPublic] = useState(true);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-muted">
        <Shield size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-text-primary mb-2">로그인이 필요합니다</h2>
        <p className="text-sm">설정에 접근하려면 먼저 로그인해 주세요.</p>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfile({ nickname, avatar });
    // Show some toast or indication of save
    alert('프로필이 저장되었습니다.');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)] space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-text-primary flex items-center gap-3 mb-2">
          <SettingsIcon className="text-mint" size={28} />
          계정 설정
        </h2>
        <p className="text-sm text-text-secondary">프로필, 공개 범위 및 시스템 환경을 설정합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Settings Nav */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-vault-surface-light border border-vault-border text-text-primary text-sm font-bold rounded-xl transition-colors">
            <User size={18} className="text-neon-blue" />
            프로필 설정
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-text-primary hover:bg-vault-surface border border-transparent hover:border-vault-border text-sm font-medium rounded-xl transition-colors">
            <Shield size={18} className="text-text-muted" />
            보안 및 공개
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-text-primary hover:bg-vault-surface border border-transparent hover:border-vault-border text-sm font-medium rounded-xl transition-colors">
            <Palette size={18} className="text-text-muted" />
            디스플레이
          </button>
        </div>

        {/* Right Column: Settings Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <section className="bg-vault-surface border border-vault-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6 border-b border-vault-border pb-4">기본 프로필</h3>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl bg-vault-bg border-2 border-vault-border relative group overflow-hidden">
                  <img src={avatar || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroMaster&backgroundColor=1A1A1A'} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-text-primary" size={24} />
                  </div>
                </div>
                <button className="text-[10px] font-bold text-mint uppercase tracking-wider hover:underline">이미지 변경</button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">닉네임</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-mint focus:outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">이메일 주소</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full bg-vault-surface-light border border-vault-border/50 rounded-lg px-4 py-2.5 text-sm text-text-muted cursor-not-allowed" 
                  />
                  <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                    <Key size={10} /> 이메일 변경은 고객센터를 통해 문의해 주세요.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-vault-border">
              <button 
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-mint text-vault-bg font-bold text-sm rounded-lg hover:bg-mint-dim transition-colors"
              >
                <Save size={16} /> 변경사항 저장
              </button>
            </div>
          </section>

          {/* Connected Accounts */}
          <section className="bg-vault-surface border border-vault-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6 border-b border-vault-border pb-4">연결된 소셜 계정</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-vault-bg border border-vault-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Google</p>
                    <p className="text-xs text-text-muted">{user.connectedAccounts.includes('google') ? user.email : '연결되지 않음'}</p>
                  </div>
                </div>
                {user.connectedAccounts.includes('google') ? (
                  <button className="px-3 py-1.5 bg-vault-surface border border-vault-border text-xs text-text-secondary rounded-lg hover:text-coral hover:border-coral/50 transition-colors">연결 해제</button>
                ) : (
                  <button className="px-3 py-1.5 bg-mint/10 border border-mint/20 text-xs text-mint font-bold rounded-lg hover:bg-mint/20 transition-colors">계정 연결</button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-vault-bg border border-vault-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#24292e] flex items-center justify-center shrink-0">
                    <Github size={20} className="text-text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">GitHub</p>
                    <p className="text-xs text-text-muted">{user.connectedAccounts.includes('github') ? user.email : '연결되지 않음'}</p>
                  </div>
                </div>
                {user.connectedAccounts.includes('github') ? (
                  <button className="px-3 py-1.5 bg-vault-surface border border-vault-border text-xs text-text-secondary rounded-lg hover:text-coral hover:border-coral/50 transition-colors">연결 해제</button>
                ) : (
                  <button className="px-3 py-1.5 bg-mint/10 border border-mint/20 text-xs text-mint font-bold rounded-lg hover:bg-mint/20 transition-colors">계정 연결</button>
                )}
              </div>
            </div>
          </section>

          {/* Privacy & Display */}
          <section className="bg-vault-surface border border-vault-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6 border-b border-vault-border pb-4">공개 및 디스플레이</h3>
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isPublic ? <Globe size={16} className="text-mint" /> : <EyeOff size={16} className="text-amber" />}
                    <p className="text-sm font-bold text-text-primary">컬렉션 공개 여부</p>
                  </div>
                  <p className="text-xs text-text-muted">내 프로필과 컬렉션을 다른 사용자에게 공개합니다.</p>
                </div>
                <button 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-mint' : 'bg-vault-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isPublic ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="h-px bg-vault-border" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Palette size={16} className="text-neon-purple" />
                    <p className="text-sm font-bold text-text-primary">어두운 테마</p>
                  </div>
                  <p className="text-xs text-text-muted">앱 전체에 다크 모드/레트로 모드를 적용합니다.</p>
                </div>
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-neon-purple' : 'bg-vault-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
