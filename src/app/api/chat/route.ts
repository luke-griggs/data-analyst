import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { queryDbTool } from "../tools/dbTool";
import { chartTool } from "../tools/chartTool";
import { systemPrompt } from "@/prompts/system";
import { browseWebTool } from "../tools/browseWeb";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Helper function to fetch and process file content
async function processAttachments(messages: any[]) {
  const processedMessages = await Promise.all(
    messages.map(async (message) => {
      if (
        message.experimental_attachments &&
        message.experimental_attachments.length > 0
      ) {
        const parts = [];

        // Add the text content if any
        if (message.content) {
          parts.push({ type: "text", text: message.content });
        }

        // Process each attachment
        for (const attachment of message.experimental_attachments) {
          const isImage = attachment.contentType?.startsWith("image/");

          if (isImage) {
            // For images, keep as image type
            parts.push({
              type: "image",
              image: attachment.url,
            });
          } else {
            // For non-image files (CSV, TXT, etc.), fetch and include as text
            try {
              const response = await fetch(attachment.url);
              const content = await response.text();

              parts.push({
                type: "text",
                text: `\n\n[File: ${attachment.name}]\n${content}\n[End of ${attachment.name}]`,
              });
            } catch (error) {
              console.error(`Error fetching file ${attachment.name}:`, error);
              parts.push({
                type: "text",
                text: `\n\n[Error: Could not read file ${attachment.name}]`,
              });
            }
          }
        }

        return {
          ...message,
          content: parts,
          experimental_attachments: undefined, // Remove attachments after processing
        };
      }

      return message;
    })
  );

  return processedMessages;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    // Process attachments to convert non-images to text
    const processedMessages = await processAttachments(messages);

    const result = streamText({
      model: google("gemini-2.5-flash-preview-05-20"),
      messages: convertToCoreMessages(processedMessages, {
        tools: {
          query_database: queryDbTool,
          render_chart: chartTool,
          browse_web: browseWebTool,
        },
      }),

      onError: ({ error }) => {
        console.error("Error during streamText call:", error);
      },
      system: systemPrompt,
      tools: {
        query_database: queryDbTool,
        render_chart: chartTool,
        browse_web: browseWebTool,
      },
    });

    const messagesForModel = convertToCoreMessages(processedMessages, {
      tools: {
        query_database: queryDbTool,
        render_chart: chartTool,
        browse_web: browseWebTool,
      },
    });
    console.dir(messagesForModel, { depth: null });

    return result.toDataStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Error during streamText call:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
