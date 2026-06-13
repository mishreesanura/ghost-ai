"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, FileText, Download, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("architect");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-resize Textarea (72px to 160px)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 72), 160);
    textarea.style.height = `${nextHeight}px`;
  }, [inputValue]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate Bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `I received your request: "${userMsg.text}". I can help you model this system architecture on the canvas or draft standard documentation for it.`,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (prompt: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `Let's work on: "${prompt}". I am preparing to map out the required nodes, microservices, and databases. Let me know if you want to customize the shapes or the integration flow!`,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <aside
      className={`fixed top-16 right-0 bottom-0 z-20 flex w-80 flex-col border-l border-border-default bg-surface/95 backdrop-blur-md text-text-primary transition-transform duration-300 ease-in-out shadow-2xl ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-border-default px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-ai/10 text-accent-ai border border-accent-ai/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary leading-tight">AI Workspace</span>
            <span className="text-[10px] text-text-muted">Collaborate with Ghost AI</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary hover:bg-subtle/50 h-8 w-8 rounded-lg transition-colors"
          aria-label="Close AI panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs Container */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="px-6 py-3 border-b border-border-default shrink-0">
          <TabsList className="grid grid-cols-2 w-full bg-subtle p-1 rounded-xl">
            <TabsTrigger
              value="architect"
              className="rounded-lg py-1.5 text-xs transition-colors data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-text-muted"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-lg py-1.5 text-xs transition-colors data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-text-muted"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* AI Architect Tab Content */}
        <TabsContent value="architect" className="flex flex-1 flex-col overflow-hidden m-0 p-0">
          {/* Scrollable Chat Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 px-2 space-y-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-ai/10 text-accent-ai border border-accent-ai/20 shadow-[0_0_20px_rgba(100,87,249,0.15)] animate-pulse">
                  <Bot className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-text-primary">Ghost AI Architect</h3>
                  <p className="text-xs text-text-muted leading-relaxed max-w-[220px]">
                    Describe your architecture goals, and let the AI draft system designs or technical specifications.
                  </p>
                </div>

                {/* Starter Prompt Chips */}
                <div className="flex flex-col gap-2 w-full pt-2">
                  {[
                    "Design an e-commerce backend",
                    "Create a chat app architecture",
                    "Build a CI/CD pipeline",
                  ].map((chipText) => (
                    <button
                      key={chipText}
                      onClick={() => handleChipClick(chipText)}
                      className="w-full text-left bg-subtle hover:bg-subtle/80 text-accent-ai-text border border-border-default px-4 py-2.5 rounded-xl text-xs transition cursor-pointer font-medium hover:border-accent-ai/30 hover:shadow-[0_0_10px_rgba(100,87,249,0.05)]"
                    >
                      {chipText}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                      msg.sender === "user"
                        ? "self-end bg-accent/20 border-accent-foreground/30 text-text-primary"
                        : "self-start bg-elevated border-border-default text-accent-ai-text"
                    }`}
                  >
                    <span className="font-sans whitespace-pre-wrap">{msg.text}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Chat Input Section */}
          <div className="p-4 border-t border-border-default bg-surface/50 shrink-0">
            <div className="relative flex items-end gap-2 bg-elevated border border-border-default rounded-xl p-2 focus-within:border-accent-foreground/50 transition-colors">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Ghost AI..."
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs text-text-primary placeholder:text-text-faint resize-none p-1 min-h-[72px] max-h-[160px] overflow-y-auto outline-none nodrag nopan"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-8 w-8 rounded-lg shrink-0 bg-accent text-white hover:bg-accent/80 transition-all disabled:opacity-40 disabled:hover:bg-accent"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab Content */}
        <TabsContent value="specs" className="flex flex-1 flex-col p-6 space-y-4 overflow-y-auto m-0">
          <Button
            className="w-full py-5 rounded-xl bg-accent text-white hover:bg-accent/80 font-medium text-xs transition-colors shrink-0 shadow-[0_0_15px_rgba(0,200,212,0.1)]"
          >
            Generate Spec
          </Button>

          <div className="space-y-2.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Generated Documents</span>

            {/* Static Demo Spec Card */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-elevated border border-border-default hover:border-border-subtle transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-foreground border border-accent/20">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-xs font-semibold text-text-primary truncate">System Architecture Spec</h4>
                <p className="text-[11px] text-text-muted leading-normal line-clamp-2">
                  Detailed overview of the microservices topology and data flow interfaces.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[9px] text-text-faint font-mono">v1.0.0 • Draft</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className="h-7 w-7 rounded-md text-text-faint hover:text-text-muted hover:bg-subtle/50 opacity-50 cursor-not-allowed"
                    aria-label="Download spec"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
