import { z } from "zod";
import { tool } from "ai";

export const browseWebTool = tool({
  description:
    "Search the web for information using Tavily API. Always provide a specific search query. Returns relevant search results with content snippets.",
  parameters: z.object({
    query: z
      .string()
      .min(1)
      .describe("The search query to execute - REQUIRED, cannot be empty"),
    topic: z
      .string()
      .optional()
      .describe(
        "The category of search - 'news' for current events, 'general' for broader searches"
      ),
    search_depth: z
      .string()
      .optional()
      .describe(
        "Search depth - 'basic' for generic results, 'advanced' for more relevant content"
      )
      .default("basic"),
    max_results: z
      .number()
      .min(1)
      .max(20)
      .default(5)
      .describe("Maximum number of search results to return"),
    include_raw_content: z
      .boolean()
      .default(false)
      .describe("Include cleaned HTML content from search results"),
    time_range: z
      .enum(["day", "week", "month", "year"])
      .optional()
      .describe(
        "Filter results by time range (for news topic only) options: day, week, month, year"
      ),
    days: z
      .number()
      .min(1)
      .default(7)
      .describe(
        "Number of days back to include (for news topic only) options: 1, 7, 30, 90, 180, 365"
      ),
  }),
  execute: async ({ query, topic, include_raw_content, time_range, days }) => {
    // Validate that query is provided and not empty
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        error: "Search query is required and cannot be empty",
        query: query || "",
      };
    }

    try {
      const requestBody = {
        query,
        topic,
        search_depth: "basic",
        chunks_per_source: 3,
        max_results: 5,
        time_range: time_range || null,
        days: days || null,
        include_raw_content,
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
        query,
        answer: data.answer || null,
        results: data.results || [],
        total_results: data.results?.length || 0,
      };
    } catch (error) {
      console.error("Web search error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        query,
      };
    }
  },
});
