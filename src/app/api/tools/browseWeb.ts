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

    max_results: z
      .number()
      .min(0)
      .max(20)
      .default(5)
      .describe(
        "Maximum number of search results to return (0-20). Default: 5"
      ),

    include_raw_content: z
      .boolean()
      .default(false)
      .describe(
        "Include cleaned HTML content from search results. Set to true for detailed content analysis."
      ),

    time_range: z.enum(["day", "week", "month", "year"]).optional()
      .describe(`Filter results by recency. Options:
- "day": Last 24 hours
- "week": Last 7 days  
- "month": Last 30 days
- "year": Last 365 days
Useful for finding recent information on trending topics.`),

    days: z
      .number()
      .min(1)
      .default(7)
      .describe(
        "For news topic only: Number of days back to search (minimum 1). Default: 7 days"
      ),

    include_answer: z
      .boolean()
      .default(true)
      .describe(
        "Include an AI-generated answer summary. Highly recommended for direct answers to questions."
      ),
  }),

  execute: async ({
    query,
    topic = "general",
    search_depth = "basic",
    max_results = 5,
    include_raw_content = false,
    time_range,
    days = 7,
    include_answer = true,
  }) => {
    // Check if API key is configured
    if (!process.env.TAVILY_API_KEY) {
      return {
        success: false,
        error:
          "Tavily API key is not configured. Please set TAVILY_API_KEY in your environment variables. See TAVILY_API_SETUP.md for instructions.",
        query: query || "",
      };
    }

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
        max_results,
        include_answer,
        include_raw_content,
        time_range: time_range || null,
        days: topic === "news" ? days : null,
        include_images: false,
        include_image_descriptions: false,
        include_domains: [],
        exclude_domains: [],
        country: null,
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
        total_results: data.results?.length || 0,
        response_time: data.response_time || null,
        search_params: {
          topic,
          search_depth,
          max_results,
          time_range: time_range || "all",
        },
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
