import type { TierType } from '@/types';

/**
 * Discord Bot API Integration
 * Assigns 2-tier content access roles (Free vs Member) plus the cosmetic gold
 * Founding 100 prestige role upon membership confirmation.
 */

export interface DiscordAssignRoleParams {
  discordUserId: string;
  tier: TierType;
}

function resolveRoleIdsForTier(tier: TierType): string[] {
  const freeRoleId = process.env.DISCORD_ROLE_FREE;
  const memberRoleId =
    process.env.DISCORD_ROLE_MEMBER || process.env.DISCORD_ROLE_TIER2_SUPPORTER;
  const foundingRoleId =
    process.env.DISCORD_ROLE_FOUNDING_100 || process.env.DISCORD_ROLE_TIER3_FOUNDING;

  if (tier === 'free_tier_1') {
    return freeRoleId ? [freeRoleId] : [];
  }
  if (tier === 'founding_tier_3') {
    return Array.from(new Set([memberRoleId, foundingRoleId].filter(Boolean) as string[]));
  }
  return memberRoleId ? [memberRoleId] : [];
}

export async function assignDiscordRole({ discordUserId, tier }: DiscordAssignRoleParams) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleIds = resolveRoleIdsForTier(tier);

  if (!botToken || !guildId || roleIds.length === 0 || botToken.startsWith('mock_')) {
    console.log(`[DISCORD SIMULATION] Assigned tier roles (${tier}) to Discord User ID: ${discordUserId}`);
    return {
      success: true,
      simulated: true,
      assignedRoleIds: roleIds,
      message: `Simulated Discord role assignment (${tier}) for user ${discordUserId}`,
    };
  }

  try {
    for (const roleId of roleIds) {
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
    }

    return { success: true, simulated: false, assignedRoleIds: roleIds };
  } catch (error) {
    console.error('Failed to assign Discord role:', error);
    return { success: false, error };
  }
}
