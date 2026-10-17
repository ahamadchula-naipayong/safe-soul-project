/**
 * Telegram Bot API Integration
 * Automatically creates unique one-time invite links for private supporters & founding member groups
 */

export interface CreateTelegramInviteParams {
  customerEmail: string;
  tier: 'supporter_tier_2' | 'founding_tier_3';
}

export async function createTelegramInviteLink({ customerEmail, tier }: CreateTelegramInviteParams) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId || botToken.startsWith('mock_')) {
    const mockInvite = `https://t.me/+SafeSoul_${tier === 'founding_tier_3' ? 'Founding100' : 'Supporter'}_${Date.now().toString(36)}`;
    console.log(`[TELEGRAM SIMULATION] Generated invite link for ${customerEmail}: ${mockInvite}`);
    return {
      success: true,
      simulated: true,
      inviteLink: mockInvite,
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        name: `Supporter: ${customerEmail}`,
        member_limit: 1, // Single-use invite link for safety
        creates_join_request: false,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return { success: false, error: data.description };
    }

    return {
      success: true,
      simulated: false,
      inviteLink: data.result.invite_link,
    };
  } catch (error) {
    console.error('Failed to create Telegram invite link:', error);
    return { success: false, error };
  }
}
