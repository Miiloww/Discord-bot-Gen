import { Client } from 'discord.js';
import { botState } from '../state';

export async function checkPresences(client: Client): Promise<void> {
  const config = botState.getConfig();
  if (!config.statusText || !config.requiredRoleId) return;

  const targetGuildId = process.env.GUILD_ID;
  if (!targetGuildId) return;

  const targetGuild = client.guilds.cache.get(targetGuildId);
  if (!targetGuild) return;

  for (const [, guild] of [targetGuild].entries()) {
    try {
      const members = await guild.members.fetch();
      
      const roleExists = guild.roles.cache.has(config.requiredRoleId);
      if (!roleExists) {
        return;
      }

      for (const [, member] of members) {
        if (member.user.bot) continue;

        const presence = guild.presences.cache.get(member.id);
        if (!presence) continue;

        const activities = presence.activities;
        const hasRequiredStatus = activities.some(activity => 
          activity.state?.includes(config.statusText) || 
          activity.name?.includes(config.statusText)
        );

        const hasRole = member.roles.cache.has(config.requiredRoleId);

        if (hasRequiredStatus && !hasRole) {
          try {
            await member.roles.add(config.requiredRoleId);
            console.log(`Role ajoute a ${member.user.tag}`);
          } catch (error) {
            console.error('Erreur ajout role:', error);
          }
        } else if (!hasRequiredStatus && hasRole) {
          try {
            await member.roles.remove(config.requiredRoleId);
            console.log(`Role retire de ${member.user.tag}`);
          } catch (error) {
            console.error('Erreur retrait role:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur verification presences:', error);
    }
  }
}
