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
  CheckCircle2,
  Image as ImageIcon,
  Bot,
  AlertTriangle,
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-[var(--surface-3)] transition-colors cursor-pointer text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 truncate">
              {toolCall.name}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 rounded-full shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Done
                </span>
              </span>
            )}
            {!isCompleted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 rounded-full shrink-0">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Running
                </span>
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: toolCall.isExpanded ? 0 : -90 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {toolCall.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-[var(--border)]">
              {toolCall.input && (
                <div className="pt-2.5">
                  <div className="text-[10px] font-semibold text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">
                    Parameters
                  </div>
                  <div className="bg-[var(--surface)] rounded-lg p-2.5 border border-[var(--border-strong)]">
                    <pre className="text-[11px] text-[var(--foreground)] font-mono overflow-x-auto leading-relaxed">
                      {JSON.stringify(toolCall.input, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              {toolCall.output && (
                <div>
                  <div className="text-[10px] font-semibold text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">
                    Result
                  </div>
                  <div className="bg-[var(--surface)] rounded-lg p-2.5 border border-[var(--border-strong)]">
                    <pre className="text-[11px] text-[var(--foreground)] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(toolCall.output, null, 2)}
                    </pre>
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
    Math.random().toString(36).substring(2, 15),
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, streamingToolCalls]);
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const generateMessageId = () =>
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const handleClearChat = () => {
    setMessages([]);
    setStreamingMessage("");
    setStreamingToolCalls([]);
    setSelectedImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((images) => setSelectedImages((prev) => [...prev, ...images]));
  };

  const removeImage = (index: number) =>
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));

  const toggleToolCall = (messageId: string, toolCallId: string) =>
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.toolCalls
          ? {
              ...msg,
              toolCalls: msg.toolCalls.map((tc) =>
                tc.id === toolCallId
                  ? { ...tc, isExpanded: !tc.isExpanded }
                  : tc,
              ),
            }
          : msg,
      ),
    );

  const toggleStreamingToolCall = (toolCallId: string) =>
    setStreamingToolCalls((prev) =>
      prev.map((tc) =>
        tc.id === toolCallId ? { ...tc, isExpanded: !tc.isExpanded } : tc,
      ),
    );

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && selectedImages.length === 0) || isLoading)
      return;

    const parts: MessagePart[] = [];
    if (inputValue.trim())
      parts.push({ type: "text", text: inputValue.trim() });
    selectedImages.forEach((img) =>
      parts.push({ type: "image", imageUrl: img }),
    );

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

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `http://localhost:3141/agents/${agent.id}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "*/*" },
          body: JSON.stringify({
            input: messages.concat(userMessage).map((msg) => ({
              parts: msg.parts,
              id: msg.id,
              role: msg.role,
            })),
            options: {
              conversationId,
              temperature: 0.7,
              maxTokens: 4000,
              maxSteps: 10,
            },
          }),
          signal: abortControllerRef.current.signal,
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let toolCalls: ToolCall[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "tool-input-start") {
                toolCalls.push({
                  id: parsed.toolCallId,
                  name: parsed.toolName,
                  status: "pending",
                  isExpanded: true,
                });
                setStreamingToolCalls([...toolCalls]);
              } else if (parsed.type === "tool-input-available") {
                const tc = toolCalls.find((t) => t.id === parsed.toolCallId);
                if (tc) {
                  tc.input = parsed.input;
                  tc.status = "input-available";
                  setStreamingToolCalls([...toolCalls]);
                }
              } else if (parsed.type === "tool-output-available") {
                const tc = toolCalls.find((t) => t.id === parsed.toolCallId);
                if (tc) {
                  tc.output = parsed.output;
                  tc.status = "completed";
                  setStreamingToolCalls([...toolCalls]);
                }
              } else if (parsed.type === "text-delta" || parsed.delta) {
                assistantText += parsed.delta?.text || parsed.delta || "";
                setStreamingMessage(assistantText);
              } else if (parsed.type === "content" || parsed.text) {
                assistantText += parsed.text || parsed.content || "";
                setStreamingMessage(assistantText);
              }
            } catch {
              /* skip */
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          role: "assistant",
          parts: [{ type: "text", text: assistantText || "I'm here to help!" }],
          timestamp: new Date(),
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        },
      ]);
      setStreamingMessage("");
      setStreamingToolCalls([]);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "Sorry, I encountered an error. Please try again.",
            },
          ],
          timestamp: new Date(),
        },
      ]);
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

  const hasContent = messages.length > 0 || !!streamingMessage;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-3xl h-[85vh] bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border-strong)] flex flex-col overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle dot grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* ── Header ── */}
          <div className="relative shrink-0 border-b border-[var(--border-strong)] px-5 py-4 bg-[var(--surface)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/25">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      AI Playground
                    </h3>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {agent.name} · {agent.model}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button
                  className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearChat}
                  title="Clear conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
                <motion.button
                  className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-red-500 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Memory warning */}
            {!agent.memory && (
              <motion.div
                className="mt-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-xs text-amber-600 dark:text-amber-400 flex-1">
                  Memory is disabled — conversation won't persist
                </span>
                <button className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-semibold transition-colors cursor-pointer shrink-0">
                  Enable
                </button>
              </motion.div>
            )}
          </div>

          {/* ── Messages ── */}
          <div className="relative flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {!hasContent ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl flex items-center justify-center ring-1 ring-emerald-500/20"
                >
                  <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                    Chat with {agent.name}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
                    Ask anything — this agent has access to its configured tools
                    and memory.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 justify-center max-w-sm"
                >
                  {[
                    "What can you do?",
                    "Show me your tools",
                    "Help me get started",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInputValue(prompt)}
                      className="px-3 py-1.5 text-xs bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-emerald-500/40 transition-all cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </motion.div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-500/20">
                        <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[72%] ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}
                    >
                      {/* Tool calls */}
                      {message.role === "assistant" &&
                      message.toolCalls?.length ? (
                        <div className="w-full mb-2">
                          {message.toolCalls.map((tc) => (
                            <ToolCallDisplay
                              key={tc.id}
                              toolCall={tc}
                              onToggle={() => toggleToolCall(message.id, tc.id)}
                            />
                          ))}
                        </div>
                      ) : null}

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-sm shadow-md shadow-emerald-500/20"
                            : "bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border-strong)] rounded-bl-sm"
                        }`}
                      >
                        {/* Images */}
                        {message.images?.length ? (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {message.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Attachment ${idx + 1}`}
                                className="max-w-[160px] max-h-[160px] rounded-lg object-cover border border-white/10"
                              />
                            ))}
                          </div>
                        ) : null}

                        {/* Text */}
                        {message.parts.some(
                          (p) => p.type === "text" && p.text,
                        ) && (
                          <>
                            {message.role === "assistant" ? (
                              <div
                                className="prose prose-sm max-w-none dark:prose-invert
                                  prose-p:my-1.5 prose-p:leading-relaxed
                                  prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
                                  prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                                  prose-code:text-emerald-700 dark:prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                                  prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border-strong)] prose-pre:rounded-xl prose-pre:my-2 prose-pre:p-3
                                  prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
                                  prose-strong:font-semibold
                                  prose-blockquote:border-l-emerald-500 prose-blockquote:text-[var(--muted-foreground)] prose-blockquote:not-italic
                                  prose-hr:border-[var(--border)]"
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
                          </>
                        )}

                        <p
                          className={`text-[10px] mt-2 ${message.role === "user" ? "text-white/50" : "text-[var(--muted-foreground)]"}`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-400/20 to-slate-500/10 border border-[var(--border-strong)] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[var(--muted-foreground)]">
                          U
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming */}
                {(streamingMessage || streamingToolCalls.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-500/20">
                      <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="max-w-[72%]">
                      {streamingToolCalls.length > 0 && (
                        <div className="mb-2">
                          {streamingToolCalls.map((tc) => (
                            <ToolCallDisplay
                              key={tc.id}
                              toolCall={tc}
                              onToggle={() => toggleStreamingToolCall(tc.id)}
                            />
                          ))}
                        </div>
                      )}
                      {streamingMessage && (
                        <div className="bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-2xl rounded-bl-sm px-4 py-3">
                          <div
                            className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert
                              prose-p:my-1.5 prose-a:text-emerald-600 dark:prose-a:text-emerald-400
                              prose-code:text-emerald-700 dark:prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                              prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border-strong)] prose-pre:rounded-xl"
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {streamingMessage}
                            </ReactMarkdown>
                            <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-500 rounded-sm animate-pulse align-middle" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Typing indicator */}
                {isLoading &&
                  !streamingMessage &&
                  streamingToolCalls.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-500/20">
                        <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {[0, 0.15, 0.3].map((delay, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${delay}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* ── Input ── */}
          <div className="relative shrink-0 border-t border-[var(--border-strong)] bg-[var(--surface)] p-4">
            {/* Image previews */}
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
                      className="w-16 h-16 object-cover rounded-xl border border-[var(--border-strong)]"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
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
                className="p-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-xl text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                title="Attach image"
              >
                <ImageIcon className="w-4 h-4" />
              </motion.button>

              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${agent.name}…`}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <motion.button
                onClick={handleSendMessage}
                disabled={
                  (!inputValue.trim() && selectedImages.length === 0) ||
                  isLoading
                }
                className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>

            <p className="text-[10px] text-[var(--muted-foreground)] text-center mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
