import { Interaction } from 'discord.js';
import { handleCommands } from './commandHandler';
import { handleButtons } from './buttonHandler';
import { handleModals } from './modalHandler';
import { handleSelectMenus } from './selectMenuHandler';

export async function handleInteraction(interaction: Interaction): Promise<void> {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommands(interaction);
    } else if (interaction.isButton()) {
      await handleButtons(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModals(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenus(interaction);
    }
  } catch (error) {
    console.error('Erreur handling interaction:', error);
  }
}
