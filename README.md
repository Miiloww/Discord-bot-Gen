# Installation du Bot Discord

## Prérequis

- Node.js 18 ou supérieur
- npm ou yarn
- Un bot Discord créé sur le [Discord Developer Portal](https://discord.com/developers/applications)

## Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   
   Éditer le fichier `.env` et remplir les valeurs :
   ```env
   # Discord Bot Token (depuis le Developer Portal)
   DISCORD_BOT_TOKEN=votre_token_ici
   
   # Discord Application Credentials (pour OAuth2)
   DISCORD_CLIENT_ID=votre_client_id_ici
   DISCORD_CLIENT_SECRET=votre_client_secret_ici
   
   # ID du serveur Discord principal
   GUILD_ID=votre_guild_id_ici
   
   # Port (optionnel, par défaut 5000)
   PORT=5000
   ```

4. **Lancer le bot**
   ```bash
   tsx src/index.ts, si besoin faites npm install -g tsx
## Configuration Discord
```
### Comment obtenir les informations nécessaires :
```
1. ```**DISCORD_BOT_TOKEN** : 
   - Aller sur https://discord.com/developers/applications
   - Sélectionner votre application
   - Aller dans "Bot"
   - Cliquer sur "Reset Token" et copier le token

2. ```**DISCORD_CLIENT_ID** :
   - Sur la page de votre application
   - Aller dans "OAuth2" > "General"
   - Copier le "Client ID"

3. ```**DISCORD_CLIENT_SECRET** :
   - Sur la même page "OAuth2" > "General"
   - Copier ou générer un "Client Secret"

4. ```**GUILD_ID** :
   - Dans Discord, activer le mode développeur (Paramètres > Avancé > Mode développeur)
   - Faire clic droit sur votre serveur
   - Cliquer sur "Copier l'identifiant du serveur"

```## Permissions du Bot

Lors de l'invitation du bot, assurez-vous qu'il a les permissions suivantes :
- Gérer les rôles
- Gérer les canaux
- Lire les messages/Voir les salons
- Envoyer des messages
- Créer des invitations
- Voir les membres (intent)
- Lire les présences (intent)
```
## Commandes disponibles
```
- `/panel-custom` - Affiche le panel de configuration (admin)
- `/panel-gen` - Affiche le panel de génération de comptes
- `/panel-ticket` - Affiche le panel de création de tickets
- `/panel-verification` - Affiche le panel de vérification
```
## Structure des données
```
Le bot stocke ses données dans le dossier `data/` :
- `config.json` - Configuration générale
- `services.json` - Services et comptes
- `stats.json` - Statistiques des utilisateurs
- `giveaway.json` - Historique des giveaways
```
## Support
```
Discord : miiloww_.
Pour toute question ou problème, contactez le développeur.
```


```### Système de Statut et Rôles
- Attribution automatique de rôle aux utilisateurs ayant un texte spécifique dans leur statut Discord
- Vérification automatique toutes les 30 secondes
- Retrait du rôle si le statut est modifié
```
### Panel de G3n Principal
```
- Affichage moderne avec Discord Components v2 (ContainerBuilder, SeparatorBuilder)
- Liste de tous les services disponibles avec compteur de stock en temps réel
- Boutons pour chaque service
- Vérification automatique du rôle requis
- Génération de codes uniques (13 caractères alphanumériques)
- Support VIP et Free
```
### Système de Tickets
```
- Création de tickets privés pour récupérer les comptes
- Limite d'1 ticket actif par utilisateur
- Cooldown configurables : 5 minutes (normal) / 1 minute (VIP)
- Validation automatique du code
- Détection automatique du service
- Envoi du compte en message éphémère
- Fermeture automatique après 5 minutes ou manuelle
```
### Panel Custom Administratif
```
- Modifier les cooldowns (s/m/h/j)
- Ajouter/Supprimer des services
- Configurer le salon de restock et le rôle à ping
- Configurer le salon de logs
- Ajouter du stock (format: email:password)
- Supprimer du stock
```
### Notifications de Restock
```
- Envoi automatique dans le salon configuré lors de l'ajout de comptes
- Affichage du service, quantité, type (Free/VIP)
- Ping du rôle configuré
```
### Logs de G3n
```
- Enregistrement de toutes les générations de comptes
- Affichage de l'utilisateur, service et heure
```
Bot créé par **Miiloww**
