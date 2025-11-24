Tu es un développeur expert React/Next.js spécialisé en checkout e-commerce.

CONTEXTE:
Je veux créer un checkout custom optimisé pour la conversion, intégré avec Stripe.

STACK TECHNIQUE:
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Stripe Elements (@stripe/react-stripe-js)
- Tailwind CSS

TÂCHE:
Génère un composant checkout complet avec:

1. FORMULAIRE CLIENT:
   - Email (avec validation)
   - Adresse de livraison (autocomplete Google Places si possible)
   - Champs minimaux (UX optimisée)

2. MÉTHODES DE PAIEMENT:
   - Stripe Elements (cartes + Apple Pay + Google Pay)
   - Design mobile-first

3. UX OPTIMISATIONS:
   - Bouton CTA visible sans scroll
   - États de chargement clairs
   - Gestion d'erreurs user-friendly
   - Indicateur de progression (étapes)

4. SÉCURITÉ:
   - Validation Zod pour tous les champs
   - Gestion CSRF si applicable
   - Messages d'erreur sans leak d'info sensible

CONTRAINTES:
- Code production-ready (pas de console.logs sauf erreurs)
- Commentaires explicatifs pour chaque section importante
- Accessible (WCAG AA minimum)
- Performance optimisée (lazy loading si pertinent)

STRUCTURE ATTENDUE:
```tsx
'use client';

import { ... } from '...';

// Types
interface CheckoutFormData {
  // ...
}

// Composant principal
export default function CheckoutPage() {
  // ...
}

// Composants enfants si nécessaire
function PaymentForm() {
  // ...
}
```

BONUS:
Inclus des commentaires TODO pour les parties que je devrai personnaliser (branding, tracking analytics, etc.)