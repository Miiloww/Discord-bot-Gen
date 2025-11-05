import { 
  StringSelectMenuInteraction, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} from 'discord.js';
import { botState } from '../state';
import { refreshAllGenPanels } from '../panels/genPanel';
import { executeGiveaway } from '../utils/giveawayHandler';

export async function handleSelectMenus(interaction: StringSelectMenuInteraction): Promise<void> {
  const { customId } = interaction;

  if (customId === 'select_service_delete') {
    await handleSelectServiceDelete(interaction);
  } else if (customId === 'select_service_add_stock') {
    await handleSelectServiceAddStock(interaction);
  } else if (customId === 'select_service_remove_stock') {
    await handleSelectServiceRemoveStock(interaction);
  } else if (customId === 'select_giveaway_action') {
    await handleSelectGiveawayAction(interaction);
  } else if (customId === 'select_giveaway_services') {
    await handleSelectGiveawayServices(interaction);
  }
}

async function handleSelectServiceDelete(interaction: StringSelectMenuInteraction): Promise<void> {
  const serviceId = interaction.values[0];
  const service = botState.getService(serviceId);

  if (!service) {
    await interaction.reply({
      content: 'Service introuvable',
      ephemeral: true
    });
    return;
  }

  botState.removeService(serviceId);

  await interaction.reply({
    content: `Service "${service.name}" supprime avec succes`,
    ephemeral: true
  });

  await refreshAllGenPanels(interaction.client);
}

async function handleSelectServiceAddStock(interaction: StringSelectMenuInteraction): Promise<void> {
  const serviceId = interaction.values[0];
  const service = botState.getService(serviceId);

  if (!service) {
    await interaction.reply({
      content: 'Service introuvable',
      ephemeral: true
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal_add_stock_${serviceId}`)
    .setTitle(`Ajouter du stock - ${service.name}`);

  const accountsInput = new TextInputBuilder()
    .setCustomId('accounts_text')
    .setLabel('Comptes (email:password par ligne)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('email1@example.com:password1\nemail2@example.com:password2')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(accountsInput)
  );

  await interaction.showModal(modal);
}

async function handleSelectServiceRemoveStock(interaction: StringSelectMenuInteraction): Promise<void> {
  const serviceId = interaction.values[0];
  const service = botState.getService(serviceId);

  if (!service) {
    await interaction.reply({
      content: 'Service introuvable',
      ephemeral: true
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal_remove_stock_${serviceId}`)
    .setTitle(`Supprimer du stock - ${service.name}`);

  const countInput = new TextInputBuilder()
    .setCustomId('count')
    .setLabel('Nombre de comptes a supprimer')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(countInput)
  );

  await interaction.showModal(modal);
}

async function handleSelectGiveawayAction(interaction: StringSelectMenuInteraction): Promise<void> {
  const action = interaction.values[0];

  if (action === 'toggle_giveaway') {
    const giveawayConfig = botState.getGiveawayConfig();
    botState.updateGiveawayConfig({ enabled: !giveawayConfig.enabled });
    
    await interaction.reply({
      content: `Giveaway automatique ${!giveawayConfig.enabled ? 'active' : 'desactive'}`,
      ephemeral: true
    });
  } else if (action === 'config_giveaway_settings') {
    const modal = new ModalBuilder()
      .setCustomId('modal_giveaway_settings')
      .setTitle('Configurer les parametres du giveaway');

    const minMessagesInput = new TextInputBuilder()
      .setCustomId('min_messages')
      .setLabel('Nombre minimum de messages')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('100')
      .setRequired(true);

    const winnersInput = new TextInputBuilder()
      .setCustomId('number_of_winners')
      .setLabel('Nombre de gagnants')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('5')
      .setRequired(true);

    const accountsInput = new TextInputBuilder()
      .setCustomId('number_of_accounts')
      .setLabel('Nombre de comptes par gagnant')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('1')
      .setRequired(true);

    const accountTypeInput = new TextInputBuilder()
      .setCustomId('account_type')
      .setLabel('Type de comptes (vip/free/both)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('free')
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(minMessagesInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(winnersInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(accountsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(accountTypeInput)
    );

    await interaction.showModal(modal);
  } else if (action === 'config_giveaway_services') {
    const services = botState.getAllServices();
    
    if (services.length === 0) {
      await interaction.reply({
        content: 'Aucun service disponible. Creez d\'abord des services.',
        ephemeral: true
      });
      return;
    }

    const giveawayConfig = botState.getGiveawayConfig();
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_giveaway_services')
      .setPlaceholder('Selectionnez les services pour le giveaway')
      .setMinValues(1)
      .setMaxValues(services.length)
      .addOptions(
        services.map(service => ({
          label: `${service.name} ${service.isVipOnly ? '(VIP)' : '(Normal)'}`,
          value: service.id,
          description: `${botState.getAvailableAccountCount(service.id)} comptes en stock`,
          default: giveawayConfig.serviceIds.includes(service.id)
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(selectMenu);

    await interaction.reply({
      content: 'Selectionnez les services qui seront distribues lors du giveaway :',
      components: [row],
      ephemeral: true
    });
  } else if (action === 'view_giveaway_stats') {
    const giveawayConfig = botState.getGiveawayConfig();
    const topUsers = botState.getTopUsers(giveawayConfig.minMessages, 20);

    if (topUsers.length === 0) {
      await interaction.reply({
        content: `Aucun utilisateur avec au moins ${giveawayConfig.minMessages} messages.`,
        ephemeral: true
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Statistiques des utilisateurs')
      .setDescription(`Top ${topUsers.length} utilisateurs avec au moins ${giveawayConfig.minMessages} messages`)
      .setColor(0x5865F2)
      .setTimestamp();

    let description = '';
    for (let i = 0; i < Math.min(topUsers.length, 10); i++) {
      const user = topUsers[i];
      description += `${i + 1}. <@${user.userId}> - **${user.messageCount}** messages\n`;
    }

    embed.addFields({ name: 'Utilisateurs les plus actifs', value: description || 'Aucun' });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  } else if (action === 'run_manual_giveaway') {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const result = await executeGiveaway(interaction.client, interaction.guild!);
      
      if (result.success) {
        await interaction.editReply({
          content: `Giveaway execute avec succes!\n\n` +
            `${result.winnersCount} gagnant(s)\n` +
            `${result.accountsSent} compte(s) envoye(s)`
        });
      } else {
        await interaction.editReply({
          content: `Erreur: ${result.error}`
        });
      }
    } catch (error) {
      await interaction.editReply({
        content: `Erreur lors de l'execution du giveaway: ${error}`
      });
    }
  } else if (action === 'view_giveaway_history') {
    const history = botState.getGiveawayHistory();

    if (history.length === 0) {
      await interaction.reply({
        content: 'Aucun giveaway dans l\'historique.',
        ephemeral: true
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Historique des giveaways')
      .setColor(0x5865F2)
      .setTimestamp();

    const recentHistory = history.slice(-5).reverse();
    for (const entry of recentHistory) {
      const date = new Date(entry.date).toLocaleString('fr-FR');
      const winnersText = entry.winners.map(w => `<@${w.userId}> (${w.messageCount} msgs)`).join('\n');
      
      embed.addFields({
        name: `${date}`,
        value: `${entry.winners.length} gagnant(s):\n${winnersText}`,
        inline: false
      });
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}

async function handleSelectGiveawayServices(interaction: StringSelectMenuInteraction): Promise<void> {
  const selectedServiceIds = interaction.values;
  
  botState.updateGiveawayConfig({ serviceIds: selectedServiceIds });
  
  await interaction.reply({
    content: `${selectedServiceIds.length} service(s) selectionne(s) pour le giveaway`,
    ephemeral: true
  });
}
