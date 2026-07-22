"use client";

export function is19PlusGame(game?: { isAdult?: boolean; ageRating?: string; genre?: string; title?: string } | null): boolean {
  if (!game) return false;
  if (game.isAdult) return true;
  if (game.ageRating === '19' || game.ageRating === '19+' || game.ageRating === 'R18') return true;
  if (game.genre) {
    const g = game.genre.toLowerCase();
    if (g.includes('19세') || g.includes('19금') || g.includes('성인') || g.includes('erotic') || g.includes('hentai') || g.includes('adult')) {
      return true;
    }
  }
  if (game.title) {
    const t = game.title.toLowerCase();
    if (
      t.includes('grand theft auto') ||
      t.includes('gta') ||
      t.includes('resident evil') ||
      t.includes('god of war') ||
      t.includes('mortal kombat') ||
      t.includes('silent hill') ||
      t.includes('postal') ||
      t.includes('manhunt')
    ) {
      return true;
    }
  }
  return false;
}

export function isAgeVerified(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('retrovault_age_verified') === 'true';
  } catch (e) {
    return false;
  }
}

export function setAgeVerified(verified: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (verified) {
      localStorage.setItem('retrovault_age_verified', 'true');
    } else {
      localStorage.removeItem('retrovault_age_verified');
    }
    // Dispatch custom event to notify all listening components across app
    window.dispatchEvent(new Event('ageVerificationChanged'));
  } catch (e) {
    console.error(e);
  }
}

export function calculateAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = (today.getMonth() + 1) - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}
