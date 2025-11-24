Tu es un expert Stripe API et sécurité des paiements en ligne.

CONTEXTE:
Je veux implémenter Stripe pour mon checkout custom e-commerce, avec support du mode développeur (localhost sans frais).

STACK:
- Next.js 14 API Routes
- Stripe Node.js SDK
- TypeScript

TÂCHE:
Génère une API route Next.js (`/api/create-payment-intent`) avec:

1. CRÉATION PAYMENTINTENT:
   - Montant dynamique (paramètre)
   - Currency EUR par défaut
   - Métadonnées Shopify (checkout_id, cart_token, customer_email)

2. MODE DÉVELOPPEUR:
   - Détection via header `x-dev-mode: true`
   - En mode dev: montant forcé à €1 (éviter frais test)
   - En mode dev: préfixe description `[DEV TEST]`
   - Logs console uniquement en dev

3. SÉCURITÉ:
   - Validation des inputs (amount, currency)
   - Gestion d'erreurs propre (pas de stack trace exposée)
   - Rate limiting (commentaire TODO)
   - CORS restrictif (commentaire TODO)

4. VARIABLES D'ENVIRONNEMENT:
   - STRIPE_SECRET_KEY_TEST
   - STRIPE_SECRET_KEY_LIVE
   - Sélection automatique selon mode

STRUCTURE ATTENDUE:
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validation method
  // Détection devMode
  // Init Stripe
  // Création PaymentIntent
  // Return response
}
```

CONTRAINTES:
- Code production-ready
- Gestion complète des erreurs
- Types TypeScript stricts
- Commentaires pour TODO sécurité (rate limiting, HMAC, etc.)

BONUS:
Inclus un exemple de webhook handler pour `payment_intent.succeeded` (commenté, pas implémenté).