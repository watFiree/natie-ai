import type { AgentType } from '../../../prisma/generated/prisma/client';

export type ExtendedAgentType = AgentType | 'chat';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  type: ExtendedAgentType;
  userAgentId: string;
}
