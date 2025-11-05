export interface BotConfig {
  statusText: string;
  requiredRoleId: string;
  vipRoleId: string;
  adminRoleId: string;
  supplierRoleId: string;
  verificationRoleId: string;
  genChannelId: string;
  ticketChannelId: string;
  logChannelId: string;
  restockChannelId: string;
  restockPingRoleId: string;
  normalCooldown: number;
  vipCooldown: number;
  normalGenCooldown: number;
  vipGenCooldown: number;
  giveawayConfig: GiveawayConfig;
}

export const EMOJIS = {
  verified: '<:3590verifiedwhite:1430379473466949713>',
  crown: '<:4007crown:1430379474901405838>',
  developer: '<:developer:1430379506060890143>',
  tools: '<:tools:1430379477518651473>',
  pin: '<:whitepin:1430379451685797981>',
  staff: '<:staffwhite:1430379478533800087>',
  externalLink: '<:ttsexternallink:1430379513514295296>',
  members: '<:members:1430379518832545855>',
  dot: '<:whitesmalldot:1430379480135762091>',
  shoppingCart: '<:shoppingcart:1430379490370129961>',
  star: '<:star:1430379509475184660>',
  stopwatch: '<:stopwatch:1430379477518651473>',
} as const;

export interface GiveawayConfig {
  enabled: boolean;
  minMessages: number;
  numberOfWinners: number;
  numberOfAccounts: number;
  accountType: 'vip' | 'free' | 'both';
  serviceIds: string[];
  guildId: string;
  lastGiveawayDate?: string;
}

export interface Service {
  id: string;
  name: string;
  emoji?: string;
  isVipOnly: boolean;
  accounts: Account[];
}

export interface Account {
  id: string;
  email: string;
  password: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
}

export interface GeneratedCode {
  code: string;
  serviceId: string;
  userId: string;
  accountId: string;
  createdAt: string;
  used: boolean;
}

export interface Ticket {
  channelId: string;
  userId: string;
  createdAt: string;
  autoCloseTimeout: NodeJS.Timeout | null;
}

export interface UserCooldown {
  userId: string;
  lastTicketTime: Date;
}

export interface UserGenCooldown {
  userId: string;
  lastGenTime: Date;
}

export interface UserStats {
  userId: string;
  messageCount: number;
  lastMessageDate: string;
}

export interface GiveawayHistory {
  id: string;
  date: string;
  winners: GiveawayWinner[];
  config: GiveawayConfig;
}

export interface GiveawayWinner {
  userId: string;
  messageCount: number;
  accountsReceived: {
    serviceId: string;
    serviceName: string;
    email: string;
    password: string;
  }[];
}
