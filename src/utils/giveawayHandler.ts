import { Client, Guild, EmbedBuilder } from 'discord.js';
import { botState } from '../state';
import { GiveawayHistory, GiveawayWinner } from '../types';

interface GiveawayResult {
  success: boolean;
  winnersCount: number;
  accountsSent: number;
  error?: string;
}

export async function executeGiveaway(client: Client, guild: Guild): Promise<GiveawayResult> {
  const giveawayConfig = botState.getGiveawayConfig();

  if (!giveawayConfig.enabled) {
    return {
      success: false,
      winnersCount: 0,
      accountsSent: 0,
      error: 'Les giveaways ne sont pas actives'
    };
  }

  if (giveawayConfig.serviceIds.length === 0) {
    return {
      success: false,
      winnersCount: 0,
      accountsSent: 0,
      error: 'Aucun service selectionne pour le giveaway'
    };
  }

  const topUsers = botState.getTopUsers(giveawayConfig.minMessages, giveawayConfig.numberOfWinners);

  if (topUsers.length === 0) {
    return {
      success: false,
      winnersCount: 0,
      accountsSent: 0,
      error: `Aucun utilisateur avec au moins ${giveawayConfig.minMessages} messages`
    };
  }

  const winners: GiveawayWinner[] = [];
  let totalAccountsSent = 0;

  for (const userStats of topUsers) {
    const accountsToSend: GiveawayWinner['accountsReceived'] = [];
    
    for (let i = 0; i < giveawayConfig.numberOfAccounts; i++) {
      const eligibleServices = giveawayConfig.serviceIds
        .map(id => botState.getService(id))
        .filter(service => {
          if (!service) return false;
          if (giveawayConfig.accountType === 'vip' && !service.isVipOnly) return false;
          if (giveawayConfig.accountType === 'free' && service.isVipOnly) return false;
          return botState.getAvailableAccountCount(service.id) > 0;
        });

      if (eligibleServices.length === 0) {
        console.log(`Aucun service eligible restant pour le gagnant ${userStats.userId} (${i} comptes distribues sur ${giveawayConfig.numberOfAccounts})`);
        break;
      }

      const randomService = eligibleServices[Math.floor(Math.random() * eligibleServices.length)];
      if (!randomService) continue;
      
      const account = botState.getAvailableAccount(randomService.id);

      if (account) {
        accountsToSend.push({
          serviceId: randomService.id,
          serviceName: randomService.name,
          email: account.email,
          password: account.password
        });
        
        botState.markAccountAsUsed(randomService.id, account.id, userStats.userId);
        totalAccountsSent++;
      }
    }

    if (accountsToSend.length > 0) {
      winners.push({
        userId: userStats.userId,
        messageCount: userStats.messageCount,
        accountsReceived: accountsToSend
      });

      try {
        const user = await client.users.fetch(userStats.userId);
        
        const embed = new EmbedBuilder()
          .setTitle('Felicitations ! Vous avez gagne le giveaway !')
          .setDescription(`Vous avez ete selectionne parmi les utilisateurs les plus actifs avec **${userStats.messageCount}** messages !`)
          .setColor(0x5865F2)
          .setTimestamp();

        for (const acc of accountsToSend) {
          embed.addFields({
            name: `${acc.serviceName}`,
            value: `Email: \`${acc.email}\`\nMot de passe: \`${acc.password}\``,
            inline: false
          });
        }

        await user.send({ embeds: [embed] });
      } catch (error) {
        console.error(`Erreur envoi DM a ${userStats.userId}:`, error);
      }
    }
  }

  const giveawayHistory: GiveawayHistory = {
    id: `giveaway_${Date.now()}`,
    date: new Date().toISOString(),
    winners,
    config: { ...giveawayConfig }
  };

  if (winners.length === 0 || totalAccountsSent === 0) {
    return {
      success: false,
      winnersCount: 0,
      accountsSent: 0,
      error: 'Aucun compte n\'a pu etre distribue'
    };
  }

  botState.addGiveawayToHistory(giveawayHistory);
  botState.updateGiveawayConfig({ lastGiveawayDate: new Date().toISOString() });

  return {
    success: true,
    winnersCount: winners.length,
    accountsSent: totalAccountsSent
  };
}

let weeklyGiveawayTimer: NodeJS.Timeout | null = null;

export async function scheduleWeeklyGiveaway(client: Client): Promise<void> {
  if (weeklyGiveawayTimer) {
    return;
  }

  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  weeklyGiveawayTimer = setInterval(async () => {
    const giveawayConfig = botState.getGiveawayConfig();
    
    if (!giveawayConfig.enabled || !giveawayConfig.guildId) {
      console.log('Giveaway hebdomadaire ignore: non active ou guild non configure');
      return;
    }

    const lastGiveaway = giveawayConfig.lastGiveawayDate 
      ? new Date(giveawayConfig.lastGiveawayDate).getTime()
      : 0;
    const now = Date.now();
    
    if (now - lastGiveaway < ONE_WEEK) {
      console.log('Giveaway hebdomadaire ignore: execute recemment');
      return;
    }

    try {
      const guild = await client.guilds.fetch(giveawayConfig.guildId);
      const result = await executeGiveaway(client, guild);
      
      if (result.success) {
        console.log(`Giveaway hebdomadaire execute avec succes: ${result.winnersCount} gagnants, ${result.accountsSent} comptes`);
      } else {
        console.error(`Giveaway hebdomadaire echoue: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur execution giveaway hebdomadaire:', error);
    }
  }, ONE_WEEK);
}
