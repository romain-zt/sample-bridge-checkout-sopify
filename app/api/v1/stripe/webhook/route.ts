/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  stripe-webhook-route.ts - Shopify Bridge Checkout                   ║
 * ║                                                                       ║
 * ║  Description: Traite les webhooks Stripe et crée commandes Shopify  ║
 * ║                                                                       ║
 * ║  ⚠️ Ce code nécessite adaptation à votre contexte spécifique        ║
 * ║     (normalisation téléphone, gestion clients, méthodes paiement)    ║
 * ║                                                                       ║
 * ║  🆘 Support: romain@zedtech.fr                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK STRIPE: Traitement des paiements complétés
// ═══════════════════════════════════════════════════════════════════════════
// Ce webhook écoute les événements Stripe et crée la commande Shopify
// après un paiement réussi
// ═══════════════════════════════════════════════════════════════════════════

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';  
import { createClient } from 'redis';
import Stripe from 'stripe';  

// ═══ CONFIGURATION ═══
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY!);  

// Redis client
const client = createClient({
  url: process.env.REDIS_URL
});
client.on('error', err => console.error('Redis Client Error', err));

// ═══ VÉRIFICATION SIGNATURE WEBHOOK ═══

async function verifyStripeEvent(req: any) {  
  const body = await req.text();
  const headerList = headers();
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;  
  const sig = headerList.get('stripe-signature')!;  
  
  try {  
    const event = stripe.webhooks.constructEvent(body, sig, secret);  
    return event;  
  } catch (error) {
    // 🆘 Échec vérification signature ? Vérifiez STRIPE_WEBHOOK_SECRET | romain@zedtech.fr
    throw new Error('Webhook Error: Unable to verify Stripe signature.');  
  }  
}

// ═══ HELPERS SHOPIFY ═══

/**
 * Recherche un client Shopify par email ou téléphone
 */
async function searchCustomer(email: string, phone?: string) {
  try {
    // Recherche par téléphone en priorité
    if (phone) {
      const phoneSearchResponse = await fetch(
        `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/customers/search.json?query=${encodeURIComponent(`phone:${phone}`)}`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': ADMIN_API_KEY || "",
            'Content-Type': 'application/json',
          },
        }
      );

      const phoneData = await phoneSearchResponse.json();
      if (phoneData.customers?.length > 0) {
        return phoneData.customers[0];
      }
    }

    // Recherche par email
    const emailSearchResponse = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/customers/search.json?query=${encodeURIComponent(`email:${email}`)}`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': ADMIN_API_KEY || "",
          'Content-Type': 'application/json',
        },
      }
    );

    const emailData = await emailSearchResponse.json();
    if (emailData.customers?.length > 0) {
      return emailData.customers[0];
    }

    return null;
  } catch (error) {
    console.error('Erreur recherche client:', error);
    return null;
  }
}

/**
 * Crée une commande dans Shopify
 */
async function createOrder(payload: any) {
  try {
    let existingCustomer = null;
    
    try {
      // Normalise le téléphone (France: supprime le 0 initial)
      // ⚠️ TODO: Adapter selon votre pays
      if (payload?.order?.customer?.phone) {
        payload.order.customer.phone = payload.order.customer.phone.trim();
        if (payload.order.customer.phone.startsWith("0")) {
          payload.order.customer.phone = payload.order.customer.phone.substring(1);
        }
      }
      
      // Recherche client existant
      existingCustomer = await searchCustomer(
        payload.order.customer.email,
        payload.order.customer.phone
      );

      if (existingCustomer) {
        // Vérifie conflit de téléphone (déjà utilisé par un autre client)
        if (payload.order.customer.phone && 
            existingCustomer.phone !== payload.order.customer.phone) {
          // Supprime le téléphone du payload pour éviter l'erreur "phone already taken"
          delete payload.order.customer.phone;
          delete payload.order.customer.contact_phone;
          delete payload.order.customer.contactPhone;
        }
        
        // Utilise l'ID du client existant
        payload.order.customer.id = existingCustomer.id;
        
        // Garde le téléphone existant si non supprimé
        if (existingCustomer.phone && !payload.order.customer.phone) {
          payload.order.customer.phone = existingCustomer.phone;
          payload.order.customer.contact_phone = existingCustomer.phone;
          payload.order.customer.contactPhone = existingCustomer.phone;
        }
      }
    } catch(e) {
      console.error("Erreur gestion client:", e);
    }

    // Crée la commande Shopify
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ADMIN_API_KEY || "",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Échec création commande Shopify:');
      console.error('Status:', response.status);
      console.error('Erreur:', JSON.stringify(errorData, null, 2));
      // 🆘 Erreur Shopify API ? Vérifiez ADMIN_API_KEY et payload | romain@zedtech.fr
      throw new Error(`API Error: ${JSON.stringify(errorData, null, 2)}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Erreur création commande:', error.message);
    throw error;
  }
}

// ═══ ROUTE WEBHOOK ═══

export async function POST(request: Request) {  
  try {  
    // Vérifie la signature du webhook
    const event = await verifyStripeEvent(request);
  
    // Ignore les sessions expirées
    if (event.type === "checkout.session.expired") {
      return new NextResponse("Session expirée", { status: 200 });
    }
    
    // ─── Traite les paiements complétés ───
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session) {
        return new NextResponse("Session invalide", { status: 400 });
      }

      // ─── Récupère les données de commande depuis Redis ───
      if (!client.isOpen) await client.connect();

      let orderPayload: any = await client.get(session.id) || "{order: 'NOT PROVIDED'}";

      if (typeof orderPayload === "string") {
        orderPayload = JSON.parse(orderPayload);
      }

      // ─── Enrichit le payload avec les données de paiement Stripe ───
      let stripeTxKey = 0;

      // Ajoute ou met à jour la transaction Stripe
      if (
        session.amount_total &&
        orderPayload?.order?.transactions?.[stripeTxKey] &&
        orderPayload?.order?.transactions?.[stripeTxKey]?.gateway === "stripe"
      ) {
        orderPayload.order.transactions[stripeTxKey].amount = (
          session.amount_total / 100
        ).toFixed(2);
      } else if (
        session.amount_total &&
        orderPayload?.order?.transactions?.[stripeTxKey]?.gateway !== "stripe"
      ) {
        // Gift card en premier, ajoute Stripe en second
        stripeTxKey = 1;
        orderPayload.order.transactions.push({
          amount: (session.amount_total / 100).toFixed(2),
          gateway: "stripe",
          kind: "sale",
          status: "success",
        });
      }

      // Ajoute les détails de la transaction
      if (session.client_secret && orderPayload.order.transactions[stripeTxKey]) {
        orderPayload.order.transactions[stripeTxKey].clientSecret = session.client_secret;
      }

      // ─── Récupère les détails du payment intent ───
      if (session.payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
          { expand: ["payment_method"] }
        );

        orderPayload.order.transactions[stripeTxKey].authorizationCode = session.payment_intent;
        orderPayload.order.transactions[stripeTxKey].authorization = session.payment_intent;

        // Récupère la méthode de paiement
        const paymentMethod = await stripe.paymentMethods.retrieve(
          pi.payment_method as string
        );

        orderPayload.order.payment_gateway_names = 
          orderPayload.order.payment_gateway_names || [];

        if (paymentMethod) {
          const paymentDetails: any = {
            creditCardCompany: undefined,
            creditCardLastFourDigits: undefined,
            paymentMethodType: paymentMethod.type,
          };

          // Formate selon le type de paiement
          switch (paymentMethod.type) {
            case "card":
              paymentDetails.creditCardCompany = paymentMethod.card?.brand;
              paymentDetails.creditCardLastFourDigits = paymentMethod.card?.last4;
              orderPayload.order.transactions[stripeTxKey].gateway_name =
                orderPayload.order.transactions[stripeTxKey].gatewayDisplayName = 
                `Carte bancaire ${paymentMethod.card?.last4 || "****"}`;
              break;

            case "link":
              paymentDetails.email = paymentMethod.link?.email;
              orderPayload.order.transactions[stripeTxKey].gateway_name =
                orderPayload.order.transactions[stripeTxKey].gatewayDisplayName = 
                `Link ${paymentMethod.link?.email}`;
              break;

            case "klarna":
              orderPayload.order.transactions[stripeTxKey].gateway_name =
                orderPayload.order.transactions[stripeTxKey].gatewayDisplayName = "Klarna";
              break;

            case "paypal":
              orderPayload.order.transactions[stripeTxKey].gateway_name =
                orderPayload.order.transactions[stripeTxKey].gatewayDisplayName = "PayPal";
              break;

            default:
              orderPayload.order.transactions[stripeTxKey].gateway_name =
                orderPayload.order.transactions[stripeTxKey].gatewayDisplayName =
                  paymentMethod.type.charAt(0).toUpperCase() + paymentMethod.type.slice(1);
          }

          // Ajoute les détails de paiement
          orderPayload.order.transactions[stripeTxKey].payment_details = paymentDetails;
          orderPayload.order.transactions[stripeTxKey].payment_details.name =
            orderPayload.order.transactions[stripeTxKey].gateway_name;

          // Ajoute au tableau des gateways
          orderPayload.order.payment_gateway_names.push(
            orderPayload.order.transactions[stripeTxKey].gateway_name
          );

          // Ajoute aux attributs de note
          orderPayload.order.note_attributes = orderPayload.order.note_attributes || [];
          orderPayload.order.note_attributes.push({
            name: "Payment Method Display Name",
            value: orderPayload.order.transactions[stripeTxKey].gateway_name || "",
          });
          
          if (paymentMethod.type) {
            orderPayload.order.tags.push(paymentMethod.type);
          }
        }
      }

      // ─── Traite les codes de réduction ───
      if (orderPayload.order.discount_codes && orderPayload.order.discount_codes.length > 0) {
        const totalDiscountAmount = orderPayload.order.discount_codes.reduce(
          (sum: number, discount: any) => sum + discount.amount, 
          0
        );
        const discountAmountDecimal = (totalDiscountAmount / 100).toFixed(2);
        
        // Applique la réduction aux articles
        if (orderPayload.order.line_items && orderPayload.order.line_items.length > 0) {
          orderPayload.order.line_items.forEach((item: any) => {
            const itemProportion = item.final_line_price / 
              orderPayload.order.line_items.reduce((sum: number, li: any) => sum + li.final_line_price, 0);
            const itemDiscountAmount = Math.round(totalDiscountAmount * itemProportion);
            
            item.total_discount = itemDiscountAmount;
            item.discounted_price = itemDiscountAmount;
            item.line_level_total_discount = itemDiscountAmount;
            item.line_level_discount_allocations = [{
              amount: (itemDiscountAmount / 100).toFixed(2),
              discount_application_index: 0
            }];
          });
        }
        
        // Ajoute les applications de réduction
        orderPayload.order.discount_applications = orderPayload.order.discount_codes.map(
          (discount: any) => ({
            type: "discount_code",
            value: (discount.amount / 100).toFixed(2),
            value_type: "fixed_amount",
            allocation_method: "across",
            target_selection: "all",
            target_type: "line_item",
            code: discount.title || discount.code,
            description: discount.title || discount.code
          })
        );
        
        // Sauvegarde dans les attributs
        orderPayload.order.discount_codes?.forEach((discount: any) => {
          orderPayload.order.note_attributes.push({
            name: "Discount Code",
            value: `${discount?.title || discount?.code} (-${(discount.amount / 100).toFixed(2)}€)`
          });
        });
        
        delete orderPayload.order.discount_codes;
        orderPayload.order.total_discounts = discountAmountDecimal;
        
        // Supprime les transactions à 0€
        if (orderPayload.order.total_price === "0.00" && orderPayload.order.transactions) {
          orderPayload.order.transactions = orderPayload.order.transactions.filter(
            (tx: any) => parseFloat(tx.amount) > 0
          );
        }
      }

      // ─── Crée la commande Shopify ───
      const order = await createOrder(orderPayload);

      // ─── Sauvegarde la commande créée dans Redis ───
      try {
        await client.set(session.id || "", JSON.stringify(order), {
          EX: 72000, // 20h
        });
      } catch {
        console.error("Impossible de sauvegarder la commande dans Redis");
      }

      return new NextResponse("Webhook traité avec succès", { status: 200 });
    }  
  
    return new NextResponse('Type événement non géré', { status: 200 });
  } catch (error) {  
    console.error('Erreur traitement webhook:', error);
    // Si cette erreur persiste, contactez: romain@zedtech.fr
    return new NextResponse('Erreur webhook', { status: 500 });
  }  
}

/**
 * 📚 DOCUMENTATION COMPLÈTE: /docs/QUICK_START.md
 * 🆘 SUPPORT: romain@zedtech.fr ou GitHub Issues
 */

