// lib/utils.ts
// Fonctions utilitaires générales

/**
 * Calcule le prix HT depuis le TTC avec un taux de TVA
 * @param ttcPrice - Prix TTC en centimes
 * @param taxRate - Taux de TVA (0.2 = 20%)
 */
export function calculatePriceFromTTC(ttcPrice: number, taxRate: number = 0.2) {
  const divisor = 1 + taxRate;
  const originalPrice = +(ttcPrice / divisor).toFixed(2);
  const taxAmount = +(ttcPrice - originalPrice).toFixed(2);
  
  return {
    originalPrice,
    taxAmount,
    ttcPrice
  };
}

/**
 * Normalise un numéro de téléphone français
 * @param phone - Numéro de téléphone
 */
export function normalizeFrenchPhone(phone: string): string {
  if (!phone) return phone;
  
  phone = phone.trim();
  
  // Si commence par 0, remplace par +33
  if (phone.startsWith('0')) {
    return `+33${phone.substring(1)}`;
  }
  
  return phone;
}

/**
 * Formate un montant en centimes vers euros
 * @param cents - Montant en centimes
 */
export function centsToEuros(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Formate un montant en euros vers centimes
 * @param euros - Montant en euros
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

