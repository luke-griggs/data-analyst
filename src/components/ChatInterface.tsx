// app/components/ChatInterface.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { useMessages } from "@/hooks/use-messages";
import {
  MessageBubble,
  Thinking,
  MessagePart,
} from "@/components/MessageComponents";
import { InitialView } from "@/components/InitialView";
import {
  ChatInput,
  ChatInputProps,
  AttachedFile,
} from "@/components/ChatInput";
import { getToolResult } from "@/app/utils/chat";
import { ToolStatus } from "./ToolStatus";

// Custom scrollbar styles
const scrollbarStyles = `
  .chat-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .chat-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .chat-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 4px;
  }
  
  .chat-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: var(--muted);
  }
  
  /* Firefox scrollbar */
  .chat-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
`;

// Component to display SQL query during execution
const SqlQueryBox = ({ query }: { query: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-5xl mx-auto px-6 mb-4"
    >
      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Executing SQL Query
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            PostgreSQL
          </div>
        </div>
        <div className="p-4">
          <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap overflow-x-auto">
            {query}
          </pre>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

type ChatMode = "analysis" | "audit";

export default function ChatInterface() {
  /* --------------------------- chat state -------------------------- */
  const [chatMode, setChatMode] = useState<ChatMode>("analysis");

  const {
    messages,
    input,
    handleInputChange: originalHandleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setInput,
    status,
  } = useChat({
    api: "/api/chat",
    maxSteps: 15,
    body: {
      chatMode,
    },
  });

  // Inject custom scrollbar styles
  useEffect(() => {
    // Check if styles are already injected
    if (document.getElementById("chat-scrollbar-styles")) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = "chat-scrollbar-styles";
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);

    return () => {
      const existingStyle = document.getElementById("chat-scrollbar-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Custom input handler that works with both input and textarea elements
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    originalHandleInputChange(e as React.ChangeEvent<HTMLInputElement>);
  };

  // Wrap handleSubmit to include chatMode and handle file attachments
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    attachedFiles?: AttachedFile[]
  ) => {
    e.preventDefault();

    // Convert AttachedFile[] to the format expected by Vercel AI SDK
    const experimental_attachments = attachedFiles?.map((af) => ({
      name: af.file.name,
      contentType: af.file.type,
      url: af.fileUrl,
    }));

    // Use the Vercel AI SDK's experimental_attachments feature
    originalHandleSubmit(e, {
      experimental_attachments,
    });
  };

  // Use the new scroll management hooks
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({ chatId: "", status: isLoading ? "streaming" : "ready" });

  const lastMessage = messages[messages.length - 1];
  const activeTool =
    lastMessage?.role === "assistant" &&
    lastMessage.toolInvocations &&
    !lastMessage.content // If there is no content, the tool is still running
      ? lastMessage.toolInvocations.find(
          (tool) => tool.toolName === "browse_web"
        )
      : undefined;

  // Check for active SQL query execution
  const activeSqlQuery =
    lastMessage?.role === "assistant" && lastMessage.toolInvocations
      ? lastMessage.toolInvocations.find(
          (tool) => tool.toolName === "query_database" && tool.state === "call"
        )
      : undefined;

  /* --------------------------- helpers ---------------------------- */
  const fillExample = (text: string) => setInput(text);

  const handleFileAttach = (file: File, fileUrl: string) => {
    // This is a placeholder. You can implement logic to handle the attached file here.
    console.log("File attached:", file.name, fileUrl);
  };

  const chatInputSharedProps: Omit<ChatInputProps, "isFixed"> = {
    value: input,
    onChange: handleInputChange,
    onSubmit: handleSubmit,
    disabled: isLoading,
    chatMode,
    onModeChange: setChatMode,
    onFileAttach: handleFileAttach,
  };

  if (messages.length === 0 && !isLoading) {
    // Show InitialView if no messages and not initially loading
    return (
      <InitialView
        fillExample={fillExample}
        chatInputProps={chatInputSharedProps}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden chat-interface">
      {/* --- scrollable message pane --- */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-scroll z-10 chat-scrollbar"
      >
        <div className="max-w-5xl mx-auto pt-6 pb-40">
          <div className="p-6 space-y-6 font-medium">
            {messages.map((msg, idx) => {
              // Only render the message bubble if it has content to display
              const hasContent = msg.parts?.some((part: MessagePart) => {
                if (part.type === "text" && part.text && part.text.trim()) {
                  return true;
                }
                const res = getToolResult(part as MessagePart);
                return res?.spec || res?.db;
              });

              // Don't render empty bubbles
              if (!hasContent) {
                return null;
              }

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  requiresScrollPadding={
                    hasSentMessage && idx === messages.length - 1
                  }
                />
              );
            })}

            {/* Show SQL query box when query_database tool is executing */}
            {activeSqlQuery && (
              <SqlQueryBox query={activeSqlQuery.args.query} />
            )}

            {isLoading && activeTool?.toolName && (
              <ToolStatus toolName={activeTool.toolName} />
            )}
            {isLoading &&
              !activeTool &&
              !activeSqlQuery &&
              messages.length > 0 && <Thinking />}

            {/* Scroll target for streaming responses */}
            <motion.div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
              onViewportEnter={onViewportEnter}
              onViewportLeave={onViewportLeave}
            />
          </div>
        </div>
      </div>

      {/* Input bar pinned to the bottom of the flex column */}
      <ChatInput {...chatInputSharedProps} isFixed={false} />
    </div>
  );
}
