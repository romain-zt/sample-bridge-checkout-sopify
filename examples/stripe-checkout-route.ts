/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  stripe-checkout-route.ts - Shopify Bridge Checkout                  ║
 * ║                                                                       ║
 * ║  Description: Crée une session Stripe Checkout avec données panier  ║
 * ║                                                                       ║
 * ║  ⚠️ Ce code nécessite adaptation à votre contexte spécifique        ║
 * ║     (TVA, devise, méthodes de paiement, gift cards)                 ║
 * ║                                                                       ║
 * ║  🆘 Support: romain@zedtech.fr                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE API: Création de session Stripe Checkout
// ═══════════════════════════════════════════════════════════════════════════
// Cette route crée une session Stripe et stocke les données commande dans Redis
// pour traitement ultérieur après paiement réussi via webhook
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "redis";

// ═══ CONFIGURATION ═══
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const isDev = process.env?.NODE_ENV?.includes("dev");

// Redis client pour stockage temporaire des données de commande
const client = createClient({
  url: process.env.REDIS_URL,
});
client.on("error", (err) => console.error("Redis Client Error", err));

// Initialisation Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ═══ HELPERS CORS ═══
function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

// ═══ HELPERS SHOPIFY ═══

/**
 * Récupère les détails d'une carte cadeau Shopify
 * ⚠️ TODO: Adapter si vous n'utilisez pas les gift cards
 */
async function getGiftCardDetail(code: string) {
  try {
    const shopifyResponse = await fetch(
      `https://${process.env.SHOPIFY_DOMAIN}/admin/api/2023-01/gift_cards/search.json?query=${code}`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": ADMIN_API_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = await shopifyResponse.json();
    const giftCard = responseData?.gift_cards?.[0];

    return giftCard;
  } catch (e) {
    console.error("Erreur récupération gift card:", e);
  }
}

/**
 * Calcul du prix HT depuis le TTC (20% TVA France)
 * ⚠️ TODO: Adapter le taux de TVA selon votre pays
 */
const calculatePriceFromTTC = (ttcPrice: number) => {
  const originalPrice = +(ttcPrice / 1.2).toFixed(2);
  const taxAmount = +(ttcPrice - originalPrice).toFixed(2);
  return {
    originalPrice,
    taxAmount,
    ttcPrice
  };
};

/**
 * Crée le payload pour l'ordre Shopify
 * Structure: cart (panier Shopify), customer (infos client), discounts, etc.
 */
async function createOrderPayload(
  cart: any,
  customer: any,
  totalDiscounts: any,
  financial_status: string = "pending",
  discounts: any
) {
  // ─── Gift Card (optionnel) ───
  let giftCardDetail = null;
  if (cart.note) {
    giftCardDetail = await getGiftCardDetail(cart.note);
  }

  // ─── Remises du panier ───
  const cartDiscounts = cart.items?.reduce(
    (acc: any, cur: any) => [
      ...acc,
      ...(cur.discounts || [])?.filter(
        (discount: any) => !isNaN(+discount.amount) && +discount.amount > 0
      ),
    ],
    []
  );

  // ─── Calcul de la taxe totale ───
  const totalTaxableAmount = cart.items.reduce((total: number, item: any) => {
    if (item.taxable) total += item?.line_price > 0 ? item.line_price : 0;
    return total;
  }, 0);

  const totalTTC = +(totalTaxableAmount / 100).toFixed(2);
  const { taxAmount: totalTax } = calculatePriceFromTTC(totalTTC);

  // ─── Construction du payload Shopify ───
  const orderPayload = {
    order: {
      email: customer?.email || customer,
      contact_email: customer?.email || customer,
      send_receipt: true,
      send_fulfillment_receipt: true,
      note: cart.note,
      total_price: (cart.total_price / 100).toFixed(2),
      cart_token: cart.id || cart.token,
      token: cart.token,
      source_name: "web_bridge", // ⚠️ TODO: Adapter le nom de source
      payment_gateway_names: cart?.attributes?.giftCard
        ? ["gift_card"]
        : ["stripe"],

      // Informations fiscales (TVA France 20%)
      tax_lines: [{
        price: totalTax.toFixed(2),
        rate: 0.2, // ⚠️ TODO: Adapter selon votre taux de TVA
        title: "FR TVA",
        price_set: {
          shop_money: {
            amount: totalTax.toFixed(2),
            currency_code: "EUR"
          },
          presentment_money: {
            amount: totalTax.toFixed(2),
            currency_code: "EUR"
          }
        },
        channel_liable: false
      }],
      total_tax: totalTax.toFixed(2),
      total_tax_set: {
        shop_money: {
          amount: totalTax.toFixed(2),
          currency_code: "EUR"
        },
        presentment_money: {
          amount: totalTax.toFixed(2),
          currency_code: "EUR"
        }
      },
      taxes_included: true,
      currency: cart.currency || "EUR", // ⚠️ TODO: Adapter la devise
    
      // Transaction (montant sera mis à jour par le webhook)
      transactions: [
        {
          kind: "sale",
          status: "success",
          amount: cart?.attributes?.giftCard?.amount
            ? (cart?.attributes?.giftCard?.amount / 100).toFixed(2)
            : "0.00",
          gateway: cart?.attributes?.giftCard
            ? `gift_card`
            : "stripe",
          ...(cart?.attributes?.giftCard ? {
            gift_card_id: giftCardDetail?.id,
            gift_card_code: cart?.note,
            payment_details: {
              gift_card_id: giftCardDetail?.id,
              gift_card_code: cart?.note,
              gift_card_last_characters: giftCardDetail?.last_characters
            },
            giftCard: giftCardDetail,
            gift_card: giftCardDetail
          } : {})
        },
      ],

      // Articles du panier
      line_items: cart.items.map(({discounts, ...item}: any) => ({
        ...item,
        price:
          item?.final_price > 0 ? (item.final_price / 100).toFixed(2) : "0.00",
      })),

      // Client
      customer: {
        ...customer,
        contact_email: customer?.email,
        contactEmail: customer?.email,
        contact_phone: customer?.phone,
        contactPhone: customer?.phone,
        firstName: customer?.first_name,
        lastName: customer?.last_name,
      },
      
      financial_status,
      tags: ["Stripe Bridge", "v1"], // ⚠️ TODO: Personnaliser vos tags
      
      note_attributes: [
        {
          name: "BTA Token",
          value: cart.attributes["BTA Token"],
        },
      ],
      discount_codes: cartDiscounts,
    },
  };

  // ─── Ajout infos gift card aux attributs ───
  if (giftCardDetail) {
    orderPayload.order.note_attributes.push({
      name: "Gift Card",
      value: `**** **** **** ${giftCardDetail.last_characters}`,
    });
  }

  if (orderPayload.order.note) {
    orderPayload.order.note_attributes.push({
      name: "Gift Card Code",
      value: orderPayload.order.note
    });
  }

  return orderPayload;
}

// ═══ GESTION DES COUPONS STRIPE ═══

/**
 * Crée ou récupère un coupon Stripe
 * Les coupons sont réutilisés si même montant (économie d'API calls)
 */
async function createOrRetrieveCoupon(discountAmount: number) {
  const couponId = `SHOPIFY_${discountAmount}`;
  const couponName = `Réduction €${(discountAmount / 100).toFixed(2)}`; // ⚠️ TODO: Personnaliser le nom

  try {
    // Tente de récupérer le coupon existant
    const coupon = await stripe.coupons.retrieve(couponId);
    return couponId;
  } catch (error) {
    // Crée le coupon s'il n'existe pas
    await stripe.coupons.create({
      id: couponId,
      amount_off: discountAmount,
      currency: "eur", // ⚠️ TODO: Adapter la devise
      name: couponName,
    });
    return couponId;
  }
}

// ═══ ROUTE PRINCIPALE ═══

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, discount, payload, customer } = body;

    // ─── Normalisation numéro de téléphone (France) ───
    // ⚠️ TODO: Adapter selon votre pays
    customer.phone = customer.phone.startsWith('0') 
      ? `+33${customer.phone.substring(1)}` 
      : customer.phone;

    const { items, subtotal, tax, total, discounts, total_discounts } = payload;

    // ─── Création des line items Stripe ───
    const lineItems = items.map((item: any) => {
      const basePrice = item.original_price || item.price;

      return {
        price_data: {
          currency: "eur", // ⚠️ TODO: Adapter la devise
          product_data: {
            name: item.title,
            description: item.description,
            images: item.image ? [item.image] : [],
          },
          unit_amount: basePrice,
          tax_behavior: "inclusive", // ⚠️ TODO: 'inclusive' ou 'exclusive' selon votre config
        },
        quantity: item.quantity,
        tax_rates: item.tax_lines?.map((tax: any) => tax.rate) || [],
      };
    });

    // ─── Création du payload de commande Shopify ───
    const orderPayload = await createOrderPayload(
      cart,
      customer,
      total_discounts,
      "paid",
      discounts
    );

    // ─── Création de la session Stripe Checkout ───
    // 🆘 Erreur ici ? Vérifiez STRIPE_SECRET_KEY et line_items | romain@zedtech.fr
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal", "klarna", "alma"], // ⚠️ TODO: Choisir vos méthodes de paiement
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/checkout?${
        isDev ? "devmode=true&" : ""
      }success=true&session_id={CHECKOUT_SESSION_ID}`, // ⚠️ TODO: Adapter vos URLs de redirection
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/checkout?${
        isDev ? "devmode=true&" : ""
      }failed=true&session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customer.email,
      metadata: {
        subtotal: String(subtotal || 0),
        tax: String(tax || 0),
        total: String(total || 0),
        total_discounts: String(total_discounts || 0),
        discounts: discounts ? JSON.stringify(discounts) : "[]",
        discount,
      },
      // Applique le coupon si réduction
      ...(total_discounts &&
        total_discounts > 0 && {
          discounts: [
            { coupon: await createOrRetrieveCoupon(total_discounts) },
          ],
        }),
    });

    // ─── Stockage temporaire dans Redis ───
    // Le webhook récupérera ces données pour créer la commande Shopify
    try {
      if (!client.isOpen) await client.connect();
      await client.set(session.id, JSON.stringify(orderPayload), {
        EX: 72000, // Expire après 20h
      });
    } catch (e) {
      console.error("Erreur Redis:", e);
    }

    // ─── Réponse avec session ID et URL de paiement ───
    return corsResponse(
      NextResponse.json({ sessionId: session.id, url: session.url })
    );
  } catch (error) {
    console.error("Erreur création session checkout:", error);
    // Si cette erreur persiste, contactez: romain@zedtech.fr
    return corsResponse(
      NextResponse.json(
        { error: "Error creating checkout session" },
        { status: 500 }
      )
    );
  }
}

/**
 * 📚 DOCUMENTATION COMPLÈTE: /docs/QUICK_START.md
 * 🆘 SUPPORT: romain@zedtech.fr ou GitHub Issues
 */

