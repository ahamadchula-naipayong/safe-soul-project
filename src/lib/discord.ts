/**
 * Discord Bot API Integration
 * Automatically assigns roles to supporters and founding members upon Stripe payment confirmation
 */

export interface DiscordAssignRoleParams {
  discordUserId: string;
  tier: 'supporter_tier_2' | 'founding_tier_3';
}

export async function assignDiscordRole({ discordUserId, tier }: DiscordAssignRoleParams) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  const roleId =
    tier === 'founding_tier_3'
      ? process.env.DISCORD_ROLE_TIER3_FOUNDING
      : process.env.DISCORD_ROLE_TIER2_SUPPORTER;

  if (!botToken || !guildId || !roleId || botToken.startsWith('mock_')) {
    console.log(`[DISCORD SIMULATION] Assigned tier role (${tier}) to Discord User ID: ${discordUserId}`);
    return {
      success: true,
      simulated: true,
      message: `Simulated Discord role assignment (${tier}) for user ${discordUserId}`,
    };
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Discord API error (${response.status}):`, errorText);
      return { success: false, error: errorText };
    }

    return { success: true, simulated: false };
  } catch (error) {
    console.error('Failed to assign Discord role:', error);
    return { success: false, error };
  }
}
