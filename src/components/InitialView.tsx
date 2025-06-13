"use client";

import Image from "next/image";
import { ChatInput, ChatInputProps } from "@/components/ChatInput";

interface ExamplePrompts {
  title: string;
  description: string;
}

const examplePrompts: ExamplePrompts[] = [
  {
    title: "Which campaigns had the most conversions in April 2025?",
    description: "Get a short and quick summary of campaign conversions.",
  },
  {
    title: "Which campaign subject lines generated the most unique clicks?",
    description: "Analyze click rates based on subject lines.",
  },
  {
    title: "Why might our best-performing flows be doing well?",
    description: "Understand the success factors of top flows.",
  },
];

function ExampleCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-[var(--input-background)] p-5 rounded-xl hover:bg-muted/20 transition-all duration-200 text-left"
    >
      <h4 className="font-semibold text-sm text-foreground mb-2 leading-tight">
        {title}
      </h4>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
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
        <p className="text-lg md:text-xl text-muted mb-8 font-medium">
          Designed to help you with{" "}
          <span className="font-black italic">your data analysis needs</span>.
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
                description={ex.description}
                onClick={() => fillExample(ex.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
