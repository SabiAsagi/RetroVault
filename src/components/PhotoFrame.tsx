import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Upload, Image as ImageIcon } from 'lucide-react';

type FrameType = 'crt' | 'handheld' | 'arcade' | 'magazine';

export default function PhotoFrame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [frameType, setFrameType] = useState<FrameType>('crt');
  const [title, setTitle] = useState('Chrono Trigger');
  const [platform, setPlatform] = useState('Super Famicom');
  const [status, setStatus] = useState('패키지 보유');
  const [comment, setComment] = useState('내 인생 최고의 RPG!');
  
  // Image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size for high-res output
    canvas.width = 1080;
    canvas.height = 1080;
    const { width, height } = canvas;

    const renderCanvas = async () => {
      // Clear
      ctx.clearRect(0, 0, width, height);

      // Helper for rounding rects
      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      // Draw background/frame
      if (frameType === 'crt') {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, width, height);
        
        // CRT Outer Shell
        ctx.fillStyle = '#2C2C2C';
        roundRect(50, 50, 980, 980, 40);
        ctx.fill();
        ctx.strokeStyle = '#3A3A3A';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Screen Bezel
        ctx.fillStyle = '#0a0a0a';
        roundRect(100, 100, 880, 750, 80);
        ctx.fill();

        // Screen Area
        const screenBox = { x: 120, y: 120, w: 840, h: 710 };
        ctx.save();
        roundRect(screenBox.x, screenBox.y, screenBox.w, screenBox.h, 40);
        ctx.clip();
        
        await drawUploadedImage(ctx, imageSrc, screenBox.x, screenBox.y, screenBox.w, screenBox.h);

        // Scanlines
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for(let i=0; i<screenBox.h; i+=6) {
          ctx.fillRect(screenBox.x, screenBox.y + i, screenBox.w, 2);
        }
        
        // Inner shadow/glow
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 50;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 40;
        roundRect(screenBox.x, screenBox.y, screenBox.w, screenBox.h, 40);
        ctx.stroke();
        ctx.restore();

        // SONY-like Logo
        ctx.fillStyle = '#DDDDDD';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RETRO', width/2, 900);
        
        // Text Overlays
        ctx.fillStyle = '#4AEDC4';
        ctx.font = '36px "Press Start 2P", monospace, sans-serif';
        ctx.textAlign = 'left';
        ctx.shadowColor = '#4AEDC4';
        ctx.shadowBlur = 10;
        ctx.fillText(title, 150, 200);
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.fillText(`${platform} | ${status}`, 150, 240);
        
        ctx.fillStyle = '#FFB547';
        ctx.font = 'italic 28px sans-serif';
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.fillText(`"${comment}"`, width/2, 980);

      } else if (frameType === 'handheld') {
        // Gameboy style
        ctx.fillStyle = '#C4CFA1'; // Classic DMG color
        ctx.fillRect(0, 0, width, height);

        // Screen bezel
        ctx.fillStyle = '#5C6370';
        roundRect(100, 100, 880, 700, 20);
        ctx.fill();

        // Red Battery LED
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(140, 300, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BATTERY', 140, 330);

        // Dot matrix screen line
        ctx.strokeStyle = '#424651';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 140);
        ctx.lineTo(980, 140);
        ctx.stroke();
        ctx.fillStyle = '#424651';
        ctx.font = 'italic bold 20px sans-serif';
        ctx.fillText('DOT MATRIX WITH STEREO SOUND', 540, 130);

        // Screen Area
        const screenBox = { x: 220, y: 180, w: 640, h: 560 };
        ctx.save();
        roundRect(screenBox.x, screenBox.y, screenBox.w, screenBox.h, 5);
        ctx.clip();
        
        // Draw green-ish background
        ctx.fillStyle = '#8BAC0F';
        ctx.fillRect(screenBox.x, screenBox.y, screenBox.w, screenBox.h);
        
        await drawUploadedImage(ctx, imageSrc, screenBox.x, screenBox.y, screenBox.w, screenBox.h);

        // Green overlay to tint image
        ctx.fillStyle = 'rgba(139, 172, 15, 0.4)';
        ctx.fillRect(screenBox.x, screenBox.y, screenBox.w, screenBox.h);
        
        // Pixel grid
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for(let i=0; i<screenBox.h; i+=4) {
          ctx.fillRect(screenBox.x, screenBox.y + i, screenBox.w, 1);
        }
        for(let i=0; i<screenBox.w; i+=4) {
          ctx.fillRect(screenBox.x + i, screenBox.y, 1, screenBox.h);
        }
        ctx.restore();

        // Text
        ctx.fillStyle = '#0F380F';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, width/2, 860);
        ctx.font = '24px sans-serif';
        ctx.fillText(`[ ${platform} / ${status} ]`, width/2, 910);
        
        // D-Pad and Buttons hint
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(200, 880, 120, 40);
        ctx.fillRect(240, 840, 40, 120);
        ctx.beginPath();
        ctx.arc(800, 920, 30, 0, Math.PI*2);
        ctx.arc(880, 880, 30, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#8A053C';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`"${comment}"`, width/2, 1000);

      } else if (frameType === 'arcade') {
        // Arcade cabinet
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);
        
        // Marquee
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#FF0055');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#00FFFF');
        ctx.fillStyle = gradient;
        ctx.fillRect(50, 50, 980, 180);
        
        ctx.fillStyle = '#fff';
        ctx.font = '900 64px "Press Start 2P", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;
        ctx.fillText(title.substring(0, 15), width/2, 165); // Truncate to fit marquee
        ctx.shadowBlur = 0;

        // Screen bezel
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(50, 250);
        ctx.lineTo(980, 250);
        ctx.lineTo(880, 950);
        ctx.lineTo(150, 950);
        ctx.fill();

        // Screen Area
        const screenBox = { x: 200, y: 300, w: 680, h: 580 };
        ctx.save();
        ctx.rect(screenBox.x, screenBox.y, screenBox.w, screenBox.h);
        ctx.clip();
        await drawUploadedImage(ctx, imageSrc, screenBox.x, screenBox.y, screenBox.w, screenBox.h);
        ctx.restore();

        // Control Deck
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 980, width, 100);
        ctx.fillStyle = '#FF0055';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`P1: ${status} | COIN: ${platform}`, width/2, 1040);
        
        // Comment
        ctx.fillStyle = '#FFF';
        ctx.font = '24px "Press Start 2P", sans-serif';
        ctx.fillText(comment, width/2, 930);

      } else {
        // Magazine Cover
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Header Red box
        ctx.fillStyle = '#E60012';
        ctx.fillRect(0, 0, width, 140);
        ctx.fillStyle = '#fff';
        ctx.font = '900 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RETRO GAMER', width/2, 100);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('THE ESSENTIAL GUIDE TO CLASSIC GAMES', width/2, 130);

        // Screen Area (Main Image)
        const screenBox = { x: 50, y: 160, w: 980, h: 650 };
        ctx.save();
        ctx.rect(screenBox.x, screenBox.y, screenBox.w, screenBox.h);
        ctx.clip();
        await drawUploadedImage(ctx, imageSrc, screenBox.x, screenBox.y, screenBox.w, screenBox.h);
        ctx.restore();

        // Image Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 10;
        ctx.strokeRect(screenBox.x, screenBox.y, screenBox.w, screenBox.h);

        // Headlines
        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        
        ctx.font = '900 64px sans-serif';
        ctx.fillText(title, 50, 890);
        
        ctx.fillStyle = '#E60012';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`${platform} REVIEW!`, 50, 940);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`STATUS: ${status}`, 50, 980);

        ctx.fillStyle = '#111';
        ctx.fillRect(50, 1010, 980, 50);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`" ${comment} "`, width/2, 1045);

        // Barcode
        ctx.fillStyle = '#000';
        for(let i=0; i<30; i++) {
          ctx.fillRect(850 + i*4 + Math.random()*2, 850, Math.random() > 0.5 ? 2 : 4, 80);
        }
      }
    };

    renderCanvas();
  }, [imageSrc, frameType, title, platform, status, comment]);

  const drawUploadedImage = (ctx: CanvasRenderingContext2D, src: string | null, x: number, y: number, w: number, h: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!src) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#666';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Image Uploaded', x + w/2, y + h/2);
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Calculate cover crop
        const imgRatio = img.width / img.height;
        const boxRatio = w / h;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgRatio > boxRatio) {
          sWidth = img.height * boxRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / boxRatio;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
        resolve();
      };
      img.src = src;
    });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `retrovault-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Camera className="text-mint" />
          인증 프레임 공유
        </h2>
        <p className="text-text-secondary mt-1">소장 중인 게임 사진을 멋진 레트로 프레임에 담아 공유해보세요.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Preview Area */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="w-full max-w-md aspect-square bg-vault-surface border border-vault-border rounded-xl overflow-hidden shadow-2xl relative group">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain bg-black"
            />
          </div>
          <button 
            onClick={handleDownload}
            className="mt-6 w-full max-w-md bg-mint hover:bg-mint-dim text-vault-bg font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={20} />
            이미지 다운로드
          </button>
        </div>

        {/* Controls Area */}
        <div className="w-full lg:w-1/2 bg-vault-surface border border-vault-border rounded-xl p-6 space-y-6">
          
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">사진 업로드</label>
            <label className="flex items-center justify-center w-full h-32 px-4 transition border-2 border-vault-border-light border-dashed rounded-lg appearance-none cursor-pointer hover:border-mint focus:outline-none bg-vault-surface-light">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-text-muted" />
                <span className="font-medium text-text-secondary text-sm">
                  {imageSrc ? '다른 이미지 선택' : '클릭하여 이미지 파일 업로드'}
                </span>
              </div>
              <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Frame Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">프레임 선택</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['crt', 'handheld', 'arcade', 'magazine'] as FrameType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFrameType(type)}
                  className={`py-3 px-2 rounded-lg border text-sm font-medium transition-all capitalize ${
                    frameType === type
                      ? 'bg-mint/10 border-mint text-mint shadow-[0_0_10px_rgba(74,237,196,0.2)]'
                      : 'bg-vault-bg border-vault-border text-text-secondary hover:border-vault-border-light'
                  }`}
                >
                  {type === 'crt' ? 'CRT TV' : type === 'handheld' ? '휴대용' : type === 'arcade' ? '아케이드' : '잡지 표지'}
                </button>
              ))}
            </div>
          </div>

          {/* Text Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">게임명</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full bg-vault-bg border border-vault-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-mint transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">플랫폼</label>
                <input 
                  type="text" 
                  value={platform} 
                  onChange={e => setPlatform(e.target.value)} 
                  className="w-full bg-vault-bg border border-vault-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-mint transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">소장 상태</label>
                <input 
                  type="text" 
                  value={status} 
                  onChange={e => setStatus(e.target.value)} 
                  className="w-full bg-vault-bg border border-vault-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-mint transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">한 줄 코멘트</label>
              <input 
                type="text" 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="w-full bg-vault-bg border border-vault-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-mint transition-colors"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
