"use client";

import Image from "next/image";
import { ChatInput, ChatInputProps } from "@/components/ChatInput";

interface ExamplePrompts {
  title: string;
}

const examplePrompts: ExamplePrompts[] = [
  {
    title: "Who are our top 5 highest value customers?",
  },
  {
    title: "What is the total revenue for the month of May?",
  },
  {
    title: "What is the average order value for our top 10% of spenders?",
  },
];

function ExampleCard({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-transparent border border-border/50 p-4 rounded-lg hover:border-border hover:bg-muted/10 transition-all duration-200 text-left"
    >
      <h4 className="font-medium text-sm text-foreground leading-tight">
        {title}
      </h4>
    </div>
  );
}

interface InitialViewProps {
  fillExample: (text: string) => void;
  chatInputProps: Omit<ChatInputProps, "isFixed">;
}

export function InitialView({ fillExample, chatInputProps }: InitialViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 py-8 bg-background text-foreground relative overflow-hidden">
      {/* Background clouds */}
      <div className="absolute inset-0 w-full h-full"></div>

      {/* Content - positioned above clouds */}
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
          Data Analyst
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 font-normal">
          Designed to help you with{" "}
          <span className="font-semibold italic">your data analysis needs</span>
          .
        </p>

        {/* Chat Input Container - matching the form padding exactly */}
        <div className="w-full max-w-4xl px-4 mb-10">
          {" "}
          {/* Added px-4 to match form padding */}
          <ChatInput {...chatInputProps} isFixed={false} />
        </div>

        {/* Example Cards Container - matching the input container exactly */}
        <div className="w-full max-w-4xl px-4">
          {" "}
          {/* Added px-4 to match input container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {examplePrompts.map((ex) => (
              <ExampleCard
                key={ex.title}
                title={ex.title}
                onClick={() => fillExample(ex.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
