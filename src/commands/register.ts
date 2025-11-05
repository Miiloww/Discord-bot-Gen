import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export async function registerCommands(clientId: string): Promise<void> {
  const commands = [
    new SlashCommandBuilder()
      .setName('panel-custom')
      .setDescription('Affiche le panel de configuration admin')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
      .setName('panel-g3n')
      .setDescription('Affiche le panel de g3n de comptes')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
      .setName('panel-ticket')
      .setDescription('Affiche le panel de creation de tickets')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
      .setName('verifications')
      .setDescription('Affiche le panel de verification pour la backup')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
  } catch (error) {
    console.error('Erreur enregistrement commandes:', error);
  }
}
