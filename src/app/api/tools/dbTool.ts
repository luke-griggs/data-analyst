import pg from "pg";
import { tool } from "ai";
import { z } from "zod";
import dbPrompt from "@/prompts/dbPrompt";

const { Pool } = pg;

// Create a singleton connection pool that persists across requests
let pool: pg.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_SESSION_POOLER_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase SSL
      },
      // Connection pool configuration
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }
  return pool;
}

export const queryDbTool = tool({
  description: dbPrompt,
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    const connectionPool = getPool();
    let client: pg.PoolClient | null = null;

    try {
      client = await connectionPool.connect();

      const queryTimeout = 10000; // 10 seconds timeout

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Query timed out after ${queryTimeout / 1000} seconds`)
            ),
          queryTimeout
        )
      );

      const queryPromise = client.query(query);

      // Race the query against the timeout
      const queryResult = await Promise.race([
        queryPromise,
        timeoutPromise as Promise<pg.QueryResult>,
      ]);

      const resultData = {
        rows: queryResult.rows,
        rowCount: queryResult.rowCount,
        fields: queryResult.fields.map((f) => ({
          name: f.name,
          dataTypeID: f.dataTypeID,
        })),
      };

      return resultData;
    } catch (error) {
      console.error("Database operation error:", error);

      const errorResult = {
        error:
          error instanceof Error ? error.message : "Unknown database error",
        query: query,
      };

      console.log("Returning error:", JSON.stringify(errorResult, null, 2));
      return errorResult;
    } finally {
      // Only release the client back to the pool, don't end the pool
      if (client) {
        client.release();
        console.log("Client released back to pool.");
      }
    }
  },
});
