import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";
import { useLocation } from "wouter";

// --- Voice Synthesis (Text-to-Speech) Helper ---
function speakText(text: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Slightly slower for warmth and clarity
  utterance.pitch = 1.05; // Friendly tone

  // Pick a natural-sounding voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Natural") ||
        v.name.includes("Google") ||
        v.name.includes("Samantha") ||
        v.name.includes("Karen"))
  );

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

// Initialize the Gemini client safely using Vite env
const apiKey = import.meta.env["VITE_GEMINI_API_KEY"] || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function ChatbotScreen() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am your SmritiSetu companion. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [autoRead, setAutoRead] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);
  const chatSessionRef = useRef<
    ReturnType<NonNullable<typeof ai>["chats"]["create"]> | null
  >(null);

  // Initialize Gemini Chat Session with standard fast model
  useEffect(() => {
    if (ai && !chatSessionRef.current) {
      chatSessionRef.current = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
          systemInstruction:
            "You are a warm, gentle, and helpful companion for senior dementia citizens using the SmritiSetu app. Keep your responses simple, soothing, short, and clear.",
        },
      });
    }
  }, []);

  // Initialize Speech Recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setInput(transcript);
        setSpeechError("");
      };

      recognition.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
        if (err.error === "not-allowed" || err.error === "service-not-allowed") {
          setSpeechError("Microphone access was denied. Please allow microphone access and try again.");
        } else if (err.error === "no-speech") {
          setSpeechError("No speech was heard. Please try again.");
        } else {
          setSpeechError("Voice input is unavailable right now. You can type your message instead.");
        }
      };

      recognition.onend = () => {
        recognitionActiveRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      return () => {
        recognitionActiveRef.current = false;
        recognition.abort();
        recognitionRef.current = null;
      };
    }
    return undefined;
  }, []);

  // Load synthesis voices on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Auto-scroll to the bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Toggle Mic Button
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening || recognitionActiveRef.current) {
      recognitionRef.current.stop();
      recognitionActiveRef.current = false;
      setIsListening(false);
    } else {
      try {
        window.speechSynthesis.cancel();
        setSpeechError("");
        recognitionActiveRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        recognitionActiveRef.current = false;
        console.error("Unable to start speech recognition:", error);
        setIsListening(false);
        setSpeechError("Voice input could not start. Please try again or type your message.");
      }
    }
  };

  const handleSpeak = (text: string) => {
    speakText(text);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userText = input;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      if (!apiKey || !chatSessionRef.current) {
        throw new Error("Missing API Key");
      }

      const result = await chatSessionRef.current.sendMessage({
        message: userText,
      });

      const replyText = result.text || "I didn't quite catch that. Could you repeat it?";

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: replyText },
      ]);

      if (autoRead) {
        handleSpeak(replyText);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);

      let errorReply = "I'm having trouble connecting right now. Please try again in a moment.";
      if (!apiKey) {
        errorReply = "Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.";
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: errorReply },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            type="button"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Bot className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">SmritiSetu Companion</h1>
              <p className="text-xs text-muted-foreground">Always here to listen & chat</p>
            </div>
          </div>
        </div>

        {/* Mute/Unmute Auto-read Toggle */}
        <button
          onClick={() => {
            setAutoRead(!autoRead);
            window.speechSynthesis.cancel();
          }}
          className={`p-2 rounded-full border transition-colors ${
            autoRead ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground"
          }`}
          title={autoRead ? "Auto-read responses ON" : "Auto-read responses OFF"}
          type="button"
        >
          {autoRead ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      </header>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`p-2 rounded-full shrink-0 ${
                msg.sender === "user"
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.sender === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
            </div>
            <div
              className={`relative max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-soft ${
                msg.sender === "user"
                  ? "bg-foreground text-background rounded-tr-none"
                  : "bg-card border border-border/60 text-foreground rounded-tl-none"
              }`}
            >
              {msg.text}

              {/* Read Aloud Button for Bot Replies */}
              {msg.sender === "bot" && (
                <button
                  onClick={() => handleSpeak(msg.text)}
                  className="ml-2 inline-flex items-center opacity-60 hover:opacity-100 transition-opacity"
                  title="Listen"
                  type="button"
                >
                  <Volume2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse pl-11">
            <Bot className="size-4" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="relative flex items-center gap-2 pt-3 border-t border-border/60">
        {/* Voice Input Button */}
        <button
          onClick={toggleListening}
          type="button"
          className={`p-3 rounded-full transition-all ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
          title={isListening ? "Listening... click to stop" : "Click to speak"}
        >
          {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={isListening ? "Listening to your voice..." : "Type a message or press mic..."}
          className="flex-1 rounded-full border border-border/80 bg-card px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {speechError && (
          <p className="absolute bottom-[-1.75rem] left-14 text-xs text-destructive" role="status">
            {speechError}
          </p>
        )}

        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          type="button"
          className="rounded-full bg-foreground p-3 text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}

// Register TanStack Router route
export const Route = createFileRoute("/chatbot")({
  component: ChatbotScreen,
});