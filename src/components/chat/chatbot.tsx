"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, User, CheckCircle, Volume2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Inactivity timeout in milliseconds (2 minutes)
const INACTIVITY_TIMEOUT = 2 * 60 * 1000;
// Auto-open delay after page load (5 seconds)
const AUTO_OPEN_DELAY = 5000;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  orderConfirmed?: boolean;
  orderNumber?: string;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! 👋 Welcome to Papaye Fast Food. I can help you place an order, answer questions about our menu, or find branch locations.\n\n**Quick options:**\n• Say \"I want to order\" to start ordering\n• Ask about our menu or prices\n• Find the nearest branch\n\nHow can I help you today?",
};

// Simple markdown-like formatting for chat messages
function MessageContent({ content }: { content: string }) {
  // Convert **text** to bold
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Sound not available");
    }
  }, [soundEnabled]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (isOpen && messages.length > 1) {
      inactivityTimerRef.current = setTimeout(() => {
        const inactivityMessage: Message = {
          id: `inactivity-${Date.now()}`,
          role: "assistant",
          content: "Hey! 👋 Are you still there? Let me know if you need any help with your order or have any questions about our menu!",
        };
        setMessages((prev) => [...prev, inactivityMessage]);
        playNotificationSound();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isOpen, messages.length, playNotificationSound]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-open chat after page loads
  useEffect(() => {
    if (hasAutoOpened) return;
    
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasAutoOpened(true);
      playNotificationSound();
    }, AUTO_OPEN_DELAY);

    return () => clearTimeout(timer);
  }, [hasAutoOpened, playNotificationSound]);

  // Handle inactivity timer
  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [messages, isOpen, resetInactivityTimer]);

  // Reset timer on user input
  useEffect(() => {
    if (input) {
      resetInactivityTimer();
    }
  }, [input, resetInactivityTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        orderConfirmed: data.orderPlaced,
        orderNumber: data.orderNumber,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again or contact us directly at +233 302 810 990.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-24 z-50 w-32 h-32 rounded-full shadow-lg flex items-center justify-center overflow-hidden",
          isOpen && "hidden"
        )}
        aria-label="Open chat"
      >
        <Image
          src="/images/chatbot.png"
          alt="Chat with us"
          width={128}
          height={128}
          className="w-full h-full object-cover"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 right-24 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                  <Image src="/images/chatbot.png" alt="Papaye Assistant" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold">Papaye Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    soundEnabled ? "hover:bg-white/20" : "bg-white/10 hover:bg-white/20"
                  )}
                  aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
                  title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                >
                  <Volume2 className={cn("w-4 h-4", !soundEnabled && "opacity-50")} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image src="/images/chatbot.png" alt="" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-wrap",
                      message.role === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : message.orderConfirmed
                        ? "bg-green-50 text-gray-800 rounded-bl-md shadow-sm border-2 border-green-200"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                    )}
                  >
                    {message.orderConfirmed && (
                      <div className="flex items-center gap-2 mb-2 text-green-600 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Order Placed Successfully!
                      </div>
                    )}
                    <MessageContent content={message.content} />
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 justify-start"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image src="/images/chatbot.png" alt="" width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
