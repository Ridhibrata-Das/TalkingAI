// app/page.tsx
"use client";
import { useState, useCallback } from 'react';
import CameraPreview from './components/CameraPreview';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Helper function to create message components
const HumanMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start">
    <Avatar className="h-8 w-8">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback>H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-zinc-900">You</p>
      </div>
      <div className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
        {text}
      </div>
    </div>
  </div>
);

const GeminiMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start">
    <Avatar className="h-8 w-8 bg-blue-600">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-zinc-900">Gemini</p>
      </div>
      <div className="rounded-lg bg-white border border-zinc-200 px-3 py-2 text-sm text-zinc-800">
        {text}
      </div>
    </div>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<{ type: 'human' | 'gemini', text: string }[]>([]);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages(prev => [...prev, { type: 'gemini', text: transcription }]);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <h1 className="text-2xl md:text-4xl font-bold text-zinc-800 p-4 md:p-8 text-center">
        Multimodal Live Chat
      </h1>
      
      {/* Main content container */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Camera preview section - takes full width on mobile, left side on desktop */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-4">
              <CameraPreview onTranscription={handleTranscription} />
            </div>
          </div>

          {/* Chat section - takes full width on mobile, right side on desktop */}
          <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm">
            <ScrollArea className="h-[400px] md:h-[540px] p-4 md:p-6">
              <div className="space-y-6">
                <GeminiMessage text="Hi! I'm Gemini. I can see and hear you. Let's chat!" />
                {messages.map((message, index) => (
                  message.type === 'human' ? (
                    <HumanMessage key={`msg-${index}`} text={message.text} />
                  ) : (
                    <GeminiMessage key={`msg-${index}`} text={message.text} />
                  )
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
