import { FastifyInstance } from "fastify";
import { authHandler } from "../../modules/auth/handler";
import { createAgent } from './agent';
import { createSystemPrompt } from "./system";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage, BaseMessage } from "@langchain/core/messages";
import { LangChainMessageType } from "../../../prisma/generated/prisma/client";
import { Readable } from "stream";
import { GmailOAuthService } from "../../modules/gmail/service";
import { createOAuth2Client } from "../../modules/gmail/clientFactory";
import { GmailAccountRepository } from "../../modules/gmail/repository";
import { createTools } from "./tools/gmail";

interface MessageContent {
  type?: string;
  text?: string;
  [key: string]: unknown;
}

function formatMessageContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((item: MessageContent) => item.text || JSON.stringify(item)).join('\n');
  }
  if (typeof content === 'object' && content !== null) {
    const contentObj = content as MessageContent;
    if (contentObj.text) return contentObj.text;
    return JSON.stringify(content);
  }
  return String(content);
}

function mapDbMessageToLangChain(
  type: LangChainMessageType,
  content: unknown,
  toolCallId?: string | null,
  toolName?: string | null
): BaseMessage {
  const textContent = formatMessageContent(content);

  switch (type) {
    case 'human':
      return new HumanMessage(textContent);
    case 'ai':
      return new AIMessage(textContent);
    case 'system':
      return new SystemMessage(textContent);
    case 'tool':
      return new ToolMessage({
        content: textContent,
        tool_call_id: toolCallId || '',
        name: toolName || undefined,
      });
    default:
      return new HumanMessage(textContent);
  }
}

async function saveMessage(
  prisma: FastifyInstance['prisma'],
  conversationId: string,
  type: LangChainMessageType,
  content: string,
  toolCallId?: string,
  toolName?: string
) {
  return prisma.message.create({
    data: {
      conversationId,
      type,
      content: { text: content },
      toolCallId,
      toolName,
    },
  });
}

export const EmailAgentRouter = async (fastify: FastifyInstance) => {
  fastify.post('/agent', { preHandler: authHandler }, async (req, reply) => {
    if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

    const { message, conversationId } = req.body as { message: string; conversationId?: string };

    // Validate conversation exists if provided
    if (conversationId) {
      const conversation = await fastify.prisma.userAgentConversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }
    }

    // Get settings with labels
    const settings = await fastify.prisma.emailAgentSettings.findFirst({
      where: { userId: req.user.id },
    });

    // Build messages array starting with system prompt
    const systemPrompt = createSystemPrompt(settings?.labels || []);
    const messages: BaseMessage[] = [new SystemMessage(systemPrompt)];

    // Get last 10 messages from conversation history
    if (conversationId) {
      const dbMessages = await fastify.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Add messages in chronological order (reverse the desc results)
      for (const msg of dbMessages.reverse()) {
        messages.push(
          mapDbMessageToLangChain(msg.type, msg.content, msg.toolCallId, msg.toolName)
        );
      }
    }

    // Add current user message
    messages.push(new HumanMessage(message));

    // Save user message to DB if conversation exists
    if (conversationId) {
      await saveMessage(fastify.prisma, conversationId, 'human', message);
    }

    const gmailService = new GmailOAuthService(createOAuth2Client(), new GmailAccountRepository(fastify.prisma));

    const emailAccounts = await fastify.prisma.gmailAccount.findMany({
      where: { userId: req.user.id },
    });

    const tools = createTools(emailAccounts.map((account) => ({ email: account.email, accessToken: () => gmailService.getEnsuredAccessToken(req.user!.id, account.email) })));

    const agent = createAgent(systemPrompt, tools);
    const stream = await agent.stream({ messages }, { streamMode: "values" });

    for await (const event of stream) {
        const messageDetails = event.messages.map((message) => [
          message.type,
          message.content,
        ]);
        console.log(messageDetails);
      }

    reply.header('Content-Type', 'application/octet-stream');
    return reply.send(stream);
  });
};
