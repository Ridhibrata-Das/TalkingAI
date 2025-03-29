// app/page.tsx
"use client";
import { useState, useCallback } from 'react';
import CameraPreview from './components/CameraPreview';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Mic, Settings, Share2, Shield, Wifi } from 'lucide-react';

// Helper function to create message components
const HumanMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start group animate-in slide-in-from-bottom-2">
    <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-offset-white ring-emerald-500/40">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback>H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-zinc-900">You</p>
        <span className="text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-zinc-800 shadow-sm">
        {text}
      </div>
    </div>
  </div>
);

const GeminiMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start group animate-in slide-in-from-bottom-2">
    <Avatar className="h-8 w-8 bg-blue-600 ring-2 ring-offset-2 ring-offset-white ring-blue-500/40">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-zinc-900">Gemini</p>
        <Badge variant="secondary" className="h-5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-50">AI Assistant</Badge>
        <span className="text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="rounded-lg bg-white border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm">
        {text}
      </div>
    </div>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<{ type: 'human' | 'gemini', text: string }[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages(prev => [...prev, { type: 'gemini', text: transcription }]);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-800">
                Multimodal Live Chat
              </h1>
              <Badge variant="secondary" className="font-medium">
                Beta
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5" />
                {isConnected ? "Connected" : "Offline"}
              </Badge>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Camera Preview */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Live Session
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Secure
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
              
              <CameraPreview onTranscription={handleTranscription} />
              
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Mic className="h-4 w-4" />
                <p>Voice recognition is active</p>
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="border-b px-4 py-3">
                <h2 className="font-semibold text-zinc-800">Conversation</h2>
              </div>
              <ScrollArea className="h-[400px] md:h-[600px]">
                <div className="p-4 space-y-6">
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
    </div>
  );
}
