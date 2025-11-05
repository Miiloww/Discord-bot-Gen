import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
  PermissionFlagsBits,
} from "discord.js";
import { EMOJIS } from "../types";
import { botState } from "../state";

export async function sendCustomPanel(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const config = botState.getConfig();
  const member = interaction.member;
  
  if (!member || typeof member.roles === 'string') {
    await interaction.reply({
      content: 'Erreur lors de la vérification des rôles',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const roleManager = member.roles as GuildMemberRoleManager;
  const isSupplier = !!(config.supplierRoleId && roleManager.cache.has(config.supplierRoleId));
  const hasAdminPerms = !!(member.permissions && typeof member.permissions !== 'string' && member.permissions.has(PermissionFlagsBits.Administrator));
  
  // Si fournisseur mais pas admin, afficher panel simplifié
  if (isSupplier && !hasAdminPerms) {
    await sendSupplierPanel(interaction);
    return;
  }
  
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Panel Custom"),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true),
    )

    // Bouton Setup Status
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Setup Status**\nCe bouton permet de configurer le texte de statut requis et le rôle à attribuer",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Setup Status")
            .setEmoji(EMOJIS.tools)
            .setCustomId("admin_setup_status"),
        ),
    )

    // Bouton Cooldown
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Cooldown**\nCe bouton permet de modifier le temps de cooldown (s = seconde / m = minute / h = heure / j = jour)",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Cooldown")
            .setEmoji(EMOJIS.stopwatch)
            .setCustomId("admin_cooldown"),
        ),
    )

    // Bouton Add Service
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Add Service**\nCe bouton permet d'ajouter de nouveau services",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel("Add Service")
            .setEmoji(EMOJIS.shoppingCart)
            .setCustomId("admin_add_service"),
        ),
    )

    // Bouton Dell Service
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Dell Service**\nCe bouton permet de supprimer un services",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Dell Service")
            .setEmoji(EMOJIS.shoppingCart)
            .setCustomId("admin_dell_service"),
        ),
    )

    // Bouton Edit Restock
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Edit Restock**\nCe bouton permet de modifier le ping et le salon de restock",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Edit Restock")
            .setEmoji(EMOJIS.pin)
            .setCustomId("admin_edit_restock"),
        ),
    )

    // Bouton Logs g3n
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Logs g3n**\nCe bouton permet de configurer le salon de logs de g3n",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Logs g3n")
            .setEmoji(EMOJIS.tools)
            .setCustomId("admin_logs_g3n"),
        ),
    )

    // Bouton Configurer Roles
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Configurer Roles**\nCe bouton permet de configurer les rôles VIP, Fournisseur et Vérification",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Configurer Roles")
            .setEmoji(EMOJIS.crown)
            .setCustomId("admin_config_roles"),
        ),
    )

    // Bouton Ajouter du stock
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Ajouter du stock**\nCe bouton permet d'ajouter du stock a un service",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Ajouter du stock")
            .setEmoji(EMOJIS.shoppingCart)
            .setCustomId("admin_add_stock"),
        ),
    )

    // Bouton Supprimer du stock
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Supprimer du stock**\nCe bouton permet de supprimer le stock d'un service",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Supprimer du stock")
            .setEmoji(EMOJIS.shoppingCart)
            .setCustomId("admin_remove_stock"),
        ),
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)
        .setDivider(true),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("### Configuration Giveaway"),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true),
    )

    // Bouton Giveaway
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Giveaway**\nCe bouton permet de configurer les giveaways automatiques hebdomadaires pour récompenser les utilisateurs les plus actifs",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Giveaway")
            .setEmoji(EMOJIS.star)
            .setCustomId("admin_giveaway"),
        ),
    );

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (interaction.channel && "send" in interaction.channel) {
    await interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  await interaction.editReply({
    content: "Panel custom envoyé dans ce salon!",
  });
}

async function sendSupplierPanel(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Panel Fournisseur"),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true),
    )

    // Bouton Ajouter du stock
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Ajouter du stock**\nCe bouton permet d'ajouter du stock à un service",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Ajouter du stock")
            .setEmoji(EMOJIS.shoppingCart)
            .setCustomId("admin_add_stock"),
        ),
    )

    // Bouton Supprimer du stock
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Bouton Supprimer du stock**\nCe bouton permet de supprimer le stock d'un service",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Supprimer du stock")
            .setEmoji(EMOJIS.shoppingCart)
            .setCustomId("admin_remove_stock"),
        ),
    );

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (interaction.channel && "send" in interaction.channel) {
    await interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  await interaction.editReply({
    content: "Panel fournisseur envoyé dans ce salon!",
  });
}
