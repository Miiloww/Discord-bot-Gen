import { 
  ModalSubmitInteraction, 
  TextChannel,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} from 'discord.js';
import { botState } from '../state';
import { parseCooldownTime, parseAccountsFromText } from '../utils/helpers';
import { sendRestockNotification } from '../notifications/restock';
import { refreshAllGenPanels } from '../panels/genPanel';

export async function handleModals(interaction: ModalSubmitInteraction): Promise<void> {
  const { customId } = interaction;

  if (customId === 'modal_setup_status') {
    await handleModalSetupStatus(interaction);
  } else if (customId === 'modal_cooldown') {
    await handleModalCooldown(interaction);
  } else if (customId === 'modal_add_service') {
    await handleModalAddService(interaction);
  } else if (customId === 'modal_edit_restock') {
    await handleModalEditRestock(interaction);
  } else if (customId === 'modal_logs_g3n') {
    await handleModalLogsG3n(interaction);
  } else if (customId === 'modal_config_roles') {
    await handleModalConfigRoles(interaction);
  } else if (customId.startsWith('modal_add_stock_')) {
    await handleModalAddStock(interaction);
  } else if (customId.startsWith('modal_remove_stock_')) {
    await handleModalRemoveStock(interaction);
  } else if (customId === 'modal_submit_code') {
    await handleModalSubmitCode(interaction);
  } else if (customId === 'modal_giveaway_settings') {
    await handleModalGiveawaySettings(interaction);
  }
}

async function handleModalSetupStatus(interaction: ModalSubmitInteraction): Promise<void> {
  const statusText = interaction.fields.getTextInputValue('status_text');
  const roleId = interaction.fields.getTextInputValue('status_role');

  botState.updateConfig({
    statusText: statusText,
    requiredRoleId: roleId
  });

  await interaction.reply({
    content: `Configuration enregistrée\nTexte de statut : "${statusText}"\nRôle : <@&${roleId}>`,
    ephemeral: true
  });
}

async function handleModalCooldown(interaction: ModalSubmitInteraction): Promise<void> {
  const normalCooldownInput = interaction.fields.getTextInputValue('normal_cooldown');
  const vipCooldownInput = interaction.fields.getTextInputValue('vip_cooldown');
  const normalGenCooldownInput = interaction.fields.getTextInputValue('normal_gen_cooldown');
  const vipGenCooldownInput = interaction.fields.getTextInputValue('vip_gen_cooldown');

  const normalCooldown = parseCooldownTime(normalCooldownInput);
  const vipCooldown = parseCooldownTime(vipCooldownInput);
  const normalGenCooldown = parseCooldownTime(normalGenCooldownInput);
  const vipGenCooldown = parseCooldownTime(vipGenCooldownInput);

  if (!normalCooldown || !vipCooldown || !normalGenCooldown || !vipGenCooldown) {
    await interaction.reply({
      content: 'Format invalide. Utilisez: 5m, 300s, 1h, etc.',
      ephemeral: true
    });
    return;
  }

  botState.updateConfig({
    normalCooldown,
    vipCooldown,
    normalGenCooldown,
    vipGenCooldown
  });

  await interaction.reply({
    content: `Cooldowns mis a jour\nTicket Normal: ${normalCooldownInput}\nTicket VIP: ${vipCooldownInput}\nG3n Normal: ${normalGenCooldownInput}\nG3n VIP: ${vipGenCooldownInput}`,
    ephemeral: true
  });
}

async function handleModalAddService(interaction: ModalSubmitInteraction): Promise<void> {
  const emoji = interaction.fields.getTextInputValue('service_emoji').trim();
  const name = interaction.fields.getTextInputValue('service_name');
  const vipInput = interaction.fields.getTextInputValue('service_vip').toLowerCase();
  const isVipOnly = vipInput === 'oui' || vipInput === 'yes';

  const serviceId = `service_${Date.now()}`;
  botState.addService(serviceId, name, isVipOnly, emoji || undefined);

  await interaction.reply({
    content: `Service "${emoji ? emoji + ' ' : ''}${name}" ajoute avec succes\nID: ${serviceId}\nVIP uniquement: ${isVipOnly ? 'Oui' : 'Non'}`,
    ephemeral: true
  });

  await refreshAllGenPanels(interaction.client);
}

async function handleModalEditRestock(interaction: ModalSubmitInteraction): Promise<void> {
  const channelId = interaction.fields.getTextInputValue('restock_channel');
  const pingRoleId = interaction.fields.getTextInputValue('restock_ping');

  botState.updateConfig({
    restockChannelId: channelId,
    restockPingRoleId: pingRoleId
  });

  await interaction.reply({
    content: `Configuration restock mise a jour\nSalon: <#${channelId}>\nRole: <@&${pingRoleId}>`,
    ephemeral: true
  });
}

async function handleModalLogsG3n(interaction: ModalSubmitInteraction): Promise<void> {
  const channelId = interaction.fields.getTextInputValue('logs_channel');

  botState.updateConfig({
    logChannelId: channelId
  });

  await interaction.reply({
    content: `Salon de logs configure: <#${channelId}>`,
    ephemeral: true
  });
}

async function handleModalConfigRoles(interaction: ModalSubmitInteraction): Promise<void> {
  const vipRoleId = interaction.fields.getTextInputValue('vip_role').trim();
  const supplierRoleId = interaction.fields.getTextInputValue('supplier_role').trim();
  const verificationRoleId = interaction.fields.getTextInputValue('verification_role').trim();

  const updates: any = {};
  const messages: string[] = [];

  if (vipRoleId) {
    updates.vipRoleId = vipRoleId;
    messages.push(`Role VIP: <@&${vipRoleId}>`);
  }

  if (supplierRoleId) {
    updates.supplierRoleId = supplierRoleId;
    messages.push(`Role Fournisseur: <@&${supplierRoleId}>`);
  }

  if (verificationRoleId) {
    updates.verificationRoleId = verificationRoleId;
    messages.push(`Role Verification: <@&${verificationRoleId}>`);
  }

  if (messages.length === 0) {
    await interaction.reply({
      content: 'Aucun role configure (tous les champs etaient vides)',
      ephemeral: true
    });
    return;
  }

  botState.updateConfig(updates);

  await interaction.reply({
    content: `Roles configures:\n${messages.join('\n')}`,
    ephemeral: true
  });
}

async function handleModalAddStock(interaction: ModalSubmitInteraction): Promise<void> {
  const serviceId = interaction.customId.replace('modal_add_stock_', '');
  const accountsText = interaction.fields.getTextInputValue('accounts_text');

  const service = botState.getService(serviceId);
  if (!service) {
    await interaction.reply({
      content: 'Service introuvable',
      ephemeral: true
    });
    return;
  }

  const accounts = parseAccountsFromText(accountsText);
  if (accounts.length === 0) {
    await interaction.reply({
      content: 'Aucun compte valide trouve. Format: email:password',
      ephemeral: true
    });
    return;
  }

  botState.addAccounts(serviceId, accounts);

  await interaction.reply({
    content: `${accounts.length} compte(s) ajoute(s) au service "${service.name}"`,
    ephemeral: true
  });

  await sendRestockNotification(
    interaction.client,
    service.name,
    accounts.length,
    service.isVipOnly
  );

  await refreshAllGenPanels(interaction.client);
}

async function handleModalRemoveStock(interaction: ModalSubmitInteraction): Promise<void> {
  const serviceId = interaction.customId.replace('modal_remove_stock_', '');
  const countInput = interaction.fields.getTextInputValue('count');
  const count = parseInt(countInput);

  if (isNaN(count) || count <= 0) {
    await interaction.reply({
      content: 'Nombre invalide',
      ephemeral: true
    });
    return;
  }

  const service = botState.getService(serviceId);
  if (!service) {
    await interaction.reply({
      content: 'Service introuvable',
      ephemeral: true
    });
    return;
  }

  const removed = botState.removeAccountsFromService(serviceId, count);

  await interaction.reply({
    content: `${removed} compte(s) supprime(s) du service "${service.name}"`,
    ephemeral: true
  });

  await refreshAllGenPanels(interaction.client);
}

async function handleModalSubmitCode(interaction: ModalSubmitInteraction): Promise<void> {
  const code = interaction.fields.getTextInputValue('code');
  const codeInfo = botState.getCodeInfo(code);

  if (!codeInfo) {
    await interaction.reply({
      content: 'Code invalide ou expire',
      ephemeral: true
    });
    return;
  }

  if (codeInfo.used) {
    await interaction.reply({
      content: 'Ce code a deja ete utilise',
      ephemeral: true
    });
    return;
  }

  if (codeInfo.userId !== interaction.user.id) {
    await interaction.reply({
      content: 'Ce code ne vous appartient pas',
      ephemeral: true
    });
    return;
  }

  const service = botState.getService(codeInfo.serviceId);
  if (!service) {
    await interaction.reply({
      content: 'Service introuvable',
      ephemeral: true
    });
    return;
  }

  const account = botState.getAccountById(codeInfo.serviceId, codeInfo.accountId);
  if (!account) {
    await interaction.reply({
      content: 'Compte introuvable',
      ephemeral: true
    });
    return;
  }

  botState.markCodeAsUsed(code);

  await interaction.reply({
    content: `Votre compte ${service.name}:\n\nEmail: \`${account.email}\`\nMot de passe: \`${account.password}\``,
    ephemeral: true
  });

  const config = botState.getConfig();
  if (config.logChannelId) {
    try {
      const logChannel = await interaction.client.channels.fetch(config.logChannelId);
      if (logChannel && logChannel.isTextBased()) {
        const textChannel = logChannel as TextChannel;
        
        const logComponent = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### Generation de compte`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `**Utilisateur:** <@${interaction.user.id}>\n` +
                  `**Service:** ${service.name}\n` +
                  `**Heure:** <t:${Math.floor(Date.now() / 1000)}:F>`
                )
              )
          );
        
        await textChannel.send({
          components: [logComponent],
          flags: MessageFlags.IsComponentsV2
        });
      }
    } catch (error) {
      console.error('Erreur envoi log:', error);
    }
  }
}

async function handleModalGiveawaySettings(interaction: ModalSubmitInteraction): Promise<void> {
  const minMessagesInput = interaction.fields.getTextInputValue('min_messages');
  const numberOfWinnersInput = interaction.fields.getTextInputValue('number_of_winners');
  const numberOfAccountsInput = interaction.fields.getTextInputValue('number_of_accounts');
  const accountTypeInput = interaction.fields.getTextInputValue('account_type').toLowerCase();

  const minMessages = parseInt(minMessagesInput);
  const numberOfWinners = parseInt(numberOfWinnersInput);
  const numberOfAccounts = parseInt(numberOfAccountsInput);

  if (isNaN(minMessages) || isNaN(numberOfWinners) || isNaN(numberOfAccounts)) {
    await interaction.reply({
      content: 'Les valeurs doivent etre des nombres valides.',
      ephemeral: true
    });
    return;
  }

  if (!['vip', 'free', 'both'].includes(accountTypeInput)) {
    await interaction.reply({
      content: 'Type de compte invalide. Utilisez: vip, free ou both',
      ephemeral: true
    });
    return;
  }

  botState.updateGiveawayConfig({
    minMessages,
    numberOfWinners,
    numberOfAccounts,
    accountType: accountTypeInput as 'vip' | 'free' | 'both'
  });

  await interaction.reply({
    content: `Configuration mise a jour\n\n` +
      `Messages minimum : ${minMessages}\n` +
      `Nombre de gagnants : ${numberOfWinners}\n` +
      `Comptes par gagnant : ${numberOfAccounts}\n` +
      `Type de comptes : ${accountTypeInput}`,
    ephemeral: true
  });
}
