# Tavily API Setup

## Error: 422 Unprocessable Entity

The error you're seeing is because the Tavily API key is not configured. The web search functionality requires a valid Tavily API key to work.

## How to Fix

1. **Get a Tavily API Key**

   - Go to [https://tavily.com/](https://tavily.com/)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Create a `.env.local` file**
   Create a file named `.env.local` in the root of your project with:

   ```
   TAVILY_API_KEY=your_actual_api_key_here
   ```

3. **Restart your development server**
   After adding the environment variable, restart your Next.js development server for the changes to take effect.

## Alternative: Disable Web Search

If you don't need web search functionality, you can:

1. Remove the `browseWebTool` from the tools in `/src/app/api/chat/route.ts`
2. Or handle the error gracefully in the tool itself

## Environment Variables Required

- `TAVILY_API_KEY` - Required for web search functionality
- Any other API keys your application might need

Note: The `.env.local` file is gitignored and should never be committed to version control.
