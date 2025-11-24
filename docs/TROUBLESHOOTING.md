# 🔧 Troubleshooting - Résolution de problèmes

Guide des 5 problèmes les plus courants et leurs solutions.

---

## 1️⃣ "PaymentIntent creation failed"

### 🔍 Cause probable

Votre clé API Stripe est invalide, manquante, ou n'a pas les permissions nécessaires.

### ✅ Solution étape par étape

**Étape 1 : Vérifiez votre `.env.local`**

```bash
# Vérifiez que la variable existe
cat .env.local | grep STRIPE_SECRET_KEY
```

La clé doit commencer par :
- `sk_test_` (mode test)
- `sk_live_` (mode production)

❌ **PAS** `pk_` (clé publique) ou `rk_` (clé restricted)

**Étape 2 : Récupérez une nouvelle clé**

1. Allez sur [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Copiez la **Secret key** (cliquez sur "Reveal test key")
3. Remplacez dans `.env.local` :
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Étape 3 : Redémarrez votre serveur**

```bash
# Arrêtez le serveur (Ctrl+C)
# Relancez
npm run dev
```

**Étape 4 : Testez à nouveau**

```bash
curl -X POST http://localhost:3000/api/v1/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"cart": {...}, "customer": {...}}'
```

### 🆘 Toujours bloqué ?

✉️ Contactez [romain@zedtech.fr](mailto:romain@zedtech.fr) avec :
- Le début de votre clé Stripe (ex: `sk_test_51Abc...`)
- Le message d'erreur complet

---

## 2️⃣ "Checkout custom ne s'affiche pas"

### 🔍 Cause probable

Problème d'intégration frontend ou CORS bloquant les requêtes cross-origin.

### ✅ Solution étape par étape

**Étape 1 : Vérifiez que l'API répond**

```bash
curl -X OPTIONS http://localhost:3000/api/v1/stripe/checkout
# Doit retourner un 200 avec headers CORS
```

**Étape 2 : Vérifiez les headers CORS dans la réponse**

Ouvrez la console de votre navigateur (F12) → Onglet **Network** → Cliquez sur la requête `/stripe/checkout`

Vérifiez la présence de :
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Étape 3 : Si les headers manquent, vérifiez le code**

Dans `app/api/v1/stripe/checkout/route.ts`, la fonction `corsResponse()` doit être appelée :

```typescript
export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

export async function POST(req: NextRequest) {
  // ...
  return corsResponse(NextResponse.json({ sessionId, url }));
}
```

**Étape 4 : Vérifiez l'URL de l'API**

Assurez-vous que votre frontend appelle la bonne URL :

```javascript
// ❌ Mauvais
fetch('localhost:3000/api/v1/stripe/checkout', { ... })

// ✅ Correct
fetch('http://localhost:3000/api/v1/stripe/checkout', { ... })
// ou en production
fetch('https://votre-domaine.com/api/v1/stripe/checkout', { ... })
```

**Étape 5 : Testez avec un fichier HTML simple**

Créez `test.html` :

```html
<!DOCTYPE html>
<html>
<body>
  <button onclick="testCheckout()">Test Checkout</button>
  <script>
    async function testCheckout() {
      const response = await fetch('http://localhost:3000/api/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: {
            id: 'test',
            token: 'test',
            total_price: 9900,
            currency: 'EUR',
            items: [{
              title: 'Test',
              quantity: 1,
              price: 9900,
              final_price: 9900,
              taxable: true,
              line_price: 9900
            }]
          },
          customer: {
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'Test',
            phone: '0612345678'
          },
          payload: {
            items: [],
            subtotal: 9900,
            tax: 1650,
            total: 9900,
            total_discounts: 0
          }
        })
      });
      const data = await response.json();
      console.log(data);
      if (data.url) window.location.href = data.url;
    }
  </script>
</body>
</html>
```

Ouvrez `test.html` dans votre navigateur et cliquez sur le bouton.

### 🆘 Toujours bloqué ?

✉️ Contactez [romain@zedtech.fr](mailto:romain@zedtech.fr) avec :
- Une capture d'écran de l'onglet Network (F12)
- Le message d'erreur dans la console

---

## 3️⃣ "Localhost API not reachable"

### 🔍 Cause probable

Votre API Next.js n'est pas démarrée, ou le port est déjà utilisé par un autre service.

### ✅ Solution étape par étape

**Étape 1 : Vérifiez que le serveur est lancé**

```bash
# Lancez le serveur
npm run dev

# Vous devriez voir :
# ✓ Ready in X ms
# ○ Local:   http://localhost:3000
```

**Étape 2 : Testez l'accès direct**

Ouvrez votre navigateur : `http://localhost:3000`

Si ça ne charge pas → le serveur n'est pas démarré.

**Étape 3 : Vérifiez le port**

Si le port 3000 est déjà utilisé :

```bash
# Trouvez le processus qui utilise le port 3000
lsof -ti:3000

# Tuez le processus (remplacez PID par le numéro retourné)
kill -9 PID

# Ou changez le port dans package.json
# "dev": "next dev -p 3001"
```

**Étape 4 : Vérifiez les routes API**

```bash
# Listez les fichiers
ls -la app/api/v1/stripe/checkout/
# Doit afficher : route.ts

ls -la app/api/v1/stripe/webhook/
# Doit afficher : route.ts
```

Si les fichiers n'existent pas → recopiez-les depuis `examples/`

**Étape 5 : Vérifiez les logs du serveur**

Dans le terminal où tourne `npm run dev`, vérifiez s'il y a des erreurs :

```
Error: Cannot find module 'stripe'
→ Solution : npm install stripe
```

### 🆘 Toujours bloqué ?

✉️ Contactez [romain@zedtech.fr](mailto:romain@zedtech.fr) avec :
- Les logs complets du terminal
- La version de Node.js (`node -v`)

---

## 4️⃣ "CORS error"

### 🔍 Cause probable

Les headers CORS ne sont pas correctement configurés dans les routes API.

### ✅ Solution étape par étape

**Étape 1 : Vérifiez la fonction corsResponse()**

Dans **tous** vos fichiers de routes (`checkout/route.ts`, `webhook/route.ts`, etc.), vérifiez la présence de :

```typescript
function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
```

**Étape 2 : Ajoutez le handler OPTIONS**

Chaque route doit avoir un handler `OPTIONS` :

```typescript
export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}
```

**Étape 3 : Wrappez toutes les réponses**

```typescript
// ❌ Mauvais
return NextResponse.json({ error: "Error" }, { status: 400 });

// ✅ Correct
return corsResponse(
  NextResponse.json({ error: "Error" }, { status: 400 })
);
```

**Étape 4 : Testez avec cURL**

```bash
# Test preflight
curl -X OPTIONS http://localhost:3000/api/v1/stripe/checkout \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Vérifiez la présence des headers `Access-Control-*` dans la réponse.

**Étape 5 : Si vous utilisez un domaine spécifique**

Remplacez `"*"` par votre domaine :

```typescript
response.headers.set(
  "Access-Control-Allow-Origin", 
  "https://votre-boutique.myshopify.com"
);
```

### 🆘 Toujours bloqué ?

✉️ Contactez [romain@zedtech.fr](mailto:romain@zedtech.fr) avec :
- Le message d'erreur CORS complet
- L'origine de votre requête (domaine)

---

## 5️⃣ "Stripe webhook not working"

### 🔍 Cause probable

Le webhook n'est pas configuré ou le secret de signature est incorrect.

### ✅ Solution étape par étape

**Étape 1 : Vérifiez le secret webhook**

Dans `.env.local` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
```

Le secret doit commencer par `whsec_`

**Étape 2 : En développement local - Utilisez Stripe CLI**

```bash
# Installez Stripe CLI
brew install stripe/stripe-cli/stripe

# Connectez-vous
stripe login

# Écoutez les webhooks
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
```

La commande affiche :
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copiez ce secret dans `.env.local` et redémarrez le serveur.

**Étape 3 : Testez le webhook manuellement**

Dans un autre terminal :

```bash
# Déclenchez un événement test
stripe trigger checkout.session.completed
```

Vérifiez les logs dans le terminal où tourne `stripe listen`.

**Étape 4 : En production - Configurez le webhook**

1. Allez sur [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez **Add endpoint**
3. URL : `https://votre-domaine.com/api/v1/stripe/webhook`
4. Sélectionnez l'événement : `checkout.session.completed`
5. Copiez le **Signing secret**
6. Ajoutez-le dans vos variables d'environnement Vercel

**Étape 5 : Vérifiez les logs Stripe**

Dans [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) :
- Cliquez sur votre endpoint
- Onglet **Logs**
- Vérifiez les tentatives et les erreurs éventuelles

Erreurs courantes :
- ❌ 404 → Route webhook n'existe pas
- ❌ 401 → Signature invalide (mauvais secret)
- ❌ 500 → Erreur dans votre code (vérifiez les logs de votre serveur)

**Étape 6 : Testez la signature**

Dans `app/api/v1/stripe/webhook/route.ts`, ajoutez temporairement :

```typescript
export async function POST(req: NextRequest) {
  console.log("🔔 Webhook received");
  
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  
  console.log("Signature:", sig);
  console.log("Body length:", body.length);
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Signature valid, event:", event.type);
    // ...
  } catch (err) {
    console.error("❌ Signature invalid:", err.message);
    // ...
  }
}
```

### 🆘 Toujours bloqué ?

✉️ Contactez [romain@zedtech.fr](mailto:romain@zedtech.fr) avec :
- Les logs du webhook Stripe (Dashboard → Webhooks → Logs)
- Les logs de votre serveur
- La méthode de déploiement (local, Vercel, etc.)

---

## 🧪 Mode Debug Avancé

Si aucune des solutions ci-dessus ne fonctionne, activez le mode debug complet :

### Dans `stripe-checkout-route.ts`

```typescript
export async function POST(req: NextRequest) {
  console.log("=== DEBUG CHECKOUT ===");
  console.log("Body:", await req.json());
  console.log("Env vars check:", {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    redis: !!process.env.REDIS_URL,
    shopify: !!process.env.ADMIN_API_KEY,
  });
  // ... reste du code
}
```

### Dans `stripe-webhook-route.ts`

```typescript
export async function POST(req: NextRequest) {
  console.log("=== DEBUG WEBHOOK ===");
  const body = await req.text();
  console.log("Body length:", body.length);
  console.log("Signature:", req.headers.get("stripe-signature"));
  // ... reste du code
}
```

### Vérifiez les logs

```bash
# Relancez le serveur avec les logs visibles
npm run dev

# Les logs s'affichent dans le terminal
```

---

## 📚 Ressources Utiles

- [Stripe API Errors](https://stripe.com/docs/api/errors) - Liste complète des erreurs Stripe
- [Tester les webhooks Stripe](https://stripe.com/docs/webhooks/test) - Guide officiel
- [Cartes de test Stripe](https://stripe.com/docs/testing) - Toutes les cartes de test
- [Shopify API Status](https://www.shopifystatus.com/) - Statut des services Shopify

---

## ✉️ Support

**Toujours bloqué après avoir tout essayé ?**

📧 Écrivez à [romain@zedtech.fr](mailto:romain@zedtech.fr) avec :
1. Le problème rencontré
2. Les étapes déjà tentées
3. Les logs d'erreur complets
4. Votre environnement (local, Vercel, etc.)

Ou ouvrez une [issue GitHub](https://github.com/romain-zt/sample-bridge-checkout-sopify/issues) avec le tag `help wanted`.

---

**Retour au guide :** [Quick Start](./QUICK_START.md) | [README](../README.md)
