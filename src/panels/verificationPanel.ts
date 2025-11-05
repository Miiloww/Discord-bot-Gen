import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ChatInputCommandInteraction
} from 'discord.js';
import { EMOJIS } from '../types';

function getRedirectUri(): string {
  if (process.env.REDIRECT_URI) {
    return process.env.REDIRECT_URI;
  }
  
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}/oauth/callback`;
  }
  
  const port = process.env.PORT || '5000';
  return `http://localhost:${port}/oauth/callback`;
}

export async function sendVerificationPanel(interaction: ChatInputCommandInteraction): Promise<void> {
  const clientId = interaction.client.user.id;
  const redirectUri = getRedirectUri();
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds.join`;

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${EMOJIS.verified} **Vérification**`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("**Informations**\n\nCeci est une vérification afin que vous rejoigniez la backup. Il n'y a aucun risque, tout est sécurisé. Veuillez vous faire vérifier.\n\nEn cas de fermeture du serveur principal, nous pourrons vous transférer automatiquement vers le nouveau serveur, etc.\n\n**Le rôle sera automatiquement attribué dès que vous autoriserez le bot.**")
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Verify")
            .setEmoji(EMOJIS.externalLink)
            .setURL(authUrl)
        )
    );

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (interaction.channel && "send" in interaction.channel) {
    await interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  await interaction.editReply({
    content: "Panel de vérification envoyé dans ce salon!",
  });
}
