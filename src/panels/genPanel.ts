import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ChatInputCommandInteraction,
  Message
} from 'discord.js';
import { botState } from '../state';

// Helper pour extraire l'ID de l'emoji personnalisé Discord
function parseCustomEmoji(emojiString: string): { id: string, name: string } | null {
  // Format: <:name:id> ou <a:name:id> pour les animés
  const match = emojiString.match(/<a?:([\w]+):(\d+)>/);
  return match ? { name: match[1], id: match[2] } : null;
}

export async function sendGenPanel(interaction: ChatInputCommandInteraction): Promise<void> {
  const container = buildGenContainer();
  
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (interaction.channel && "send" in interaction.channel) {
    const message = await interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    
    if (message && 'id' in message) {
      botState.addGenPanelMessage(message.id);
    }
  }

  await interaction.editReply({
    content: "Panel g3n envoyé dans ce salon!",
  });
}

export function buildGenContainer(): ContainerBuilder {
  const services = botState.getAllServices();
  const vipServices = services.filter(s => s.isVipOnly);
  const freeServices = services.filter(s => !s.isVipOnly);
  
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## G3n de comptes")
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

  if (services.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("Aucun service disponible pour le moment")
    );
    return container;
  }

  // Section Services Gratuits
  if (freeServices.length > 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("**Services Gratuits**")
    );
    
    // Créer des rows de maximum 5 boutons par ligne
    const freeButtons: ButtonBuilder[] = [];
    for (const service of freeServices) {
      const availableCount = botState.getAvailableAccountCount(service.id);
      const hasStock = availableCount > 0;
      const label = `${service.name} (${availableCount})`;
      
      const button = new ButtonBuilder()
        .setStyle(hasStock ? ButtonStyle.Success : ButtonStyle.Danger)
        .setLabel(label)
        .setCustomId(`gen_service_${service.id}`)
        .setDisabled(!hasStock);
      
      // Ajouter l'emoji si présent
      if (service.emoji) {
        const emojiData = parseCustomEmoji(service.emoji);
        if (emojiData) {
          // Emoji personnalisé Discord
          button.setEmoji(emojiData.id);
        } else {
          // Emoji unicode standard
          button.setEmoji(service.emoji);
        }
      }
      
      freeButtons.push(button);
    }
    
    // Ajouter les boutons par groupes de 5 maximum
    for (let i = 0; i < freeButtons.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...freeButtons.slice(i, i + 5));
      container.addActionRowComponents(row);
    }
  }

  // Séparateur entre Free et VIP
  if (freeServices.length > 0 && vipServices.length > 0) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
    );
  }

  // Section Services VIP
  if (vipServices.length > 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("**Services VIP**")
    );
    
    // Créer des rows de maximum 5 boutons par ligne
    const vipButtons: ButtonBuilder[] = [];
    for (const service of vipServices) {
      const availableCount = botState.getAvailableAccountCount(service.id);
      const hasStock = availableCount > 0;
      const label = `${service.name} (${availableCount})`;
      
      const button = new ButtonBuilder()
        .setStyle(hasStock ? ButtonStyle.Primary : ButtonStyle.Danger)
        .setLabel(label)
        .setCustomId(`gen_service_${service.id}`)
        .setDisabled(!hasStock);
      
      // Ajouter l'emoji si présent
      if (service.emoji) {
        const emojiData = parseCustomEmoji(service.emoji);
        if (emojiData) {
          // Emoji personnalisé Discord
          button.setEmoji(emojiData.id);
        } else {
          // Emoji unicode standard
          button.setEmoji(service.emoji);
        }
      }
      
      vipButtons.push(button);
    }
    
    // Ajouter les boutons par groupes de 5 maximum
    for (let i = 0; i < vipButtons.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...vipButtons.slice(i, i + 5));
      container.addActionRowComponents(row);
    }
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("*made by Miiloww*")
  );

  return container;
}

export async function updateGenPanel(message: Message): Promise<void> {
  const container = buildGenContainer();
  
  await message.edit({
    components: [container]
  });
}

export async function refreshAllGenPanels(client: any): Promise<void> {
  const messageIds = botState.getGenPanelMessages();
  const container = buildGenContainer();

  for (const messageId of messageIds) {
    let found = false;
    
    // Parcourir tous les guilds du bot
    for (const [, guild] of client.guilds.cache) {
      try {
        // Parcourir tous les channels du guild
        for (const [, channel] of guild.channels.cache) {
          if (channel && channel.isTextBased()) {
            try {
              const message = await (channel as any).messages.fetch(messageId);
              if (message) {
                await message.edit({
                  components: [container]
                });
                found = true;
                break;
              }
            } catch (error) {
              // Message pas dans ce channel, continuer
            }
          }
        }
        
        if (found) break;
      } catch (error) {
        // Erreur sur ce guild, continuer
      }
    }
    
    // Si le message n'a pas été trouvé, le retirer de la liste
    if (!found) {
      botState.removeGenPanelMessage(messageId);
    }
  }
}
