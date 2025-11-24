// lib/shopify.ts
// Helpers pour interagir avec l'API Shopify Admin

const SHOPIFY_ACCESS_TOKEN = process.env.ADMIN_API_KEY!;
const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_DOMAIN!;

/**
 * Récupère une commande Shopify par son ID
 */
export async function fetchOrderFromShopify(
  orderId: string
): Promise<any | null> {
  try {
    const response = await fetch(
      `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-10/orders/${orderId}.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error("Erreur récupération commande Shopify:", error);
    throw error;
  }
}

/**
 * Recherche un client Shopify par email ou téléphone
 */
export async function searchCustomer(email: string, phone?: string) {
  try {
    // Recherche par téléphone en priorité
    if (phone) {
      const phoneSearchResponse = await fetch(
        `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-10/customers/search.json?query=${encodeURIComponent(`phone:${phone}`)}`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
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
      `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-10/customers/search.json?query=${encodeURIComponent(`email:${email}`)}`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
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
export async function createShopifyOrder(payload: any) {
  try {
    const response = await fetch(
      `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
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
      throw new Error(`API Error: ${JSON.stringify(errorData, null, 2)}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Erreur création commande:', error.message);
    throw error;
  }
}

