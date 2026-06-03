import { useState, useEffect } from 'react';
import { X, ScanLine, CheckCircle2 } from 'lucide-react';
import { Game } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (game: Game) => void;
  mockGameData: Game; // 스캔 성공 시뮬레이션을 위한 더미 게임 데이터
}

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess, mockGameData }: BarcodeScannerModalProps) {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setSuccess(false);

      // 시뮬레이션: 3초 후 바코드 인식 성공
      const timer = setTimeout(() => {
        setScanning(false);
        setSuccess(true);
        setTimeout(() => {
          onScanSuccess(mockGameData);
          onClose();
        }, 1500); // 1.5초 후 콜백 및 닫기
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, mockGameData, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
      <div className="absolute top-6 right-6 z-10">
        <button onClick={onClose} className="p-2 bg-vault-surface rounded-full text-white hover:bg-vault-surface-light transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center max-w-sm w-full">
        <h2 className="text-white font-bold text-lg mb-6">패키지 바코드 스캔</h2>
        
        <div className="relative w-full aspect-square bg-gray-900 rounded-3xl overflow-hidden border-2 border-vault-border shadow-2xl flex items-center justify-center">
          {/* 가상의 카메라 피드 배경 */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600')] bg-cover bg-center"></div>
          
          {/* 스캐너 가이드 프레임 */}
          <div className="absolute inset-8 border-2 border-dashed border-white/30 rounded-xl"></div>
          
          {scanning && (
            <>
              {/* 스캔 애니메이션 레이저 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-mint shadow-[0_0_15px_#4AEDC4] animate-scan-laser"></div>
              <ScanLine size={48} className="text-white/50 animate-pulse" />
            </>
          )}

          {success && (
            <div className="absolute inset-0 bg-mint/20 backdrop-blur-sm flex flex-col items-center justify-center animate-in zoom-in">
              <CheckCircle2 size={64} className="text-mint mb-4 drop-shadow-[0_0_10px_rgba(74,237,196,0.5)]" />
              <p className="text-white font-bold text-lg">인식 성공!</p>
              <p className="text-mint font-medium text-sm mt-1">{mockGameData.title}</p>
            </div>
          )}
        </div>

        <p className="text-text-muted text-sm mt-8 text-center px-4">
          {scanning ? '게임 패키지 뒷면의 바코드를 사각형 안에 맞춰주세요.' : '자동으로 컬렉션에 추가됩니다...'}
        </p>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-laser {
          0% { top: 8%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 92%; opacity: 0; }
        }
        .animate-scan-laser {
          animation: scan-laser 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}
