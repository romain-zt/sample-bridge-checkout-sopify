# 📝 Changelog

## v1.0.0 - Initial Release

### ✨ Fonctionnalités

**Backend (Next.js API Routes):**
- ✅ Route `/api/v1/stripe/checkout` - Création de session Stripe
- ✅ Route `/api/v1/stripe/webhook` - Traitement des paiements complétés
- ✅ Route `/api/v1/session/[sessionId]/order` - Récupération statut commande
- ✅ Support des remises et coupons dynamiques
- ✅ Calcul automatique de la TVA (configurable)
- ✅ Gestion des gift cards Shopify (optionnel)
- ✅ Recherche et association automatique des clients
- ✅ Cache Redis pour fiabilité maximale

**Frontend (Shopify Liquid):**
- ✅ Template page checkout personnalisé
- ✅ Validation frontend des champs (email, téléphone, nom)
- ✅ Gestion des états de loading
- ✅ Polling automatique après paiement
- ✅ Support des gift cards et codes promo
- ✅ Drawer cart avec redirection automatique

**Documentation:**
- ✅ README principal complet
- ✅ Guide de démarrage rapide (QUICK_START.md)
- ✅ Documentation d'architecture (ARCHITECTURE.md)
- ✅ Guide de dépannage (TROUBLESHOOTING.md)
- ✅ Documentation des templates Liquid
- ✅ Fichier `.env.example` avec tous les placeholders

### 🔒 Sécurité

- ✅ Vérification de signature webhook Stripe
- ✅ Variables d'environnement pour toutes les clés sensibles
- ✅ Validation des données avant création commande
- ✅ Pas de clés API en dur dans le code

### 🎯 Production-Ready

- ✅ Code nettoyé et commenté
- ✅ Tous les `console.log` non-essentiels supprimés
- ✅ Placeholders pour personnalisation (`⚠️ TODO:`)
- ✅ Gestion d'erreurs complète
- ✅ Support TypeScript
- ✅ Compatible Next.js 14+

### 📚 Exemples fournis

**Routes API:**
- `stripe-checkout-route.ts` - Création session (documenté)
- `stripe-webhook-route.ts` - Webhook sécurisé (documenté)
- `session-order-route.ts` - Récupération status (documenté)

**Templates Shopify:**
- `page.checkout-v2.liquid` - Page checkout custom
- `stripe-bridge.liquid` - Classe JavaScript client
- `framework--cart.liquid` - Drawer cart adapté

**Configuration:**
- `.env.example` - Variables d'environnement
- `package.json.example` - Dépendances npm

### 🎨 Personnalisation

Tous les points de personnalisation sont marqués avec:
```javascript
// ⚠️ TODO: Description de ce qui doit être adapté
```

Recherchez `⚠️ TODO:` dans tous les fichiers pour identifier les zones à personnaliser.

### ⚙️ Configuration par défaut

- **TVA**: 20% (France) - Modifiable
- **Devise**: EUR - Modifiable
- **Méthodes de paiement**: Card, PayPal, Klarna, Alma
- **Redis TTL**: 20 heures
- **Polling interval**: 5 secondes

### 📦 Dépendances requises

```json
{
  "stripe": "^17.4.0",
  "redis": "^4.7.0",
  "next": "^14.1.0"
}
```

### 🔄 Workflow

```
Client → API Checkout → Stripe (session)
                     ↓
                  Redis (cache payload)
                     ↓
              Stripe Page Paiement
                     ↓
           Webhook (paiement complété)
                     ↓
         Redis (récupère payload) → Shopify (crée commande)
                     ↓
         Redis (stocke commande)
                     ↓
           API Session → Client (order_status_url)
```

### 🎓 Cas d'usage

✅ Personnaliser l'expérience de paiement
✅ Ajouter des méthodes de paiement non supportées par Shopify
✅ Gérer des flux de checkout complexes
✅ Intégrer Stripe avec votre boutique Shopify existante

---

## Prochaines versions (Roadmap)

### v1.1.0 (À venir)
- [ ] Support des adresses de livraison
- [ ] Gestion des frais de port
- [ ] Multi-devises
- [ ] Tests unitaires

### v1.2.0 (À venir)
- [ ] Support Stripe Elements custom
- [ ] Mode headless complet
- [ ] API GraphQL Shopify
- [ ] Performance optimizations

---

**Contribuez:** Les contributions sont les bienvenues! Ouvrez une issue ou PR.

