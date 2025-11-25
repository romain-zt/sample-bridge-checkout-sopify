# ⚡ Quick Start - Installation en 5 étapes

Guide d'installation pas à pas pour intégrer Stripe dans votre boutique Shopify.

📖 **[Lire le retour d'expérience complet sur LinkedIn →](https://www.linkedin.com/posts/romain-piveteau_23-de-conversion-gr%C3%A2ce-au-checkout-activity-7398986372008701953-fS-O)** (+23% de conversion)

---

## Étape 1️⃣ : Installer les dépendances (2 min)

Installez les packages npm nécessaires dans votre projet Next.js :

```bash
npm install stripe redis
# ou
pnpm add stripe redis
```

**Packages requis :**
- `stripe` - SDK officiel Stripe
- `redis` - Cache temporaire pour les données de commande

📦 **Référence :** Voir [`examples/package.json.example`](../examples/package.json.example) pour la version complète.

**⏱️ Temps estimé :** 2 minutes

---

## Étape 2️⃣ : Configurer les clés API (5 min)

### A. Shopify Admin API

1. Allez dans **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Cliquez sur **Develop apps** → **Create an app**
3. Dans **Configuration** → **Admin API integration**, activez :
   - ✅ `read_orders` + `write_orders`
   - ✅ `read_customers` + `write_customers`
   - ✅ `read_gift_cards` (optionnel)
4. Copiez le **Admin API access token** (commence par `shpat_`)

### B. Stripe

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copiez votre **Secret key** (commence par `sk_test_` ou `sk_live_`)

### C. Redis (gratuit avec Vercel KV)

1. Si vous déployez sur Vercel, utilisez [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (gratuit)
2. Dans votre projet Vercel → Storage → Create Database → KV
3. Copiez la variable `KV_REST_API_URL` et utilisez-la comme `REDIS_URL`

### D. Créez votre fichier `.env.local`

Copiez [`examples/.env.example`](../examples/.env.example) à la racine et remplissez :

```env
# Shopify
SHOPIFY_DOMAIN=votre-boutique.myshopify.com
ADMIN_API_KEY=shpat_xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # On configurera ça à l'étape 4

# Redis (Vercel KV)
REDIS_URL=redis://default:xxxxx@xxxxx.kv.vercel-storage.com:6379

# URLs
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com  # ou http://localhost:3000 en dev
```

**⏱️ Temps estimé :** 5 minutes

---

## Étape 3️⃣ : Copier les routes API (1 min)

Créez la structure de dossiers et copiez les 3 routes essentielles :

```bash
# Créez les dossiers
mkdir -p app/api/v1/stripe/checkout
mkdir -p app/api/v1/stripe/webhook
mkdir -p app/api/v1/session/[sessionId]/order

# Copiez les fichiers
cp examples/stripe-checkout-route.ts app/api/v1/stripe/checkout/route.ts
cp examples/stripe-webhook-route.ts app/api/v1/stripe/webhook/route.ts
cp examples/session-order-route.ts app/api/v1/session/[sessionId]/order/route.ts
```

**📝 Fichiers copiés :**
- [`stripe-checkout-route.ts`](../examples/stripe-checkout-route.ts) → Crée une session Stripe
- [`stripe-webhook-route.ts`](../examples/stripe-webhook-route.ts) → Traite les paiements
- [`session-order-route.ts`](../examples/session-order-route.ts) → Récupère le statut commande

**⏱️ Temps estimé :** 1 minute

---

## Étape 4️⃣ : Configurer le webhook Stripe (3 min)

### Option A : Production

1. Allez sur [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez **Add endpoint**
3. URL : `https://votre-domaine.com/api/v1/stripe/webhook`
4. Événements à écouter : sélectionnez `checkout.session.completed`
5. Copiez le **Signing secret** (commence par `whsec_`)
6. Ajoutez-le dans `.env.local` → `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

### Option B : Développement local

```bash
# Installez Stripe CLI
brew install stripe/stripe-cli/stripe

# Connectez-vous
stripe login

# Écoutez les webhooks
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
```

Le terminal affiche un **webhook secret** → copiez-le dans `.env.local`

**⏱️ Temps estimé :** 3 minutes

---

## Étape 5️⃣ : Tester l'intégration (4 min)

### A. Lancez votre serveur Next.js

```bash
npm run dev
# Serveur sur http://localhost:3000
```

### B. Testez l'API avec un appel POST

```bash
curl -X POST http://localhost:3000/api/v1/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "cart": {
      "id": "test_cart",
      "token": "test_token",
      "total_price": 9900,
      "currency": "EUR",
      "items": [{
        "title": "Produit Test",
        "quantity": 1,
        "price": 9900,
        "final_price": 9900,
        "taxable": true,
        "line_price": 9900
      }]
    },
    "customer": {
      "email": "test@example.com",
      "first_name": "Jean",
      "last_name": "Test",
      "phone": "0612345678"
    },
    "payload": {
      "items": [],
      "subtotal": 9900,
      "tax": 1650,
      "total": 9900,
      "total_discounts": 0
    }
  }'
```

**Résultat attendu :**
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx"
}
```

### C. Testez un paiement

1. Ouvrez l'URL retournée dans votre navigateur
2. Utilisez la carte de test : **4242 4242 4242 4242**
3. Date : n'importe quelle date future
4. CVC : n'importe quel 3 chiffres
5. Validez le paiement

### D. Vérifiez dans Shopify Admin

Allez dans **Shopify Admin** → **Orders**  
Vous devriez voir une nouvelle commande créée automatiquement ✅

**⏱️ Temps estimé :** 4 minutes

---

## ✅ Récapitulatif

| Étape | Description | Temps |
|-------|-------------|-------|
| 1 | Installer dépendances npm | 2 min |
| 2 | Configurer clés API | 5 min |
| 3 | Copier routes API | 1 min |
| 4 | Configurer webhook Stripe | 3 min |
| 5 | Tester l'intégration | 4 min |
| **Total** | **Installation complète** | **15 min** |

---

## 🎨 Personnalisation (optionnel)

### Changer les méthodes de paiement

Dans `app/api/v1/stripe/checkout/route.ts` :

```typescript
payment_method_types: ["card", "paypal", "klarna", "alma"]
// Retirez ou ajoutez selon vos besoins
```

### Modifier le taux de TVA

Par défaut : TVA France (20%). Pour changer :

```typescript
// Dans calculatePriceFromTTC()
const originalPrice = +(ttcPrice / 1.2).toFixed(2); // 1.2 = 20% TVA
// Changez 1.2 selon votre taux (ex: 1.21 pour 21%)
```

### Personnaliser les URLs de redirection

```typescript
success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`
cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`
```

---

## 🔧 Intégration Frontend

### Appeler l'API depuis votre boutique Shopify

```javascript
// Depuis votre page checkout Shopify (Liquid)
fetch('https://votre-api.com/api/v1/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cart: {{ cart | json }},
    customer: {
      email: '{{ customer.email }}',
      first_name: '{{ customer.first_name }}',
      last_name: '{{ customer.last_name }}',
      phone: '{{ customer.phone }}'
    },
    payload: {
      items: {{ cart.items | json }},
      subtotal: {{ cart.total_price }},
      tax: {{ cart.total_tax }},
      total: {{ cart.total_price }},
      total_discounts: {{ cart.total_discount }}
    }
  })
})
.then(r => r.json())
.then(data => {
  // Redirige vers Stripe
  window.location.href = data.url;
});
```

### Récupérer le statut après paiement

Sur votre page de success (après redirection Stripe) :

```javascript
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  // Polling pour attendre la création de la commande
  const checkOrder = async () => {
    const response = await fetch(`/api/v1/session/${sessionId}/order`);
    const data = await response.json();
    
    if (data.order_status_url) {
      // Commande créée ! Redirige vers Shopify
      window.location.href = data.order_status_url;
    } else {
      // Réessaie dans 2 secondes
      setTimeout(checkOrder, 2000);
    }
  };
  
  checkOrder();
}
```

📚 **Exemple complet :** Voir [`examples/shopify/stripe-bridge.liquid`](../examples/shopify/stripe-bridge.liquid)

---

## ❌ Ça ne marche pas ?

Consultez le guide de dépannage : [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md)

**Problèmes fréquents :**
- ❌ "PaymentIntent creation failed" → Clé Stripe invalide
- ❌ "Invalid webhook signature" → Secret webhook incorrect
- ❌ "Unauthorized" → Token Shopify invalide
- ❌ CORS error → Vérifiez les headers CORS dans les routes
- ❌ Redis connection failed → Vérifiez `REDIS_URL`

**Toujours bloqué ?** ✉️ [romain@zedtech.fr](mailto:romain@zedtech.fr)

---

## 📚 Ressources utiles

- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Shopify Admin API](https://shopify.dev/docs/api/admin-rest)
- [Cartes de test Stripe](https://stripe.com/docs/testing)
- [Vercel KV (Redis)](https://vercel.com/docs/storage/vercel-kv)

---

**✅ Installation terminée !** Vous pouvez maintenant accepter des paiements Stripe dans votre boutique Shopify.
