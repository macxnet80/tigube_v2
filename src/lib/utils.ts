import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Berechnet das Alter aus einem Geburtsdatum
 * @param birthDate - Geburtsdatum im Format YYYY-MM-DD
 * @returns Alter in Jahren
 */
export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateAvatarUrl(name: string): string {
  // This generates a placeholder avatar with initials
  const initials = getInitials(name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=34D399&color=fff`;
}

export function getRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Prüft, ob ein Dienstleister ein Betreuer ist
 * @param userType - Der user_type aus der users-Tabelle ('caretaker' | 'dienstleister' | 'owner')
 * @param dienstleisterTyp - Der dienstleister_typ aus dem Profil
 * @param kategorieId - Die kategorie_id (1 = Betreuer)
 * @returns true wenn es sich um einen Betreuer handelt
 */
export function isCaretaker(
  userType?: string | null,
  dienstleisterTyp?: string | null,
  kategorieId?: number | null
): boolean {
  // Prüfe user_type
  if (userType === 'caretaker') return true;
  
  // Prüfe kategorie_id (1 = Betreuer)
  if (kategorieId === 1) return true;
  
  // Prüfe dienstleister_typ als Fallback
  if (dienstleisterTyp === 'caretaker' || dienstleisterTyp === 'betreuer') return true;
  
  return false;
}