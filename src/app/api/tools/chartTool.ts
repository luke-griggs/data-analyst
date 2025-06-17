import { z } from "zod";
import { tool } from "ai";
import { renderChartPrompt } from "@/prompts/renderChartPrompt";

export const chartTool = tool({
  description: `Create beautiful, responsive charts using shadcn/ui components. Use the multi-series data format for comparing multiple metrics. Single-series bar charts automatically use different colors for each bar to emphasize categories. ${renderChartPrompt}`,
  parameters: z.object({
    spec: z
      .object({
        mark: z
          .string()
          .describe("Chart type: 'bar', 'line', 'area', or 'arc'/'pie'"),
        title: z
          .string()
          .optional()
          .describe("Chart title - always include for context"),
        description: z
          .string()
          .optional()
          .describe("Chart description - helps users understand the data"),
        data: z
          .object({
            values: z
              .string()
              .describe(
                "JSON string containing array of data objects. For multi-series, include all numeric fields in each object"
              ),
          })
          .describe("Chart data - use multi-series format when possible"),
        encoding: z
          .object({
            x: z
              .object({
                field: z.string().describe("Field name for x-axis"),
                type: z
                  .enum(["nominal", "quantitative", "temporal", "ordinal"])
                  .describe("Data type"),
              })
              .optional(),
            y: z
              .object({
                field: z.string().describe("Field name for y-axis"),
                type: z
                  .enum(["nominal", "quantitative", "temporal", "ordinal"])
                  .describe("Data type"),
              })
              .optional(),
            theta: z
              .object({
                field: z.string().describe("Field name for pie chart values"),
                type: z
                  .enum(["quantitative"])
                  .describe("Must be quantitative for pie charts"),
              })
              .optional(),
            color: z
              .object({
                field: z.string().describe("Field name for color grouping"),
                type: z
                  .enum(["nominal", "ordinal"])
                  .describe("Data type for color field"),
              })
              .optional(),
          })
          .describe(
            "Chart encoding - for multi-series bar/line charts, only specify x field"
          ),
      })
      .describe("Vega-Lite specification optimized for shadcn/ui rendering"),
  }),
  execute: async ({ spec }) => {
    console.log("chartTool rendering:", JSON.stringify(spec, null, 2));

    // Parse the values string back to array
    let parsedValues;
    try {
      parsedValues = JSON.parse(spec.data.values);
    } catch (error) {
      throw new Error("Invalid JSON format in data.values");
    }

    // Create the actual spec with parsed values
    const actualSpec = {
      ...spec,
      data: {
        ...spec.data,
        values: parsedValues,
      },
    };

    // Validate that we have required fields
    if (!actualSpec.mark) {
      throw new Error("Chart spec must include a 'mark' field");
    }

    if (!actualSpec.data?.values || actualSpec.data.values.length === 0) {
      throw new Error("Chart spec must include data with values array");
    }

    // Validate chart type
    const validMarks = ["bar", "line", "area", "arc", "pie"];
    if (!validMarks.includes(actualSpec.mark)) {
      throw new Error(
        `Invalid chart type '${
          actualSpec.mark
        }'. Must be one of: ${validMarks.join(", ")}`
      );
    }

    // Encourage best practices
    if (!actualSpec.title) {
      console.warn("Chart should include a title for better context");
    }

    if (!actualSpec.description) {
      console.warn(
        "Chart should include a description for better accessibility"
      );
    }

    // Check for multi-series data structure
    const firstDataPoint = actualSpec.data.values[0];
    const numericFields = Object.keys(firstDataPoint).filter(
      (key) => typeof firstDataPoint[key] === "number"
    );

    if (numericFields.length > 1) {
      console.log(
        `Multi-series chart detected with fields: ${numericFields.join(", ")}`
      );
    }

    return { spec: actualSpec };
  },
});
