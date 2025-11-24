/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  session-order-route.ts - Shopify Bridge Checkout                    ║
 * ║                                                                       ║
 * ║  Description: Récupère l'URL de statut de commande après paiement   ║
 * ║                                                                       ║
 * ║  ⚠️ Ce code nécessite adaptation à votre contexte spécifique        ║
 * ║     (configuration Redis, gestion des erreurs)                       ║
 * ║                                                                       ║
 * ║  🆘 Support: romain@zedtech.fr                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE API: Récupération du statut de commande
// ═══════════════════════════════════════════════════════════════════════════
// Cette route permet de récupérer l'URL de statut de commande Shopify
// après un paiement réussi en utilisant le session_id Stripe
// ═══════════════════════════════════════════════════════════════════════════
// Emplacement: app/api/v1/session/[sessionId]/order/route.ts
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';  
import { createClient } from 'redis';  

// ═══ CONFIGURATION REDIS ═══
const client = createClient({  
  url: process.env.REDIS_URL,  
});  

client.on('error', (err) => console.error('Redis Client Error', err));

// ═══ HELPER CORS ═══
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
  
export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

// ═══ ROUTE GET ═══

/**
 * Récupère l'URL de statut de commande depuis Redis
 * @param sessionId - ID de la session Stripe Checkout
 * @returns {order_status_url: string} - URL de la page de statut Shopify
 */
export async function GET(
  request: Request, 
  { params }: { params: { sessionId: string } }
) {  
  const { sessionId } = params;  

  // Vérifie que le session_id est fourni
  if (!sessionId) {
    return corsResponse(NextResponse.json({
      message: "No session_id provided"
    }, { status: 200 }));  
  }  

  try {  
    // ─── Connexion à Redis ───
    // 🆘 Si vous bloquez ici: vérifiez REDIS_URL dans .env | romain@zedtech.fr
    if (!client.isOpen) {  
      await client.connect();  
    }  

    // ─── Récupère le payload de commande depuis Redis ───
    const orderPayload = await client.get(sessionId);  

    if (!orderPayload) {
      return corsResponse(NextResponse.json({
        message: "session_id provided could not be found"
      }, { status: 200 }));  
    }  

    // ─── Parse et extrait l'URL de statut ───
    const parsedOrderPayload = JSON.parse(orderPayload);  
    const orderId = parsedOrderPayload?.order?.id;

    if (!orderId) {  
      return corsResponse(NextResponse.json({
        message: "session_id provided is expired or has been deleted"
      }, { status: 200 }));  
    }

    // ─── Retourne l'URL de statut de commande ───
    return corsResponse(
      NextResponse.json({
        order_status_url: parsedOrderPayload?.order?.order_status_url
      })
    );
  } catch (error: any) {  
    console.error('Erreur récupération commande depuis Redis:', error.message);
    // Si cette erreur persiste, contactez: romain@zedtech.fr
    return corsResponse(NextResponse.json({
      message: "Internal server error"
    }, { status: 500 }));
  }  
}

/**
 * 📚 DOCUMENTATION COMPLÈTE: /docs/QUICK_START.md
 * 🆘 SUPPORT: romain@zedtech.fr ou GitHub Issues
 */

