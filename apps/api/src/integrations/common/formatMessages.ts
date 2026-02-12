import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from 'langchain';
import { LangChainMessageType } from '../../../prisma/generated/prisma/client';

type TextContent = { text?: string };

function formatMessageContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item: unknown) => {
        const textItem = item as TextContent;
        return textItem.text || JSON.stringify(item);
      })
      .join('\n');
  }
  if (typeof content === 'object' && content !== null) {
    const contentObj = content as TextContent;
    if (contentObj.text) return contentObj.text;
    return JSON.stringify(content);
  }
  return String(content);
}

export function mapInternalMessageToLangChain(
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
