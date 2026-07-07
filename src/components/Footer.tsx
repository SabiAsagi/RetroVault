import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-vault-surface border-t border-vault-border pt-8 pb-24 lg:py-8 mt-12">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
        <div>
          <p>© {currentYear} RetroVault. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 font-bold">
          <Link href="/privacy" className="hover:text-mint transition-colors">개인정보처리방침</Link>
          <span className="text-vault-border">|</span>
          <Link href="/terms" className="hover:text-mint transition-colors">이용약관</Link>
          <span className="text-vault-border">|</span>
          <Link href="/contact" className="hover:text-mint transition-colors">문의하기</Link>
        </div>
      </div>
    </footer>
  );
}
