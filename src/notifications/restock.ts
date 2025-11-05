import {
  Client,
  MessageFlags,
  TextChannel,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize
} from 'discord.js';
import { botState } from '../state';

export async function sendRestockNotification(
  client: Client,
  serviceName: string,
  count: number,
  isVipOnly: boolean
): Promise<void> {
  const config = botState.getConfig();
  
  if (!config.restockChannelId) return;

  try {
    const channel = await client.channels.fetch(config.restockChannelId);
    if (!channel || !channel.isTextBased()) return;

    const textChannel = channel as TextChannel;
    
    const pingText = config.restockPingRoleId ? `<@&${config.restockPingRoleId}>\n\n` : '';
    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${pingText}## Nouveau stock disponible`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Service:** ${serviceName}`)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Quantite:** ${count} comptes`)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Type:** ${isVipOnly ? 'VIP uniquement' : 'Gratuit'}`)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Heure:** <t:${Math.floor(Date.now() / 1000)}:F>`)
      );

    await textChannel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  } catch (error) {
    console.error('Erreur notification restock:', error);
  }
}
