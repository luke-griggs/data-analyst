"use client";

export const ToolStatus = ({ toolName }: { toolName: string }) => {
  let statusText = "Thinking...";
  let icon = (
    <svg
      className="h-6 w-6 animate-spin mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  if (toolName === "browse_web") {
    statusText = "Searching...";
    icon = (
      <svg
        className="h-5 w-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );
  }

  if (toolName === "query_database") {
    statusText = `Searching database...`;
    icon = (
      <svg
        className="h-5 w-5 mr-2 animate-pulse"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    );
  }

  // Create the wave animation for "Searching..."
  const renderAnimatedText = (text: string) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className="inline-block wave-text"
        style={{
          animationDelay: `${index * 0.08}s`,
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  if (toolName === "browse_web" || toolName === "query_database") {
    return (
      <div className="flex items-center text-sm text-muted">
        {icon}
        <span className="text-sm text-white">
          {renderAnimatedText(statusText)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-muted">
      <h1 className="text-sm text-muted">{statusText}</h1>
    </div>
  );
};
