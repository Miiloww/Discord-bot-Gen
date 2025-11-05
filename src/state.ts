import fs from 'fs';
import path from 'path';
import { BotConfig, Service, GeneratedCode, Ticket, UserCooldown, UserGenCooldown, Account, UserStats, GiveawayHistory } from './types';

class BotState {
  private config: BotConfig;
  private services: Map<string, Service>;
  private codes: Map<string, GeneratedCode>;
  private tickets: Map<string, Ticket>;
  private cooldowns: Map<string, UserCooldown>;
  private genCooldowns: Map<string, UserGenCooldown>;
  private genPanelMessages: Set<string>;
  private userStats: Map<string, UserStats>;
  private giveawayHistory: GiveawayHistory[];
  private dataDir: string;
  private configFile: string;
  private servicesFile: string;
  private statsFile: string;
  private giveawayFile: string;

  constructor() {
    this.config = {
      statusText: '',
      requiredRoleId: '',
      vipRoleId: '',
      adminRoleId: '',
      supplierRoleId: '',
      verificationRoleId: '',
      genChannelId: '',
      ticketChannelId: '',
      logChannelId: '',
      restockChannelId: '',
      restockPingRoleId: '',
      normalCooldown: 300000,
      vipCooldown: 60000,
      normalGenCooldown: 300000,
      vipGenCooldown: 300000,
      giveawayConfig: {
        enabled: false,
        minMessages: 100,
        numberOfWinners: 5,
        numberOfAccounts: 1,
        accountType: 'free',
        serviceIds: [],
        guildId: ''
      }
    };
    
    this.services = new Map();
    this.codes = new Map();
    this.tickets = new Map();
    this.cooldowns = new Map();
    this.genCooldowns = new Map();
    this.genPanelMessages = new Set();
    this.userStats = new Map();
    this.giveawayHistory = [];
    
    this.dataDir = path.join(process.cwd(), 'data');
    this.configFile = path.join(this.dataDir, 'config.json');
    this.servicesFile = path.join(this.dataDir, 'services.json');
    this.statsFile = path.join(this.dataDir, 'stats.json');
    this.giveawayFile = path.join(this.dataDir, 'giveaway.json');
    
    this.loadData();
  }

  private loadData(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    if (fs.existsSync(this.configFile)) {
      try {
        const loadedConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.config = { ...this.config, ...loadedConfig };
      } catch (error) {
        console.error('Erreur chargement config:', error);
      }
    }

    if (fs.existsSync(this.servicesFile)) {
      try {
        const servicesData = JSON.parse(fs.readFileSync(this.servicesFile, 'utf8'));
        this.services = new Map(Object.entries(servicesData));
      } catch (error) {
        console.error('Erreur chargement services:', error);
      }
    }

    if (fs.existsSync(this.statsFile)) {
      try {
        const statsData = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
        this.userStats = new Map(Object.entries(statsData));
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      }
    }

    if (fs.existsSync(this.giveawayFile)) {
      try {
        this.giveawayHistory = JSON.parse(fs.readFileSync(this.giveawayFile, 'utf8'));
      } catch (error) {
        console.error('Erreur chargement giveaway history:', error);
      }
    }
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    }
  }

  private saveServices(): void {
    try {
      const servicesObj = Object.fromEntries(this.services);
      fs.writeFileSync(this.servicesFile, JSON.stringify(servicesObj, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde services:', error);
    }
  }

  private saveStats(): void {
    try {
      const statsObj = Object.fromEntries(this.userStats);
      fs.writeFileSync(this.statsFile, JSON.stringify(statsObj, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde stats:', error);
    }
  }

  private saveGiveawayHistory(): void {
    try {
      fs.writeFileSync(this.giveawayFile, JSON.stringify(this.giveawayHistory, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde giveaway history:', error);
    }
  }

  getConfig(): BotConfig {
    return this.config;
  }

  updateConfig(updates: Partial<BotConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  resetConfig(): void {
    this.config = {
      statusText: '',
      requiredRoleId: '',
      vipRoleId: '',
      adminRoleId: '',
      supplierRoleId: '',
      verificationRoleId: '',
      genChannelId: '',
      ticketChannelId: '',
      logChannelId: '',
      restockChannelId: '',
      restockPingRoleId: '',
      normalCooldown: 300000,
      vipCooldown: 60000,
      normalGenCooldown: 300000,
      vipGenCooldown: 300000,
      giveawayConfig: {
        enabled: false,
        minMessages: 100,
        numberOfWinners: 5,
        numberOfAccounts: 1,
        accountType: 'free',
        serviceIds: [],
        guildId: ''
      }
    };
    this.saveConfig();
  }

  addService(id: string, name: string, isVipOnly: boolean, emoji?: string): void {
    this.services.set(id, {
      id,
      name,
      emoji,
      isVipOnly,
      accounts: []
    });
    this.saveServices();
  }

  removeService(id: string): void {
    this.services.delete(id);
    this.saveServices();
  }

  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  getAllServices(): Service[] {
    return Array.from(this.services.values());
  }

  addAccounts(serviceId: string, accounts: Account[]): boolean {
    const service = this.services.get(serviceId);
    if (!service) return false;
    
    service.accounts.push(...accounts);
    this.saveServices();
    return true;
  }

  getAvailableAccount(serviceId: string): Account | null {
    const service = this.services.get(serviceId);
    if (!service) return null;
    
    const account = service.accounts.find(acc => !acc.isUsed);
    return account || null;
  }

  getAccountById(serviceId: string, accountId: string): Account | null {
    const service = this.services.get(serviceId);
    if (!service) return null;
    
    const account = service.accounts.find(acc => acc.id === accountId);
    return account || null;
  }

  markAccountAsUsed(serviceId: string, accountId: string, userId: string): boolean {
    const service = this.services.get(serviceId);
    if (!service) return false;
    
    const account = service.accounts.find(acc => acc.id === accountId);
    if (!account) return false;
    
    account.isUsed = true;
    account.usedBy = userId;
    account.usedAt = new Date().toISOString();
    this.saveServices();
    return true;
  }

  getAvailableAccountCount(serviceId: string): number {
    const service = this.services.get(serviceId);
    if (!service) return 0;
    return service.accounts.filter(acc => !acc.isUsed).length;
  }

  removeAccountsFromService(serviceId: string, count: number): number {
    const service = this.services.get(serviceId);
    if (!service) return 0;
    
    const initialLength = service.accounts.length;
    const toRemove = Math.min(count, initialLength);
    service.accounts.splice(0, toRemove);
    this.saveServices();
    return toRemove;
  }

  clearAllAccounts(serviceId: string): number {
    const service = this.services.get(serviceId);
    if (!service) return 0;
    
    const count = service.accounts.length;
    service.accounts = [];
    this.saveServices();
    return count;
  }

  resetUsedAccounts(serviceId: string): number {
    const service = this.services.get(serviceId);
    if (!service) return 0;
    
    let count = 0;
    service.accounts.forEach(acc => {
      if (acc.isUsed) {
        acc.isUsed = false;
        delete acc.usedBy;
        delete acc.usedAt;
        count++;
      }
    });
    this.saveServices();
    return count;
  }

  generateCode(serviceId: string, userId: string, accountId: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 13; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    this.codes.set(code, {
      code,
      serviceId,
      userId,
      accountId,
      createdAt: new Date().toISOString(),
      used: false
    });
    
    return code;
  }

  getCodeInfo(code: string): GeneratedCode | undefined {
    return this.codes.get(code);
  }

  markCodeAsUsed(code: string): void {
    const codeInfo = this.codes.get(code);
    if (codeInfo) {
      codeInfo.used = true;
    }
  }

  addTicket(channelId: string, userId: string, autoCloseTimeout: NodeJS.Timeout | null): void {
    this.tickets.set(channelId, {
      channelId,
      userId,
      createdAt: new Date().toISOString(),
      autoCloseTimeout
    });
  }

  removeTicket(channelId: string): void {
    const ticket = this.tickets.get(channelId);
    if (ticket && ticket.autoCloseTimeout) {
      clearTimeout(ticket.autoCloseTimeout);
    }
    this.tickets.delete(channelId);
  }

  getTicketByUser(userId: string): Ticket | undefined {
    return Array.from(this.tickets.values()).find(t => t.userId === userId);
  }

  getTicket(channelId: string): Ticket | undefined {
    return this.tickets.get(channelId);
  }

  setCooldown(userId: string): void {
    this.cooldowns.set(userId, {
      userId,
      lastTicketTime: new Date()
    });
  }

  getCooldown(userId: string): UserCooldown | undefined {
    return this.cooldowns.get(userId);
  }

  getRemainingCooldown(userId: string, isVip: boolean): number {
    const cooldown = this.cooldowns.get(userId);
    if (!cooldown) return 0;
    
    const cooldownDuration = isVip ? this.config.vipCooldown : this.config.normalCooldown;
    const elapsed = Date.now() - cooldown.lastTicketTime.getTime();
    const remaining = cooldownDuration - elapsed;
    
    return remaining > 0 ? remaining : 0;
  }

  setGenCooldown(userId: string): void {
    this.genCooldowns.set(userId, {
      userId,
      lastGenTime: new Date()
    });
  }

  getGenCooldown(userId: string): UserGenCooldown | undefined {
    return this.genCooldowns.get(userId);
  }

  getRemainingGenCooldown(userId: string, isVip: boolean): number {
    const cooldown = this.genCooldowns.get(userId);
    if (!cooldown) return 0;
    
    const cooldownDuration = isVip ? this.config.vipGenCooldown : this.config.normalGenCooldown;
    const elapsed = Date.now() - cooldown.lastGenTime.getTime();
    const remaining = cooldownDuration - elapsed;
    
    return remaining > 0 ? remaining : 0;
  }

  addGenPanelMessage(messageId: string): void {
    this.genPanelMessages.add(messageId);
  }

  removeGenPanelMessage(messageId: string): void {
    this.genPanelMessages.delete(messageId);
  }

  getGenPanelMessages(): string[] {
    return Array.from(this.genPanelMessages);
  }

  incrementUserMessageCount(userId: string): void {
    const stats = this.userStats.get(userId);
    if (stats) {
      stats.messageCount++;
      stats.lastMessageDate = new Date().toISOString();
    } else {
      this.userStats.set(userId, {
        userId,
        messageCount: 1,
        lastMessageDate: new Date().toISOString()
      });
    }
    this.saveStats();
  }

  getUserStats(userId: string): UserStats | undefined {
    return this.userStats.get(userId);
  }

  getAllUserStats(): UserStats[] {
    return Array.from(this.userStats.values());
  }

  getTopUsers(minMessages: number, limit: number): UserStats[] {
    return Array.from(this.userStats.values())
      .filter(stats => stats.messageCount >= minMessages)
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, limit);
  }

  resetUserStats(): void {
    this.userStats.clear();
    this.saveStats();
  }

  addGiveawayToHistory(history: GiveawayHistory): void {
    this.giveawayHistory.push(history);
    this.saveGiveawayHistory();
  }

  getGiveawayHistory(): GiveawayHistory[] {
    return this.giveawayHistory;
  }

  updateGiveawayConfig(updates: Partial<typeof this.config.giveawayConfig>): void {
    this.config.giveawayConfig = { ...this.config.giveawayConfig, ...updates };
    this.saveConfig();
  }

  getGiveawayConfig() {
    return this.config.giveawayConfig;
  }
}

export const botState = new BotState();
