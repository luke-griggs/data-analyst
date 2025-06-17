import { MessagePart, DatabaseResult } from "@/components/MessageComponents";

export interface NormalisedToolResult {
  spec?: Record<string, unknown>;
  db?: DatabaseResult;
  cdnUrl?: string;
}

export function getToolResult(part: MessagePart): NormalisedToolResult | null {
  if (part.toolInvocation?.state === "result") {
    if (part.toolInvocation?.toolName === "render_chart") {
      return { spec: part.toolInvocation.result.spec };
    }
    if (part.toolInvocation?.toolName === "query_database") {
      return { db: part.toolInvocation.result };
    }
  }

  return null;
}
