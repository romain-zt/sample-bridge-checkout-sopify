# 🎨 Templates Shopify Liquid

Ce dossier contient des exemples de templates Liquid pour intégrer le checkout Stripe dans votre thème Shopify.

## ⚠️ Important

Ces fichiers sont fournis **à titre d'exemple** et nécessitent une **personnalisation importante** pour s'adapter à votre cas d'usage. Ils contiennent de la logique métier spécifique (gift cards, programme fidélité, etc.) qui doit être adaptée.

## 📁 Fichiers

### `stripe-bridge.liquid` (Snippet)

**Rôle:** Classe JavaScript qui gère l'interaction avec votre API Stripe.

**Fonctionnalités:**
- Validation des champs client (email, téléphone, nom)
- Création de session Stripe Checkout
- Polling après paiement pour récupérer l'order_status_url
- Gestion des remises et gift cards (optionnel)
- États de chargement des boutons

**Installation:**
1. Copiez dans `snippets/stripe-bridge.liquid`
2. Modifiez l'`API_URL` (ligne ~30) avec l'URL de votre API Next.js
3. Adaptez les sélecteurs CSS à votre thème
4. Incluez avec `{% render 'stripe-bridge' %}` dans votre page checkout

**Personnalisations requises:**

```liquid
// ⚠️ TODO: Remplacez par l'URL de votre API
const API_URL = 'https://votre-domaine.com/api';
```

- **Sélecteurs CSS**: `.checkout-cta`, `.product-list`, `.discount-container`, etc.
- **Messages**: Adaptez les textes de validation et erreurs
- **Gift cards**: Supprimez si non utilisé

---

### `page.checkout-v2.liquid` (Template)

**Rôle:** Page de checkout personnalisée.

**Structure:**
- Formulaire client (email, téléphone, nom, prénom)
- Liste des produits du panier
- Section remises/gift cards
- Récapitulatif et bouton de paiement

**Installation:**
1. Créez une page Shopify "Checkout" ou "Paiement"
2. Dans le thème, créez `templates/page.checkout-v2.liquid`
3. Assignez ce template à la page créée
4. Créez le CSS associé (`assets/checkout-v2.css`)

**Personnalisations requises:**

- **CSS**: Créez le fichier `checkout-v2.css` avec vos styles
- **Snippets**: Créez ou adaptez:
  - `checkout-product-list-v2` (liste des produits)
  - `checkout-discount-v2` (formulaire code promo)
- **Textes**: Traduisez labels, placeholders, messages
- **Hero section**: Personnalisez ou supprimez (ligne ~58)
- **Paiement en 3x**: Adaptez ou supprimez (ligne ~270)

**Dépendances:**

```liquid
{% render 'checkout-product-list-v2' %}
{% render 'checkout-discount-v2' %}
{% render 'stripe-bridge' %}
```

---

### `framework--cart.liquid` (Snippet/Section)

**Rôle:** Template du drawer cart / page panier.

**Fonctionnalité principale:**
- Redirige automatiquement `/cart` → `/paiement`
- Bouton "Finaliser" qui redirige vers votre checkout custom

**Installation:**
1. Remplacez votre `snippets/framework--cart.liquid` existant
2. Ou adaptez votre cart existant avec les redirections

**Personnalisations requises:**

```liquid
// Ligne ~25 & ~58: Adaptez le chemin de votre page checkout
window.location.href = "/paiement";
```

- **Metafields**: Adaptez `item.product.metafields.custom.*` selon vos besoins
- **Traductions**: Modifiez selon votre langue
- **Bouton checkout**: Texte et lien (ligne ~414)

---

## 🚀 Installation complète

### 1. Créer la page checkout

Dans Shopify Admin:
1. **Pages** → **Add page**
2. Titre: "Paiement" ou "Checkout"
3. URL: `/paiement` (ou `/checkout`)
4. Template: `page.checkout-v2`

### 2. Installer les fichiers

```bash
# Dans votre thème Shopify
snippets/
  └── stripe-bridge.liquid          # Copiez depuis /examples/shopify/

templates/
  └── page.checkout-v2.liquid        # Copiez depuis /examples/shopify/

assets/
  └── checkout-v2.css                # ⚠️ À créer selon votre design
```

### 3. Créer les snippets manquants

Vous devez créer (ou adapter vos snippets existants):

**`snippets/checkout-product-list-v2.liquid`**
```liquid
<div class="product-list">
  {% for item in cart.items %}
    <div class="product-item" data-key="{{ item.key }}">
      {%- comment -%} Affichez: image, titre, prix, quantité {%- endcomment -%}
    </div>
  {% endfor %}
</div>
```

**`snippets/checkout-discount-v2.liquid`**
```liquid
<div class="discount-container">
  <form class="discount-form">
    <input type="text" class="discount-input" placeholder="Code promo" />
    <button type="submit">Appliquer</button>
  </form>
  <div class="discount-error-message"></div>
  {%- comment -%} Afficher les remises appliquées {%- endcomment -%}
</div>
```

### 4. Styliser

Créez `assets/checkout-v2.css` avec vos styles. Classes principales:

```css
/* Conteneur principal */
.checkout-container { }

/* Formulaire client */
.customer-infos-section { }
.customer-info-grid { }
.info-field { }
.info-input { }
.info-input.error { }
.validation-message { }

/* Produits */
.product-list { }
.product-item { }

/* Remises */
.discount-container { }
.discount-form { }
.discount-error-message { }

/* Totaux */
.subtotal-container { }
.checkout-cta-wrapper { }
.checkout-cta { }
```

## 🔧 Personnalisation avancée

### Désactiver les gift cards

Si vous n'utilisez pas les gift cards Shopify:

**Dans `stripe-bridge.liquid`:**
```javascript
// Supprimez ou commentez la section gift cards
async applyDiscount(code) {
  // Supprimez le bloc isGiftCard
  // Gardez uniquement le traitement des codes promo
}
```

**Dans `page.checkout-v2.liquid`:**
```liquid
{%- comment -%}
Supprimez le bloc gift card (lignes ~230-245)
{%- endcomment -%}
```

### Ajouter des champs personnalisés

**Dans `page.checkout-v2.liquid`:**
```liquid
<div class="info-field">
  <label for="customerCompany">Entreprise</label>
  <input 
    type="text" 
    id="customerCompany" 
    name="company"
    class="info-input"
  >
</div>
```

**Dans `stripe-bridge.liquid`:**
```javascript
// Ajoutez la validation
fields: {
  // ... champs existants
  company: {
    id: 'customerCompany',
    validator: this.validateName,
    message: 'L\'entreprise est requise'
  }
}

// Incluez dans le payload
const customer = {
  // ... champs existants
  company: document.getElementById('customerCompany').value,
};
```

### Personnaliser les messages

Recherchez tous les `// ⚠️ TODO:` dans les fichiers et adaptez selon votre langue/marque.

## 🐛 Dépannage

### Le bouton ne fait rien

Vérifiez:
1. `API_URL` est correcte dans `stripe-bridge.liquid`
2. Console browser pour les erreurs JavaScript
3. Les sélecteurs CSS correspondent à votre HTML

### Redirect en boucle

Vérifiez que:
1. La page `/paiement` existe et utilise le template `page.checkout-v2`
2. Le snippet `stripe-bridge` est bien inclus

### Style cassé

Créez `checkout-v2.css` avec vos styles ou adaptez votre CSS existant.

## 📚 Ressources

- [Liquid de Shopify](https://shopify.dev/docs/api/liquid)
- [Templates Shopify](https://shopify.dev/docs/themes/architecture/templates)
- [Cart API Ajax](https://shopify.dev/docs/api/ajax/reference/cart)

---

**Note:** Ces templates sont basés sur une implémentation réelle mais nécessitent une adaptation à votre thème. Utilisez-les comme point de départ, pas comme code production-ready.

