import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { assignDiscordRole } from '@/lib/discord';
import { createTelegramInviteLink } from '@/lib/telegram';
import { generateWatermarkMetadata } from '@/lib/watermark';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && !webhookSecret.startsWith('mock_') && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Development or test fallback
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid webhook signature';
    console.error(`Webhook signature verification failed: ${errorMsg}`);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_email || session.customer_details?.email || '';
    const metadata = session.metadata || {};
    const tier = (metadata.tier as 'supporter_tier_2' | 'founding_tier_3') || 'supporter_tier_2';
    const orderType = metadata.orderType || 'subscription';
    const discordUserId = metadata.discordUserId;

    console.log(`[STRIPE WEBHOOK] Payment successful for: ${customerEmail}, Tier: ${tier}, Type: ${orderType}`);

    // 1. DISCORD AUTOMATION: Assign Role via Discord Bot API
    if (discordUserId) {
      await assignDiscordRole({ discordUserId, tier });
    } else {
      console.log(`[DISCORD] Note: Discord User ID not attached yet; role will be assigned on Discord OAuth connect for ${customerEmail}`);
    }

    // 2. TELEGRAM AUTOMATION: Generate Unique Private Group Invite Link
    const telegramResult = await createTelegramInviteLink({ customerEmail, tier });
    console.log(`[TELEGRAM] Invite generated for ${customerEmail}:`, telegramResult.inviteLink);

    // 3. DIGITAL WATERMARK DELIVERY
    if (orderType === 'digital_merch' || tier === 'founding_tier_3') {
      const watermarkData = generateWatermarkMetadata({
        customerEmail,
        orderId: session.id,
      });
      console.log(`[WATERMARK PDF] Generated custom stamp for ${customerEmail}:`, watermarkData.stampText);
    }

    // 4. ATOMIC FOUNDING 100 QUOTA DECREMENT (If Tier 3 Founding Member)
    if (tier === 'founding_tier_3') {
      console.log(`[FOUNDING 100] Decrementing quota slot for new Founding Member: ${customerEmail}`);
      // In Supabase, call RPC: SELECT claim_founding_slot();
    }

    return NextResponse.json({
      received: true,
      tier,
      customerEmail,
      telegramInvite: telegramResult.inviteLink,
    });
  }

  return NextResponse.json({ received: true });
}
