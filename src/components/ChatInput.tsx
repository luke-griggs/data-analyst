"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UploadModal } from "./UploadModal";
import { AttachFileModal } from "./AttachFileModal";

type ChatMode = "analysis" | "audit";

export interface AttachedFile {
  file: File;
  fileUrl: string;
  id: string;
  contentType?: string;
  uploadedAt?: string;
}

export interface ChatInputProps {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    attachedFiles?: AttachedFile[],
    searchMode?: boolean
  ) => void;
  disabled: boolean;
  chatMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  isFixed?: boolean; // New prop for positioning
  onFileAttach: (file: File, fileUrl: string) => void;
  searchMode?: boolean;
  onSearchModeChange?: (searchMode: boolean) => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  chatMode,
  onModeChange,
  isFixed = true, // Default to true
  onFileAttach,
  searchMode = false,
  onSearchModeChange,
}: ChatInputProps) {
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const toggleMode = () => {
    onModeChange(chatMode === "analysis" ? "audit" : "analysis");
  };

  const toggleSearchMode = () => {
    const newSearchMode = !searchMode;
    onSearchModeChange?.(newSearchMode);
  };

  const handleFileAttachInternal = (file: File, fileUrl: string) => {
    const newAttachedFile: AttachedFile = {
      file,
      fileUrl,
      id: `${Date.now()}-${Math.random()}`,
    };
    setAttachedFiles((prev) => [...prev, newAttachedFile]);
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
        </svg>
      );
    }

    if (extension === "pdf") {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }

    if (["csv", "xls", "xlsx"].includes(extension || "")) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          <path d="M8,12V14H16V12H8M8,16V18H13V16H8Z" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  };

  // Create a ref for the textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height automatically
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight measurement
    textarea.style.height = "auto";

    // Calculate new height (clamped between min and max height)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
    textarea.style.height = `${newHeight}px`;

    // Show/hide scrollbar based on content height
    textarea.style.overflowY = textarea.scrollHeight > 200 ? "auto" : "hidden";
  }, []);

  // Adjust height whenever input value changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  // Custom handler for textarea to handle multiline input
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Create a new synthetic event instead of trying to cast
    // as the originalHandleInputChange expects a specific event type.
    const newEvent = {
      target: {
        value: e.target.value,
      },
      preventDefault: e.preventDefault,
      stopPropagation: e.stopPropagation,
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(newEvent);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (but not when Shift is pressed)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachedFiles.length > 0) && !disabled) {
        onSubmit(
          e as unknown as React.FormEvent<HTMLFormElement>,
          attachedFiles,
          searchMode
        );
        setAttachedFiles([]); // Clear attached files after submit
      }
    }
    // Allow Shift+Enter to insert a new line (default behavior)
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((value.trim() || attachedFiles.length > 0) && !disabled) {
      onSubmit(e, attachedFiles, searchMode);
      setAttachedFiles([]); // Clear attached files after submit
    }
  };

  const wrapperClasses = isFixed
    ? "fixed bottom-6 left-6 right-6 z-10" // Removed background and border, added margin from edges
    : "w-full"; // When not fixed, parent controls width/centering

  const formClasses = `flex relative ${
    isFixed ? "max-w-4xl mx-auto" : "max-w-4xl mx-auto" // Consistent max-width
  }`;

  return (
    <div className={wrapperClasses}>
      <form onSubmit={handleFormSubmit} className={formClasses}>
        <div className="w-full bg-input rounded-xl border border-border/50 shadow-sm">
          {/* File attachments preview */}
          {attachedFiles.length > 0 && (
            <div className="px-4 pt-3 pb-2">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((attachedFile) => (
                  <div
                    key={attachedFile.id}
                    className="flex items-center gap-2 bg-muted/20 border border-muted/30 rounded-lg px-3 py-2 text-sm text-foreground"
                  >
                    <div className="text-accent">
                      {getFileIcon(attachedFile.file.name)}
                    </div>
                    <span className="max-w-[200px] truncate">
                      {attachedFile.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachedFile(attachedFile.id)}
                      className="text-muted hover:text-foreground transition-colors"
                      title="Remove file"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Textarea container */}
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={searchMode ? "Search the web..." : "Ask anything"}
              disabled={disabled}
              rows={1}
              className={`w-full px-6 bg-transparent outline-none resize-none leading-tight align-middle overflow-hidden text-foreground placeholder-muted-foreground ${
                isFixed
                  ? "py-5 min-h-[80px] max-h-[200px]"
                  : "py-6 min-h-[80px] max-h-[200px] text-lg"
              }`}
              style={{
                boxShadow: "none",
                caretColor: "#10a37f",
              }}
            />
          </div>

          {/* Buttons container - positioned below textarea */}
          <div className="flex items-center justify-between px-4 pb-4">
            {/* Left side - File upload and Search buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowAttachModal(true)}
                disabled={disabled}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                  disabled
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20 cursor-pointer"
                }`}
                title="Attach files"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={toggleSearchMode}
                className={`h-8 px-3 rounded-md text-xs font-medium transition-all duration-200 flex items-center cursor-pointer ${
                  searchMode
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
                title={searchMode ? "Disable web search" : "Enable web search"}
              >
                <svg
                  className="w-3.5 h-3.5 mr-1.5"
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
                Search
              </button>
            </div>

            {/* Right side - Voice and Send buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-muted-foreground hover:text-foreground hover:bg-muted/20 cursor-pointer"
                title="Voice input"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2v6.2c0 .66-.54 1.2-1.2 1.2s-1.2-.54-1.2-1.2V4.9zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={
                  disabled || (!value.trim() && attachedFiles.length === 0)
                }
                className={`flex items-center justify-center w-8 h-8 rounded-md ${
                  disabled || (!value.trim() && attachedFiles.length === 0)
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-white bg-white/10 hover:bg-white/20 cursor-pointer"
                } transition-all`}
                title="Send message"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modals */}
      {showAttachModal && (
        <AttachFileModal
          isOpen={showAttachModal}
          onClose={() => setShowAttachModal(false)}
          onFileAttach={handleFileAttachInternal}
        />
      )}

      {/* Disclaimer message */}
      <div className="text-center mt-1 mb-1">
        <p className="text-xs text-muted-foreground/60">
          This model can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
