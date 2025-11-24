# 📂 Exemples - Shopify Bridge Checkout

> **⚠️ Ce code est fourni en l'état et nécessite adaptation à votre contexte spécifique**  
> 🆘 **Besoin d'aide ?** Contactez romain@zedtech.fr ou ouvrez une issue GitHub

Ce dossier contient tous les fichiers nécessaires pour intégrer le checkout Stripe dans votre boutique Shopify.

## 📋 Contenu

### Routes API Next.js (Essentielles)

Ces fichiers constituent le cœur du bridge Stripe ↔ Shopify:

| Fichier | Destination | Description |
|---------|-------------|-------------|
| `stripe-checkout-route.ts` | `app/api/v1/stripe/checkout/route.ts` | Crée une session Stripe Checkout |
| `stripe-webhook-route.ts` | `app/api/v1/stripe/webhook/route.ts` | Traite les paiements complétés |
| `session-order-route.ts` | `app/api/v1/session/[sessionId]/order/route.ts` | Récupère l'URL de statut commande |

### Configuration

| Fichier | Description |
|---------|-------------|
| `.env.example` | Variables d'environnement à configurer |
| `package.json.example` | Dépendances npm nécessaires |

### Templates Shopify (Optionnels)

Les fichiers dans `/shopify` sont des exemples de templates Liquid d'une implémentation réelle. Ils contiennent:

- **page.checkout-v2.liquid**: Template de page checkout personnalisé
- **stripe-bridge.liquid**: Snippet JavaScript pour gérer l'interaction frontend

⚠️ **Note**: Ces fichiers contiennent beaucoup de logique métier spécifique (gestion gift cards, programme fidélité, etc.) et sont fournis **à titre d'exemple uniquement**. Vous devrez les adapter considérablement à votre cas d'usage.

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
# Copiez package.json.example vers votre projet
cp examples/package.json.example package.json

# Installez les dépendances
npm install
# ou
pnpm install
```

### 2. Configurer les variables d'environnement

```bash
# Copiez .env.example à la racine
cp examples/.env.example .env.local

# Éditez .env.local et remplissez vos clés
```

### 3. Déployer les routes API

```bash
# Créez la structure de dossiers
mkdir -p app/api/v1/stripe/{checkout,webhook}
mkdir -p app/api/v1/session/[sessionId]/order

# Copiez les fichiers
cp examples/stripe-checkout-route.ts app/api/v1/stripe/checkout/route.ts
cp examples/stripe-webhook-route.ts app/api/v1/stripe/webhook/route.ts
cp examples/session-order-route.ts app/api/v1/session/[sessionId]/order/route.ts
```

### 4. Personnaliser le code

Recherchez les commentaires `// ⚠️ TODO:` dans chaque fichier et adaptez:

**Dans `stripe-checkout-route.ts`:**
- Taux de TVA (défaut: 20% France)
- Méthodes de paiement (card, paypal, klarna, alma)
- URLs de redirection success/cancel
- Devise (défaut: EUR)
- Tags Shopify
- Logique gift cards (si vous n'utilisez pas)

**Dans `stripe-webhook-route.ts`:**
- Normalisation téléphone (défaut: France +33)
- Types de paiement supportés
- Logique métier spécifique

**Dans `session-order-route.ts`:**
- Généralement pas de modification nécessaire

## 🎯 Structure recommandée du projet

```
votre-projet/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── stripe/
│   │       │   ├── checkout/
│   │       │   │   └── route.ts
│   │       │   └── webhook/
│   │       │       └── route.ts
│   │       └── session/
│   │           └── [sessionId]/
│   │               └── order/
│   │                   └── route.ts
│   └── ...
├── .env.local
├── package.json
└── ...
```

## 🔧 Intégration Frontend

### Appel API depuis votre boutique Shopify

Vous pouvez intégrer le checkout de différentes façons:

#### Option A: Depuis un theme Liquid custom

```javascript
// Dans votre page checkout Shopify
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
    // ... payload
  })
})
.then(r => r.json())
.then(data => {
  window.location.href = data.url; // Redirige vers Stripe
});
```

#### Option B: Depuis votre app React/Next.js

```typescript
const checkoutSession = await createStripeCheckout({
  cart: shopifyCart,
  customer: customerData,
  payload: checkoutPayload
});

// Redirection vers Stripe
window.location.href = checkoutSession.url;
```

#### Récupération du statut après paiement

```javascript
// Sur votre page de success (URL de redirection Stripe)
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  // Polling pour attendre la création de la commande Shopify
  const interval = setInterval(async () => {
    const response = await fetch(`/api/v1/session/${sessionId}/order`);
    const data = await response.json();
    
    if (data.order_status_url) {
      clearInterval(interval);
      // Redirige vers la page de confirmation Shopify
      window.location.href = data.order_status_url;
    }
  }, 2000); // Poll toutes les 2 secondes
}
```

## 📝 Notes importantes

### Gift Cards

Les routes incluent la gestion des gift cards Shopify. Si vous ne les utilisez pas:
1. Supprimez les appels à `getGiftCardDetail()`
2. Retirez la logique gift card dans `createOrderPayload()`
3. Simplifiez la structure du payload Shopify

### Remises & Coupons

Le système gère:
- **Codes promo Shopify** (appliqués au panier avant checkout)
- **Programme fidélité** (via coupons Stripe automatiques)
- **Gift cards** (transaction séparée dans Shopify)

Adaptez selon vos besoins.

### Taxes (TVA)

Par défaut configuré pour la France (TVA 20%, taxes incluses):
```typescript
rate: 0.2, // 20%
taxes_included: true
```

Pour d'autres pays, modifiez:
- Le taux dans `calculatePriceFromTTC()`
- Le titre `"FR TVA"` → votre titre
- `taxes_included` selon votre configuration

## 🐛 Dépannage

Consultez [../docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) pour les erreurs courantes.

## 📚 Documentation complète

- [Guide de démarrage rapide](../docs/QUICK_START.md)
- [README principal](../README.md)

## 💡 Templates Liquid (Avancé)

Les fichiers `/shopify/*.liquid` sont fournis **à titre d'exemple**. Ils contiennent:

**page.checkout-v2.liquid:**
- Page checkout personnalisée Shopify
- Formulaire client (email, téléphone, nom)
- Liste des produits du panier
- Gestion des remises et gift cards
- CTA "Je valide" qui appelle l'API

**stripe-bridge.liquid:**
- Classe JavaScript `StripeBridge`
- Gestion de l'appel API `/stripe/checkout`
- Polling après paiement pour récupérer l'order_status_url
- Validation frontend des champs
- Gestion des boutons de loading

⚠️ **Ces fichiers nécessitent une personnalisation importante** car ils incluent:
- Logique de programme de fidélité spécifique
- Gestion de gift cards custom
- Styles CSS custom
- Intégrations avec d'autres snippets Liquid

Utilisez-les comme **inspiration** plutôt que comme code production-ready.

## 🤝 Contribution

Si vous améliorez ce starter kit, n'hésitez pas à contribuer!

---

## 🆘 Support & Contact

**Besoin d'aide pour l'intégration ?**

- 📧 Email: **romain@zedtech.fr**
- 💬 GitHub Issues: [Ouvrir une issue](../../issues)
- 📚 Documentation: [Guide complet](../docs/QUICK_START.md) | [README principal](../README.md) | [Troubleshooting](../docs/TROUBLESHOOTING.md)

> Ce code est open-source et partagé pour aider la communauté. N'hésitez pas à demander du support si vous bloquez !

