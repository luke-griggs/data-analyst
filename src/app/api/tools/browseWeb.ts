import { z } from "zod";
import { tool } from "ai";

export const browseWebTool = tool({
  description: `Search the web for real-time information using Tavily API. This tool is perfect for:
- Getting current news and events (use topic: "news")
- Finding general information on any topic (use topic: "general") 
- Research and fact-checking
- Getting recent updates on specific subjects

IMPORTANT: Always provide a specific search query. Examples:
- "latest AI developments 2024"
- "current stock market trends"
- "who won the World Cup 2024"
- "climate change recent reports"

The tool returns ranked search results with content snippets and can optionally include an AI-generated answer.`,

  parameters: z.object({
    query: z.string().min(1)
      .describe(`The search query to execute with Tavily. Be specific and descriptive.
Examples: "who is Leo Messi?", "latest developments in artificial intelligence", "current inflation rates USA 2024"`),

    topic: z.enum(["general", "news"]).default("general")
      .describe(`Category of search:
- "news": For real-time updates, politics, sports, current events from mainstream media
- "general": For broader searches across diverse sources (default)`),

    search_depth: z.enum(["basic", "advanced"]).default("basic")
      .describe(`Search depth:
- "basic": Generic content snippets, faster, costs 1 credit (default)
- "advanced": More relevant content with better snippets, costs 2 credits`),
  }),

  execute: async ({
    query,
    topic = "general",
    search_depth = "basic",
  }) => {
    // Validate that query is provided and not empty
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        error:
          "Search query is required and cannot be empty. Please provide a specific search term or question.",
        query: query || "",
      };
    }

    try {
      const requestBody = {
        query: query.trim(),
        topic,
        search_depth,
      };

      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      };

      const response = await fetch("https://api.tavily.com/search", options);

      if (!response.ok) {
        throw new Error(
          `Tavily API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        query: data.query || query,
        answer: data.answer || null,
        results: data.results || [],
        response_time: data.response_time || null,

      };
    } catch (error) {
      console.error("Web search error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during web search",
        query,
      };
    }
  },
});
