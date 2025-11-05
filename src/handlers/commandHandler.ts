import { ChatInputCommandInteraction, GuildMemberRoleManager } from 'discord.js';
import { botState } from '../state';
import { sendCustomPanel } from '../panels/customPanel';
import { sendGenPanel } from '../panels/genPanel';
import { sendTicketPanel } from '../panels/ticketPanel';
import { sendVerificationPanel } from '../panels/verificationPanel';

export async function handleCommands(interaction: ChatInputCommandInteraction): Promise<void> {
  const { commandName } = interaction;

  switch (commandName) {
    case 'panel-custom':
      await handlePanelCustom(interaction);
      break;
    case 'panel-g3n':
      await handlePanelG3n(interaction);
      break;
    case 'panel-ticket':
      await handlePanelTicket(interaction);
      break;
    case 'verifications':
      await handleVerifications(interaction);
      break;
  }
}

async function handlePanelCustom(interaction: ChatInputCommandInteraction): Promise<void> {
  await sendCustomPanel(interaction);
}

async function handlePanelG3n(interaction: ChatInputCommandInteraction): Promise<void> {
  await sendGenPanel(interaction);
}

async function handlePanelTicket(interaction: ChatInputCommandInteraction): Promise<void> {
  await sendTicketPanel(interaction);
}

async function handleVerifications(interaction: ChatInputCommandInteraction): Promise<void> {
  await sendVerificationPanel(interaction);
}
