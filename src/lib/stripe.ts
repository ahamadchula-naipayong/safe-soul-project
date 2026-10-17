import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'mock_sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
  appInfo: {
    name: 'Safe Soul Project',
    version: '1.0.0',
  },
});

export interface CreateCheckoutSessionParams {
  userId?: string;
  customerEmail: string;
  customerName?: string;
  tier?: 'supporter_tier_2' | 'founding_tier_3';
  priceId?: string;
  orderType: 'subscription' | 'digital_merch' | 'physical_merch';
  items?: Array<{
    title: string;
    description?: string;
    amountThb: number;
    quantity: number;
    imageUrl?: string;
  }>;
  shippingAddress?: {
    recipientName: string;
    phone: string;
    addressLine: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  // If mock mode or keys missing, return mock session URL for testing
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('mock_')) {
    return {
      id: `cs_test_mock_${Date.now()}`,
      url: `${params.successUrl}?session_id=cs_test_mock_${Date.now()}&mock=true`,
    };
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items
    ? params.items.map((item) => ({
        price_data: {
          currency: 'thb',
          product_data: {
            name: item.title,
            description: item.description,
            images: item.imageUrl ? [item.imageUrl] : undefined,
          },
          unit_amount: Math.round(item.amountThb * 100), // Stripe uses Satang for THB
        },
        quantity: item.quantity,
      }))
    : params.priceId
    ? [{ price: params.priceId, quantity: 1 }]
    : [];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'promptpay'],
    mode: params.orderType === 'subscription' ? 'subscription' : 'payment',
    customer_email: params.customerEmail,
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId || '',
      orderType: params.orderType,
      tier: params.tier || '',
      shippingAddress: params.shippingAddress ? JSON.stringify(params.shippingAddress) : '',
    },
  });

  return session;
}
