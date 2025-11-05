import {
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMemberRoleManager,
  StringSelectMenuBuilder
} from 'discord.js';
import { botState } from '../state';
import { formatTime } from '../utils/helpers';
import { refreshAllGenPanels } from '../panels/genPanel';

export async function handleButtons(interaction: ButtonInteraction): Promise<void> {
  const { customId } = interaction;

  if (customId === 'admin_setup_status') {
    await handleAdminSetupStatus(interaction);
  } else if (customId === 'admin_cooldown') {
    await handleAdminCooldown(interaction);
  } else if (customId === 'admin_add_service') {
    await handleAdminAddService(interaction);
  } else if (customId === 'admin_dell_service') {
    await handleAdminDellService(interaction);
  } else if (customId === 'admin_edit_restock') {
    await handleAdminEditRestock(interaction);
  } else if (customId === 'admin_logs_g3n') {
    await handleAdminLogsG3n(interaction);
  } else if (customId === 'admin_config_roles') {
    await handleAdminConfigRoles(interaction);
  } else if (customId === 'admin_add_stock') {
    await handleAdminAddStock(interaction);
  } else if (customId === 'admin_remove_stock') {
    await handleAdminRemoveStock(interaction);
  } else if (customId === 'admin_giveaway') {
    await handleAdminGiveaway(interaction);
  } else if (customId.startsWith('gen_service_')) {
    await handleGenService(interaction);
  } else if (customId === 'ticket_create') {
    await handleTicketCreate(interaction);
  } else if (customId === 'ticket_close') {
    await handleTicketClose(interaction);
  } else if (customId === 'ticket_submit_code') {
    await handleTicketSubmitCode(interaction);
  }
}

async function handleAdminSetupStatus(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_setup_status')
    .setTitle('Configurer le status');

  const statusTextInput = new TextInputBuilder()
    .setCustomId('status_text')
    .setLabel('Texte requis dans le statut')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const roleIdInput = new TextInputBuilder()
    .setCustomId('status_role')
    .setLabel('ID du role a attribuer')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(statusTextInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(roleIdInput)
  );

  await interaction.showModal(modal);
}

async function handleAdminCooldown(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_cooldown')
    .setTitle('Modifier les cooldowns');

  const normalInput = new TextInputBuilder()
    .setCustomId('normal_cooldown')
    .setLabel('Cooldown ticket normal (ex: 5m, 300s, 1h)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const vipInput = new TextInputBuilder()
    .setCustomId('vip_cooldown')
    .setLabel('Cooldown ticket VIP (ex: 1m, 60s)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const normalGenInput = new TextInputBuilder()
    .setCustomId('normal_gen_cooldown')
    .setLabel('Cooldown g3n normal (ex: 5m, 300s, 1h)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const vipGenInput = new TextInputBuilder()
    .setCustomId('vip_gen_cooldown')
    .setLabel('Cooldown g3n VIP (ex: 5m, 300s, 1h)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(normalInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(vipInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(normalGenInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(vipGenInput)
  );

  await interaction.showModal(modal);
}

async function handleAdminAddService(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_add_service')
    .setTitle('Ajouter un service');

  const emojiInput = new TextInputBuilder()
    .setCustomId('service_emoji')
    .setLabel('Emoji du serveur (ex: <:name:123456789>)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('Optionnel - Copiez l\'emoji du serveur ici');

  const nameInput = new TextInputBuilder()
    .setCustomId('service_name')
    .setLabel('Nom du service (ex: Crunchyroll)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const vipInput = new TextInputBuilder()
    .setCustomId('service_vip')
    .setLabel('VIP uniquement? (oui/non)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(emojiInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(vipInput)
  );

  await interaction.showModal(modal);
}

async function handleAdminDellService(interaction: ButtonInteraction): Promise<void> {
  const services = botState.getAllServices();
  
  if (services.length === 0) {
    await interaction.reply({
      content: 'Aucun service disponible a supprimer',
      ephemeral: true
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_service_delete')
    .setPlaceholder('Selectionnez un service a supprimer')
    .addOptions(
      services.map(service => ({
        label: service.name,
        value: service.id,
        description: `${botState.getAvailableAccountCount(service.id)} comptes en stock`
      }))
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);

  await interaction.reply({
    content: 'Selectionnez le service a supprimer :',
    components: [row],
    ephemeral: true
  });
}

async function handleAdminEditRestock(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_edit_restock')
    .setTitle('Configurer le restock');

  const channelInput = new TextInputBuilder()
    .setCustomId('restock_channel')
    .setLabel('ID du salon de restock')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const pingInput = new TextInputBuilder()
    .setCustomId('restock_ping')
    .setLabel('ID du role a ping')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(pingInput)
  );

  await interaction.showModal(modal);
}

async function handleAdminLogsG3n(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_logs_g3n')
    .setTitle('Configurer les logs de g3n');

  const channelInput = new TextInputBuilder()
    .setCustomId('logs_channel')
    .setLabel('ID du salon de logs')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput)
  );

  await interaction.showModal(modal);
}

async function handleAdminConfigRoles(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_roles')
    .setTitle('Configurer les roles');

  const vipRoleInput = new TextInputBuilder()
    .setCustomId('vip_role')
    .setLabel('ID du role VIP')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('Laissez vide pour ne pas modifier');

  const supplierRoleInput = new TextInputBuilder()
    .setCustomId('supplier_role')
    .setLabel('ID du role Fournisseur')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('Laissez vide pour ne pas modifier');

  const verificationRoleInput = new TextInputBuilder()
    .setCustomId('verification_role')
    .setLabel('ID du role de Verification')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('Laissez vide pour ne pas modifier');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(vipRoleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(supplierRoleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(verificationRoleInput)
  );

  await interaction.showModal(modal);
}

async function handleAdminAddStock(interaction: ButtonInteraction): Promise<void> {
  const services = botState.getAllServices();
  
  if (services.length === 0) {
    await interaction.reply({
      content: 'Aucun service disponible. Creez d\'abord un service.',
      ephemeral: true
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_service_add_stock')
    .setPlaceholder('Selectionnez un service')
    .addOptions(
      services.map(service => ({
        label: `${service.name} ${service.isVipOnly ? '(VIP)' : '(Normal)'}`,
        value: service.id,
        description: `${botState.getAvailableAccountCount(service.id)} comptes en stock`
      }))
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);

  await interaction.reply({
    content: 'Selectionnez le service pour ajouter du stock :',
    components: [row],
    ephemeral: true
  });
}

async function handleAdminRemoveStock(interaction: ButtonInteraction): Promise<void> {
  const services = botState.getAllServices();
  
  if (services.length === 0) {
    await interaction.reply({
      content: 'Aucun service disponible.',
      ephemeral: true
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_service_remove_stock')
    .setPlaceholder('Selectionnez un service')
    .addOptions(
      services.map(service => ({
        label: `${service.name} ${service.isVipOnly ? '(VIP)' : '(Normal)'}`,
        value: service.id,
        description: `${botState.getAvailableAccountCount(service.id)} comptes en stock`
      }))
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);

  await interaction.reply({
    content: 'Selectionnez le service pour supprimer du stock :',
    components: [row],
    ephemeral: true
  });
}

async function handleAdminGiveaway(interaction: ButtonInteraction): Promise<void> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_giveaway_action')
    .setPlaceholder('Selectionnez une action')
    .addOptions([
      {
        label: 'Activer/Desactiver les giveaways',
        value: 'toggle_giveaway',
        description: 'Active ou desactive le systeme de giveaway automatique'
      },
      {
        label: 'Configurer les parametres',
        value: 'config_giveaway_settings',
        description: 'Messages min, nombre de gagnants, comptes, etc.'
      },
      {
        label: 'Selectionner les services',
        value: 'config_giveaway_services',
        description: 'Choisir quels services seront distribues'
      },
      {
        label: 'Voir les statistiques',
        value: 'view_giveaway_stats',
        description: 'Voir les utilisateurs les plus actifs'
      },
      {
        label: 'Lancer un giveaway manuel',
        value: 'run_manual_giveaway',
        description: 'Executer un giveaway immediatement'
      },
      {
        label: 'Historique des giveaways',
        value: 'view_giveaway_history',
        description: 'Voir l\'historique des giveaways passes'
      }
    ]);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);

  const giveawayConfig = botState.getGiveawayConfig();
  const statusText = giveawayConfig.enabled ? 'Actif' : 'Inactif';

  await interaction.reply({
    content: `**Configuration Giveaway** ${statusText}\n\n` +
      `Messages minimum : ${giveawayConfig.minMessages}\n` +
      `Nombre de gagnants : ${giveawayConfig.numberOfWinners}\n` +
      `Comptes par gagnant : ${giveawayConfig.numberOfAccounts}\n` +
      `Type de comptes : ${giveawayConfig.accountType === 'vip' ? 'VIP uniquement' : giveawayConfig.accountType === 'free' ? 'Gratuit uniquement' : 'VIP et Gratuit'}\n` +
      `Services selectiones : ${giveawayConfig.serviceIds.length}\n\n` +
      `Selectionnez une action :`,
    components: [row],
    ephemeral: true
  });
}

async function handleGenService(interaction: ButtonInteraction): Promise<void> {
  const serviceId = interaction.customId.replace('gen_service_', '');
  const service = botState.getService(serviceId);
  
  if (!service) {
    await interaction.reply({
      content: 'Service introuvable',
      ephemeral: true
    });
    return;
  }

  const config = botState.getConfig();
  const member = interaction.member;
  
  if (!member || typeof member.roles === 'string') {
    await interaction.reply({
      content: 'Erreur lors de la verification du role',
      ephemeral: true
    });
    return;
  }

  const roleManager = member.roles as GuildMemberRoleManager;
  const hasRequiredRole = config.requiredRoleId && roleManager.cache.has(config.requiredRoleId);
  
  if (!hasRequiredRole) {
    await interaction.reply({
      content: `Vous devez avoir le texte "${config.statusText}" dans votre statut pour utiliser ce service`,
      ephemeral: true
    });
    return;
  }

  const isVip = !!(config.vipRoleId && roleManager.cache.has(config.vipRoleId));

  if (service.isVipOnly && !isVip) {
    await interaction.reply({
      content: 'Ce service est reserve aux membres VIP',
      ephemeral: true
    });
    return;
  }

  const remaining = botState.getRemainingGenCooldown(interaction.user.id, isVip);
  
  if (remaining > 0) {
    await interaction.reply({
      content: `Vous devez attendre encore ${formatTime(remaining)} avant de pouvoir g3n un nouveau compte`,
      ephemeral: true
    });
    return;
  }

  const account = botState.getAvailableAccount(serviceId);
  if (!account) {
    await interaction.reply({
      content: 'Aucun compte disponible pour ce service',
      ephemeral: true
    });
    return;
  }

  botState.markAccountAsUsed(serviceId, account.id, interaction.user.id);
  const code = botState.generateCode(serviceId, interaction.user.id, account.id);
  botState.setGenCooldown(interaction.user.id);

  await interaction.reply({
    content: `Votre code de g3n pour ${service.name} :\n\`${code}\`\n\nUtilisez ce code dans un ticket pour recevoir votre compte`,
    ephemeral: true
  });

  await refreshAllGenPanels(interaction.client);
}

async function handleTicketCreate(interaction: ButtonInteraction): Promise<void> {
  const config = botState.getConfig();
  const member = interaction.member;
  
  if (!member || typeof member.roles === 'string') {
    await interaction.reply({
      content: 'Erreur lors de la verification du role',
      ephemeral: true
    });
    return;
  }

  const existingTicket = botState.getTicketByUser(interaction.user.id);
  if (existingTicket) {
    await interaction.reply({
      content: 'Vous avez deja un ticket actif',
      ephemeral: true
    });
    return;
  }

  const roleManager = member.roles as GuildMemberRoleManager;
  const isVip = !!(config.vipRoleId && roleManager.cache.has(config.vipRoleId));
  const remaining = botState.getRemainingCooldown(interaction.user.id, isVip);
  
  if (remaining > 0) {
    await interaction.reply({
      content: `Vous devez attendre encore ${formatTime(remaining)} avant de creer un nouveau ticket`,
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await interaction.guild!.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild!.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle('Validation du code')
      .setDescription('Entrez le code que vous avez recu lors de la g3n de votre compte (13 caracteres)')
      .setColor(0x5865F2);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_submit_code')
          .setLabel('Soumettre le code')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Fermer le ticket')
          .setStyle(ButtonStyle.Danger)
      );

    await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
      components: [row]
    });

    const autoCloseTimeout = setTimeout(async () => {
      try {
        await channel.delete();
        botState.removeTicket(channel.id);
      } catch (error) {
        console.error('Erreur fermeture auto ticket:', error);
      }
    }, 5 * 60 * 1000);

    botState.addTicket(channel.id, interaction.user.id, autoCloseTimeout);
    botState.setCooldown(interaction.user.id);

    await interaction.editReply({
      content: `Ticket créé : <#${channel.id}>`
    });
  } catch (error) {
    console.error('Erreur creation ticket:', error);
    await interaction.editReply({
      content: 'Erreur lors de la creation du ticket'
    });
  }
}

async function handleTicketClose(interaction: ButtonInteraction): Promise<void> {
  const ticket = botState.getTicket(interaction.channelId);
  
  if (!ticket) {
    await interaction.reply({
      content: 'Ce canal n\'est pas un ticket valide',
      ephemeral: true
    });
    return;
  }

  if (ticket.userId !== interaction.user.id) {
    await interaction.reply({
      content: 'Seul le createur du ticket peut le fermer',
      ephemeral: true
    });
    return;
  }

  await interaction.reply({
    content: 'Fermeture du ticket...'
  });

  botState.removeTicket(interaction.channelId);

  setTimeout(async () => {
    try {
      await interaction.channel?.delete();
    } catch (error) {
      console.error('Erreur suppression ticket:', error);
    }
  }, 2000);
}

async function handleTicketSubmitCode(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_submit_code')
    .setTitle('Soumettre votre code');

  const codeInput = new TextInputBuilder()
    .setCustomId('code')
    .setLabel('Code de g3n (13 caracteres)')
    .setStyle(TextInputStyle.Short)
    .setMinLength(13)
    .setMaxLength(13)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput)
  );

  await interaction.showModal(modal);
}
