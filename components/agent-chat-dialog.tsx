"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  Settings,
  RefreshCw,
  Wrench,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AgentDetail } from "@/types/observability";

interface AgentChatDialogProps {
  agent: AgentDetail;
  isOpen: boolean;
  onClose: () => void;
}

interface MessagePart {
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
}

interface ToolCall {
  id: string;
  name: string;
  status: "pending" | "input-available" | "completed";
  input?: Record<string, any>;
  output?: Record<string, any>;
  isExpanded?: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
  timestamp: Date;
  toolCalls?: ToolCall[];
  images?: string[];
}

// Tool Call Display Component
function ToolCallDisplay({
  toolCall,
  onToggle,
}: {
  toolCall: ToolCall;
  onToggle: () => void;
}) {
  const isCompleted = toolCall.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 rounded-xl border border-slate-700/50 bg-slate-900/30 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-emerald-400">
              tool-{toolCall.name}
            </span>
            {isCompleted && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">Completed</span>
              </div>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: toolCall.isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {toolCall.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Parameters */}
              {toolCall.input && (
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                    Parameters
                  </div>
                  <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/30">
                    <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(toolCall.input, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Result */}
              {toolCall.output && (
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                    Result
                  </div>
                  <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/30">
                    <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(toolCall.output, null, 2)}
                    </pre>
                  </div>

                  {/* Download button */}
                  <div className="flex justify-end mt-2">
                    <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                      <ChevronDown className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AgentChatDialog({
  agent,
  isOpen,
  onClose,
}: AgentChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingToolCalls, setStreamingToolCalls] = useState<ToolCall[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [conversationId] = useState(() =>
    Math.random().toString(36).substring(2, 15)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, streamingToolCalls]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const generateMessageId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const handleClearChat = () => {
    setMessages([]);
    setStreamingMessage("");
    setStreamingToolCalls([]);
    setSelectedImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imagePromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      setSelectedImages((prev) => [...prev, ...images]);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleToolCall = (messageId: string, toolCallId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId && msg.toolCalls) {
          return {
            ...msg,
            toolCalls: msg.toolCalls.map((tc) =>
              tc.id === toolCallId ? { ...tc, isExpanded: !tc.isExpanded } : tc
            ),
          };
        }
        return msg;
      })
    );
  };

  const toggleStreamingToolCall = (toolCallId: string) => {
    setStreamingToolCalls((prevTools) =>
      prevTools.map((tc) =>
        tc.id === toolCallId ? { ...tc, isExpanded: !tc.isExpanded } : tc
      )
    );
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && selectedImages.length === 0) || isLoading)
      return;

    const parts: MessagePart[] = [];

    // Add text if available
    if (inputValue.trim()) {
      parts.push({ type: "text", text: inputValue.trim() });
    }

    // Add images if available
    selectedImages.forEach((img) => {
      parts.push({ type: "image", imageUrl: img });
    });

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      parts,
      timestamp: new Date(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setSelectedImages([]);
    setIsLoading(true);
    setStreamingMessage("");

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `http://localhost:3141/agents/${agent.id}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            input: messages.concat(userMessage).map((msg) => ({
              parts: msg.parts,
              id: msg.id,
              role: msg.role,
            })),
            options: {
              conversationId: conversationId,
              temperature: 0.7,
              maxTokens: 4000,
              maxSteps: 10,
            },
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let toolCalls: ToolCall[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);

              if (data === "[DONE]") {
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Handle tool call events
                if (parsed.type === "tool-input-start") {
                  const newToolCall: ToolCall = {
                    id: parsed.toolCallId,
                    name: parsed.toolName,
                    status: "pending",
                    isExpanded: true,
                  };
                  toolCalls.push(newToolCall);
                  setStreamingToolCalls([...toolCalls]);
                } else if (parsed.type === "tool-input-delta") {
                  const toolCall = toolCalls.find(
                    (tc) => tc.id === parsed.toolCallId
                  );
                  if (toolCall && !toolCall.input) {
                    // Store the input delta (we'll parse it when available)
                    setStreamingToolCalls([...toolCalls]);
                  }
                } else if (parsed.type === "tool-input-available") {
                  const toolCall = toolCalls.find(
                    (tc) => tc.id === parsed.toolCallId
                  );
                  if (toolCall) {
                    toolCall.input = parsed.input;
                    toolCall.status = "input-available";
                    setStreamingToolCalls([...toolCalls]);
                  }
                } else if (parsed.type === "tool-output-available") {
                  const toolCall = toolCalls.find(
                    (tc) => tc.id === parsed.toolCallId
                  );
                  if (toolCall) {
                    toolCall.output = parsed.output;
                    toolCall.status = "completed";
                    setStreamingToolCalls([...toolCalls]);
                  }
                }
                // Handle text streaming
                else if (parsed.type === "text-delta" || parsed.delta) {
                  const deltaText = parsed.delta?.text || parsed.delta || "";
                  assistantText += deltaText;
                  setStreamingMessage(assistantText);
                } else if (parsed.type === "content" || parsed.text) {
                  const text = parsed.text || parsed.content || "";
                  assistantText += text;
                  setStreamingMessage(assistantText);
                }
              } catch (e) {
                // Skip invalid JSON
                console.warn("Failed to parse SSE data:", data);
              }
            }
          }
        }
      }

      // Create final assistant message
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        parts: [{ type: "text", text: assistantText || "I'm here to help!" }],
        timestamp: new Date(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage("");
      setStreamingToolCalls([]);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
        return;
      }

      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Sorry, I encountered an error. Please try again.",
          },
        ],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingMessage("");
      setStreamingToolCalls([]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-4xl h-[80vh] bg-linear-to-b from-slate-900 to-[#0a0f1e] rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dot Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #10b981 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                opacity: 0.1,
              }}
            />
          </div>

          {/* Header */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-10 h-10 bg-linear-to-br from-emerald-500/30 to-emerald-600/20 rounded-xl flex items-center justify-center ring-2 ring-emerald-500/30"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      AI Playground
                    </h3>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm text-slate-400">
                    {agent.name} • {agent.model}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearChat}
                  title="Clear conversation"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                </motion.button>
                <motion.button
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors group"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                </motion.button>
              </div>
            </div>

            {/* Memory Warning */}
            {!agent.memory && (
              <motion.div
                className="mt-4 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-xs">⚠</span>
                </div>
                <span className="text-sm text-amber-400">Memory disabled</span>
                <button className="ml-auto px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-md font-medium transition-colors">
                  Enable memory
                </button>
              </motion.div>
            )}
          </div>

          {/* Messages Area */}
          <div className="relative flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 && !streamingMessage ? (
              <div className="h-full flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-linear-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl flex items-center justify-center mb-4"
                >
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Start a conversation with {agent.name}
                </h3>
                <p className="text-slate-400 text-sm text-center max-w-md">
                  Messages will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center mr-3 shrink-0 ring-1 ring-emerald-500/30">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      {/* Tool Calls */}
                      {message.role === "assistant" &&
                        message.toolCalls &&
                        message.toolCalls.length > 0 && (
                          <div className="mb-3">
                            {message.toolCalls.map((toolCall) => (
                              <ToolCallDisplay
                                key={toolCall.id}
                                toolCall={toolCall}
                                onToggle={() =>
                                  toggleToolCall(message.id, toolCall.id)
                                }
                              />
                            ))}
                          </div>
                        )}

                      {/* Message Content */}
                      <div
                        className={`rounded-2xl px-5 py-3 ${
                          message.role === "user"
                            ? "bg-linear-to-br from-emerald-500 to-emerald-600 text-white"
                            : "bg-slate-800/50 text-slate-100 border border-slate-700/50"
                        }`}
                      >
                        {/* Images */}
                        {message.images && message.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {message.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Attachment ${idx + 1}`}
                                className="max-w-[200px] max-h-[200px] rounded-lg object-cover border-2 border-white/10"
                              />
                            ))}
                          </div>
                        )}

                        {/* Text */}
                        {message.parts.some(
                          (p) => p.type === "text" && p.text
                        ) && (
                          <div className="text-sm leading-relaxed">
                            {message.role === "assistant" ? (
                              <div
                                className="prose prose-invert prose-sm max-w-none
                                prose-headings:text-slate-100 prose-headings:font-bold
                                prose-p:text-slate-200 prose-p:leading-relaxed prose-p:my-2
                                prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-slate-100 prose-strong:font-semibold
                                prose-code:text-emerald-400 prose-code:bg-slate-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                                prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700/50 prose-pre:rounded-lg prose-pre:my-2
                                prose-ul:text-slate-200 prose-ul:my-2 prose-ol:text-slate-200 prose-ol:my-2
                                prose-li:text-slate-200 prose-li:marker:text-emerald-400
                                prose-blockquote:border-l-emerald-500 prose-blockquote:text-slate-300
                                prose-hr:border-slate-700"
                              >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.parts.find((p) => p.type === "text")
                                    ?.text || ""}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">
                                {message.parts.find((p) => p.type === "text")
                                  ?.text || ""}
                              </p>
                            )}
                          </div>
                        )}

                        <p
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-emerald-100/60"
                              : "text-slate-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center ml-3 shrink-0 ring-1 ring-slate-600">
                        <span className="text-sm font-semibold text-slate-300">
                          U
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming message with tool calls */}
                {(streamingMessage || streamingToolCalls.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center mr-3 shrink-0 ring-1 ring-emerald-500/30">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="max-w-[70%]">
                      {/* Streaming Tool Calls */}
                      {streamingToolCalls.length > 0 && (
                        <div className="mb-3">
                          {streamingToolCalls.map((toolCall) => (
                            <ToolCallDisplay
                              key={toolCall.id}
                              toolCall={toolCall}
                              onToggle={() =>
                                toggleStreamingToolCall(toolCall.id)
                              }
                            />
                          ))}
                        </div>
                      )}

                      {/* Streaming Text */}
                      {streamingMessage && (
                        <div className="bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-2xl px-5 py-3">
                          <div
                            className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none
                            prose-headings:text-slate-100 prose-headings:font-bold
                            prose-p:text-slate-200 prose-p:leading-relaxed prose-p:my-2
                            prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-slate-100 prose-strong:font-semibold
                            prose-code:text-emerald-400 prose-code:bg-slate-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700/50 prose-pre:rounded-lg prose-pre:my-2
                            prose-ul:text-slate-200 prose-ul:my-2 prose-ol:text-slate-200 prose-ol:my-2
                            prose-li:text-slate-200 prose-li:marker:text-emerald-400
                            prose-blockquote:border-l-emerald-500 prose-blockquote:text-slate-300
                            prose-hr:border-slate-700"
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {streamingMessage}
                            </ReactMarkdown>
                            <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Loading indicator */}
                {isLoading &&
                  !streamingMessage &&
                  streamingToolCalls.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center mr-3 ring-1 ring-emerald-500/30">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-4">
            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={img}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-slate-700/50"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Add images"
              >
                <ImageIcon className="w-5 h-5" />
              </motion.button>

              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={
                  (!inputValue.trim() && selectedImages.length === 0) ||
                  isLoading
                }
                className="p-3 bg-linear-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
