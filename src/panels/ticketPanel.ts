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
} from "discord.js";

export async function sendTicketPanel(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Créer un ticket"),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "**Limite :** 1 ticket actif par utilisateur\n**Cooldown :** 5 minutes (1 minute pour VIP)\n\nCliquez sur le bouton ci-dessous pour creer un ticket",
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true),
    )
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel("Creer un ticket")
          .setCustomId("ticket_create"),
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
    content: "Panel ticket envoyé dans ce salon!",
  });
}
