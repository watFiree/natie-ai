export type AgentRunChannel = 'telegram' | 'web';

export interface AgentLockService {
  acquire(userId: string, channel: AgentRunChannel): Promise<boolean>;
  release(userId: string): Promise<void>;
}

type LockEntry = {
  channel: AgentRunChannel;
  count: number;
};

/**
 * In-memory per-user lock for single-process deployments.
 *
 * Re-entrant acquisition is allowed for the same channel so rapid back-to-back
 * messages in one channel do not deadlock each other, while the other channel
 * stays blocked until all active runs complete.
 */
export class InMemoryAgentLockService implements AgentLockService {
  private readonly locks = new Map<string, LockEntry>();

  async acquire(userId: string, channel: AgentRunChannel): Promise<boolean> {
    const current = this.locks.get(userId);

    if (!current) {
      this.locks.set(userId, { channel, count: 1 });
      return true;
    }

    if (current.channel !== channel) {
      return false;
    }

    current.count += 1;
    this.locks.set(userId, current);
    return true;
  }

  async release(userId: string): Promise<void> {
    const current = this.locks.get(userId);
    if (!current) return;

    current.count -= 1;
    if (current.count <= 0) {
      this.locks.delete(userId);
      return;
    }

    this.locks.set(userId, current);
  }
}
