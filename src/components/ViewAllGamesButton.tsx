"use client";
import { useRouter } from 'next/navigation';

interface Props {
  platform?: string;
  developer?: string;
  publisher?: string;
  count: number;
}

export default function ViewAllGamesButton({ platform, developer, publisher, count }: Props) {
  const router = useRouter();
  
  const handleClick = () => {
    // Override session storage filters
    if (platform) {
      sessionStorage.setItem('archive-platforms', JSON.stringify([platform]));
      sessionStorage.setItem('archive-developer', JSON.stringify([]));
      sessionStorage.setItem('archive-genre', JSON.stringify([]));
      sessionStorage.setItem('archive-country', JSON.stringify([]));
      sessionStorage.setItem('archive-search', JSON.stringify(""));
      router.push(`/games?platform=${encodeURIComponent(platform)}`);
    } else if (developer) {
      sessionStorage.setItem('archive-developer', JSON.stringify([developer]));
      sessionStorage.setItem('archive-platforms', JSON.stringify([]));
      sessionStorage.setItem('archive-genre', JSON.stringify([]));
      sessionStorage.setItem('archive-country', JSON.stringify([]));
      sessionStorage.setItem('archive-search', JSON.stringify(""));
      router.push(`/games?developer=${encodeURIComponent(developer)}`);
    } else if (publisher) {
      sessionStorage.setItem('archive-developer', JSON.stringify([]));
      sessionStorage.setItem('archive-platforms', JSON.stringify([]));
      sessionStorage.setItem('archive-genre', JSON.stringify([]));
      sessionStorage.setItem('archive-country', JSON.stringify([]));
      sessionStorage.setItem('archive-search', JSON.stringify(publisher));
      router.push(`/games?q=${encodeURIComponent(publisher)}`);
    }
  };

  return (
    <div className="mt-6 flex justify-center">
      <button 
        onClick={handleClick}
        className="px-6 py-3 bg-vault-surface hover:bg-vault-surface-light border border-vault-border hover:border-mint/50 rounded-xl text-text-primary font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
      >
        모두 보기 <span className="text-text-muted font-normal">({count})</span>
      </button>
    </div>
  );
}
