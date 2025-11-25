# 🚀 Installation de l'Application

Application créée avec succès ! Voici comment démarrer.

📖 **[Lire le retour d'expérience complet sur LinkedIn →](https://www.linkedin.com/posts/romain-piveteau_23-de-conversion-gr%C3%A2ce-au-checkout-activity-7398986372008701953-fS-O)** (+23% de conversion)

## 📋 Structure créée

```
sample-bridge-checkout-sopify/
├── app/
│   ├── api/v1/                     # 3 routes API essentielles
│   │   ├── stripe/checkout/        # POST - Crée session Stripe
│   │   ├── stripe/webhook/         # POST - Traite paiements
│   │   └── session/[id]/order/     # GET - Récupère statut commande
│   ├── globals.css                 # Styles globaux
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Page d'accueil
├── src/lib/                        # Helpers réutilisables
│   ├── shopify.ts                  # Fonctions API Shopify
│   └── utils.ts                    # Utilitaires généraux
├── docs/                           # Documentation complète
│   ├── QUICK_START.md              # Guide installation (15 min)
│   ├── TROUBLESHOOTING.md          # Résolution problèmes
│   └── ARCHITECTURE.md             # Architecture technique
├── examples/                       # Exemples et références
├── package.json                    # Dépendances npm
├── tsconfig.json                   # Configuration TypeScript
├── next.config.js                  # Configuration Next.js
├── tailwind.config.ts              # Configuration Tailwind
└── .env.example                    # Variables d'environnement
```

## ⚡ Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
# ou
pnpm install
```

**Packages installés :**
- `next@14.1.0` - Framework Next.js
- `react@18.2.0` - React
- `stripe@17.4.0` - SDK Stripe
- `redis@4.7.0` - Client Redis
- `typescript@5.3.3` - TypeScript

### 2. Configurer les variables d'environnement

Créez `.env.local` à la racine :

```bash
cp .env.example .env.local
```

Remplissez les valeurs :
- `SHOPIFY_DOMAIN` - Votre domaine Shopify
- `ADMIN_API_KEY` - Token Admin API Shopify
- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret webhook Stripe
- `REDIS_URL` - URL Redis (Vercel KV gratuit)
- `NEXT_PUBLIC_SITE_URL` - URL de votre app

📚 **Guide détaillé :** [`docs/QUICK_START.md`](./docs/QUICK_START.md)

### 3. Lancer le serveur

```bash
npm run dev
```

L'application démarre sur **http://localhost:3000**

### 4. Tester les routes API

```bash
# Test route checkout
curl -X POST http://localhost:3000/api/v1/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"cart": {...}, "customer": {...}}'
```

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| [`README.md`](./README.md) | Vue d'ensemble du projet |
| [`docs/QUICK_START.md`](./docs/QUICK_START.md) | Guide installation (5 étapes, 15 min) |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | Solutions aux 5 problèmes courants |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Architecture technique détaillée |

## 🎯 Routes API disponibles

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/v1/stripe/checkout` | POST | Crée une session Stripe Checkout |
| `/api/v1/stripe/webhook` | POST | Traite les paiements complétés (webhook) |
| `/api/v1/session/[sessionId]/order` | GET | Récupère l'URL de statut commande Shopify |

## 🧪 Tests

### Cartes de test Stripe

- **Succès :** `4242 4242 4242 4242`
- **Échec :** `4000 0000 0000 0002`
- **3D Secure :** `4000 0025 0000 3155`

### Tester le webhook en local

```bash
# Installez Stripe CLI
brew install stripe/stripe-cli/stripe

# Écoutez les webhooks
npm run stripe
# ou
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
```

## 🔧 Personnalisation

### Méthodes de paiement

Dans `app/api/v1/stripe/checkout/route.ts` :

```typescript
payment_method_types: ["card", "paypal", "klarna", "alma"]
```

### Taux de TVA

Par défaut : TVA France (20%). Pour changer :

```typescript
// Dans calculatePriceFromTTC()
const originalPrice = +(ttcPrice / 1.2).toFixed(2); // 1.2 = 20%
```

### URLs de redirection

```typescript
success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`
cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`
```

## 🐛 Problèmes courants

❌ **"PaymentIntent creation failed"**  
→ Vérifiez `STRIPE_SECRET_KEY` dans `.env.local`

❌ **"Redis connection failed"**  
→ Vérifiez `REDIS_URL` (format : `redis://...`)

❌ **"Unauthorized" Shopify**  
→ Vérifiez `ADMIN_API_KEY` (doit commencer par `shpat_`)

❌ **CORS error**  
→ Les headers CORS sont déjà configurés dans les routes

📖 **Guide complet :** [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)

## 📞 Support

- **Questions :** Ouvrez une [issue GitHub](https://github.com/romain-zt/sample-bridge-checkout-sopify/issues)
- **Email :** [romain@zedtech.fr](mailto:romain@zedtech.fr)

## 🚀 Déploiement

### Vercel (recommandé)

```bash
# Installez Vercel CLI
npm i -g vercel

# Déployez
vercel
```

Ou cliquez sur :  
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/romain-zt/sample-bridge-checkout-sopify)

### Variables d'environnement (production)

N'oubliez pas de configurer toutes les variables dans Vercel :
- `SHOPIFY_DOMAIN`
- `ADMIN_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `REDIS_URL`
- `NEXT_PUBLIC_SITE_URL`

## ✅ Checklist post-installation

- [ ] Dépendances installées (`npm install`)
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Serveur démarre sans erreur (`npm run dev`)
- [ ] Webhook Stripe configuré (local ou production)
- [ ] Test paiement avec carte `4242 4242 4242 4242`
- [ ] Commande créée dans Shopify Admin

---

**Félicitations ! L'application est prête à l'emploi.** 🎉

Consultez [`docs/QUICK_START.md`](./docs/QUICK_START.md) pour le guide complet.

