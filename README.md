# 🚀 Shopify Bridge Checkout - Stripe Integration

> Intégrez Stripe dans votre boutique Shopify en 10 minutes. Créez automatiquement les commandes Shopify après chaque paiement Stripe.

**Résultat prouvé:** Conversion 6.49% → 8.01% (+23%) = +€32,534 en 10 mois sur LittleBiceps

📖 **[Lire le retour d'expérience complet sur LinkedIn →](https://www.linkedin.com/posts/romain-piveteau_23-de-conversion-gr%C3%A2ce-au-checkout-activity-7398986372008701953-fS-O)**

[![GitHub stars](https://img.shields.io/github/stars/romain-zt/sample-bridge-checkout-sopify)](https://github.com/romain-zt/sample-bridge-checkout-sopify/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/romain-zt/sample-bridge-checkout-sopify)](https://github.com/romain-zt/sample-bridge-checkout-sopify/network)

---

## 🎯 Ce que vous obtenez

### Bridge API Production-Ready

✅ **3 routes API prêtes à l'emploi** - Checkout Stripe + Webhook + Récupération commande  
✅ **Synchronisation automatique** - Chaque paiement Stripe crée une commande Shopify  
✅ **Gestion complète des clients** - Recherche et association automatique dans Shopify  
✅ **Support remises & gift cards** - Codes promo et cartes cadeaux Shopify intégrés

### 🎁 Système de Staging Gratuit

✅ **Environnement de test sans Shopify Plus** - Économise €27K/an  
✅ **Mode développeur avec Stripe localhost** - Zéro frais sur tests  
✅ **Query parameters pour tests discrets** - `?checkout_test=true&key=XXX`  
✅ **Templates Liquid prêts à l'emploi** - Dans `/examples/shopify/`

### 💡 Prompts ChatGPT Inclus

✅ **Analyse UI/UX de checkout existant** - Identifiez les frictions  
✅ **Génération de composants React optimisés** - Code production-ready  
✅ **Intégration Stripe avec mode dev** - Setup complet en 10 min

[📁 Voir tous les prompts dans `/prompts/`](./prompts/)

---

## 🚀 Quick Start

**1. Clonez et installez les dépendances**
```bash
git clone https://github.com/romain-zt/sample-bridge-checkout-sopify.git
cd sample-bridge-checkout-sopify
pnpm install
```

Les packages essentiels (`stripe` pour les paiements, `redis` pour le cache) sont déjà configurés.

**2. Configurez vos clés API**

Créez `.env.local` et remplissez vos clés Shopify, Stripe et Redis (voir `.env.example`).

**3. Copiez les routes API**
```bash
mkdir -p app/api/v1/stripe/checkout app/api/v1/stripe/webhook app/api/v1/session/[sessionId]/order
cp examples/stripe-checkout-route.ts app/api/v1/stripe/checkout/route.ts
cp examples/stripe-webhook-route.ts app/api/v1/stripe/webhook/route.ts
cp examples/session-order-route.ts app/api/v1/session/[sessionId]/order/route.ts
```

**4. Lancez le serveur de développement**
```bash
pnpm dev
```

**5. Testez un paiement**

Utilisez la carte test `4242 4242 4242 4242` et vérifiez la commande dans Shopify Admin ✅

📚 **Guide détaillé :** [Quick Start complet](./docs/QUICK_START.md)

---

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/romain-zt/sample-bridge-checkout-sopify)

---

## 📁 Structure Complète

```
sample-bridge-checkout-shopify/
├── docs/
│   ├── QUICK_START.md              # Installation pas à pas (10 min)
│   ├── TROUBLESHOOTING.md          # Solutions aux erreurs courantes
│   └── ARCHITECTURE.md             # Architecture technique détaillée
├── examples/
│   ├── stripe-checkout-route.ts    # POST /stripe/checkout - Crée session Stripe
│   ├── stripe-webhook-route.ts     # POST /stripe/webhook - Traite paiement
│   ├── session-order-route.ts      # GET /session/{id}/order - Statut commande
│   ├── .env.example                # Variables d'environnement
│   ├── package.json.example        # Dépendances npm
│   └── shopify/
│       ├── stripe-bridge.liquid        # Bridge principal pour checkout custom
│       ├── page.checkout-v2.liquid     # Page checkout staging
│       └── framework--cart.liquid      # Intégration panier
├── prompts/
│   ├── 01-ui-checkout-analysis.md      # Analyser votre checkout existant
│   ├── 02-code-generation.md           # Générer vos composants React
│   └── 03-stripe-integration.md        # Intégrer Stripe en mode dev
└── README.md
```

**3 routes API essentielles :**

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/v1/stripe/checkout` | POST | Crée une session Stripe Checkout |
| `/api/v1/stripe/webhook` | POST | Webhook - traite les paiements complétés |
| `/api/v1/session/[sessionId]/order` | GET | Récupère l'URL de statut commande Shopify |

---

## 💬 Support & Contact

**Questions ou problèmes ?**
- 🐛 Ouvrez une [issue GitHub](https://github.com/romain-zt/sample-bridge-checkout-sopify/issues)
- 📧 Email : **[romain@zedtech.fr](mailto:romain@zedtech.fr)**
- 📖 Retrouvez le post LinkedIn original : **[Retour d'expérience +23% de conversion](https://www.linkedin.com/posts/romain-piveteau_23-de-conversion-gr%C3%A2ce-au-checkout-activity-7398986372008701953-fS-O)**

**Accompagnement personnalisé disponible** pour adapter l'intégration à vos besoins spécifiques.

---