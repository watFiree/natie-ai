export type AgentRunChannel = 'telegram' | 'web';

export interface AgentLockService {
  acquire(userId: string, channel: AgentRunChannel): Promise<boolean>;
  release(userId: string): Promise<void>;
  getActiveChannel(userId: string): Promise<AgentRunChannel | null>;
}

/**
 * In-memory per-user lock for single-process deployments.
 *
 * Only one active run is allowed per user across all channels. While a run is
 * in progress, any additional request from that user is rejected until release.
 */
export class InMemoryAgentLockService implements AgentLockService {
  private readonly locks = new Map<string, AgentRunChannel>();

  async acquire(userId: string, channel: AgentRunChannel): Promise<boolean> {
    if (this.locks.has(userId)) {
      return false;
    }

    this.locks.set(userId, channel);
    return true;
  }

  async release(userId: string): Promise<void> {
    this.locks.delete(userId);
  }

  async getActiveChannel(userId: string): Promise<AgentRunChannel | null> {
    return this.locks.get(userId) ?? null;
  }
}
