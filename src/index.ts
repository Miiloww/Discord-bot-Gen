import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import { registerCommands } from './commands/register';
import { handleInteraction } from './handlers/interactionHandler';
import { checkPresences } from './handlers/presenceHandler';
import { botState } from './state';
import { scheduleWeeklyGiveaway } from './utils/giveawayHandler';
import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    bot: client.user ? client.user.tag : 'Not connected',
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    discord: client.isReady() ? 'connected' : 'disconnected'
  });
});

function getRedirectUri(): string {
  if (process.env.REDIRECT_URI) {
    return process.env.REDIRECT_URI;
  }
  
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}/oauth/callback`;
  }
  
  return `http://localhost:${PORT}/oauth/callback`;
}

app.get('/oauth/callback', async (req, res) => {
  const code = req.query.code as string;
  
  if (!code) {
    res.status(400).send('Code manquant');
    return;
  }

  try {
    const targetGuildId = process.env.GUILD_ID;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = getRedirectUri();

    if (!clientId || !clientSecret) {
      res.status(500).send('Configuration OAuth2 manquante');
      return;
    }

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string };

    if (!tokenData.access_token) {
      res.status(400).send('Erreur lors de l\'obtention du token');
      return;
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json() as { id: string; username: string };
    const userId = userData.id;

    const config = botState.getConfig();
    if (config.verificationRoleId && targetGuildId) {
      const guild = client.guilds.cache.get(targetGuildId);
      if (guild) {
        try {
          const member = await guild.members.fetch(userId);
          if (member && !member.roles.cache.has(config.verificationRoleId)) {
            await member.roles.add(config.verificationRoleId);
            console.log(`Role de verification ajoute a ${userData.username} dans ${guild.name}`);
          }
        } catch (error) {
          console.error(`Erreur ajout role verification pour ${userId}:`, error);
        }
      }
    }

    const botName = client.user?.username || 'Bot';
    const botAvatar = client.user?.displayAvatarURL({ size: 128 }) || '';

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verification reussie</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: #000000;
              color: #ffffff;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 500px;
            }
            .bot-avatar {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              margin: 0 auto 20px;
              border: 4px solid #5865F2;
              box-shadow: 0 0 20px rgba(88, 101, 242, 0.5);
            }
            .bot-name {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 30px;
              color: #ffffff;
            }
            .success-icon {
              font-size: 60px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 15px;
              color: #57F287;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
              color: #b9bbbe;
              margin-bottom: 10px;
            }
            .close-text {
              margin-top: 30px;
              font-size: 14px;
              color: #72767d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${botAvatar ? `<img src="${botAvatar}" alt="${botName}" class="bot-avatar">` : ''}
            <div class="bot-name">${botName}</div>
            <div class="success-icon">✓</div>
            <h1>Vérification réussie !</h1>
            <p>Vous avez été vérifié avec succès.</p>
            <p>Le rôle a été ajouté à votre compte.</p>
            <p class="close-text">Vous pouvez fermer cette fenêtre.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erreur OAuth2 callback:', error);
    res.status(500).send('Erreur lors de la verification');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Bot connecte en tant que ${c.user.tag}`);
  
  await registerCommands(c.user.id);
  console.log('Commandes slash enregistrees');

  setInterval(() => {
    checkPresences(client);
  }, 30000);

  scheduleWeeklyGiveaway(client);
  console.log('Giveaway hebdomadaire planifie');
});

client.on(Events.InteractionCreate, async (interaction) => {
  await handleInteraction(interaction);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const giveawayConfig = botState.getGiveawayConfig();
  if (!giveawayConfig.guildId) {
    botState.updateGiveawayConfig({ guildId: message.guild.id });
  }

  botState.incrementUserMessageCount(message.author.id);
});

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
  if (!newPresence.guild) return;
  
  const targetGuildId = process.env.GUILD_ID;
  if (!targetGuildId || newPresence.guild.id !== targetGuildId) return;
  
  const config = botState.getConfig();
  if (!config.statusText || !config.requiredRoleId) return;

  const roleExists = newPresence.guild.roles.cache.has(config.requiredRoleId);
  if (!roleExists) return;

  const member = newPresence.member;
  if (!member) return;

  const activities = newPresence.activities;
  const hasRequiredStatus = activities.some(activity => 
    activity.state?.includes(config.statusText) || 
    activity.name?.includes(config.statusText)
  );

  const hasRole = member.roles.cache.has(config.requiredRoleId);

  if (hasRequiredStatus && !hasRole) {
    try {
      await member.roles.add(config.requiredRoleId);
      console.log(`Role ajoute a ${member.user.tag}`);
    } catch (error) {
      console.error('Erreur ajout role:', error);
    }
  } else if (!hasRequiredStatus && hasRole) {
    try {
      await member.roles.remove(config.requiredRoleId);
      console.log(`Role retire de ${member.user.tag}`);
    } catch (error) {
      console.error('Erreur retrait role:', error);
    }
  }
});

client.on(Events.ChannelDelete, async (channel) => {
  const ticket = botState.getTicket(channel.id);
  if (ticket) {
    botState.removeTicket(channel.id);
    console.log(`Ticket supprime pour le canal: ${channel.id}`);
  }
});

client.on(Events.GuildCreate, async (guild) => {
  console.log(`Bot ajoute au serveur: ${guild.name} (${guild.id})`);
  console.log('Reinitialisation de la configuration par defaut...');
  
  botState.resetConfig();
});

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('DISCORD_BOT_TOKEN manquant dans les variables d\'environnement');
  process.exit(1);
}

client.login(token);

export { client };
