// app/components/CameraPreview.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Video, VideoOff } from "lucide-react";
import { GeminiWebSocket } from '../services/geminiWebSocket';
import { Base64 } from 'js-base64';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CameraPreviewProps {
  onTranscription: (text: string) => void;
}

export default function CameraPreview({ onTranscription }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const geminiWsRef = useRef<GeminiWebSocket | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const [isAudioSetup, setIsAudioSetup] = useState(false);
  const setupInProgressRef = useRef(false);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const imageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [outputAudioLevel, setOutputAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const cleanupAudio = useCallback(() => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const cleanupWebSocket = useCallback(() => {
    if (geminiWsRef.current) {
      geminiWsRef.current.disconnect();
      geminiWsRef.current = null;
    }
  }, []);

  // Simplify sendAudioData to just send continuously
  const sendAudioData = (b64Data: string) => {
    if (!geminiWsRef.current) return;
    geminiWsRef.current.sendMediaChunk(b64Data, "audio/pcm");
  };

  const toggleCamera = async () => {
    if (isStreaming && stream) {
      setIsStreaming(false);
      cleanupWebSocket();
      cleanupAudio();
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
    } else {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });

        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
          }
        });

        audioContextRef.current = new AudioContext({
          sampleRate: 16000,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          videoRef.current.muted = true;
        }

        const combinedStream = new MediaStream([
          ...videoStream.getTracks(),
          ...audioStream.getTracks()
        ]);

        setStream(combinedStream);
        setIsStreaming(true);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        cleanupAudio();
      }
    }
  };

  const toggleCameraFacing = async () => {
    if (!isStreaming) return;
    
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      // Get new video stream with opposite facing mode
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? 'environment' : 'user'
        },
        audio: false
      });

      // Get audio stream
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newVideoStream;
        videoRef.current.muted = true;
      }

      const combinedStream = new MediaStream([
        ...newVideoStream.getTracks(),
        ...audioStream.getTracks()
      ]);

      setStream(combinedStream);
      setIsFrontCamera(!isFrontCamera);
    } catch (err) {
      console.error('Error switching camera:', err);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isStreaming) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    geminiWsRef.current = new GeminiWebSocket(
      (text) => {
        console.log("Received from Gemini:", text);
      },
      () => {
        console.log("[Camera] WebSocket setup complete, starting media capture");
        setIsWebSocketReady(true);
        setConnectionStatus('connected');
      },
      (isPlaying) => {
        setIsModelSpeaking(isPlaying);
      },
      (level) => {
        setOutputAudioLevel(level);
      },
      onTranscription
    );
    geminiWsRef.current.connect();

    return () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
        imageIntervalRef.current = null;
      }
      cleanupWebSocket();
      setIsWebSocketReady(false);
      setConnectionStatus('disconnected');
    };
  }, [isStreaming, onTranscription, cleanupWebSocket]);

  // Start image capture only after WebSocket is ready
  useEffect(() => {
    if (!isStreaming || !isWebSocketReady) return;

    console.log("[Camera] Starting image capture interval");
    imageIntervalRef.current = setInterval(captureAndSendImage, 1000);

    return () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
        imageIntervalRef.current = null;
      }
    };
  }, [isStreaming, isWebSocketReady]);

  // Update audio processing setup
  useEffect(() => {
    if (!isStreaming || !stream || !audioContextRef.current || 
        !isWebSocketReady || isAudioSetup || setupInProgressRef.current) return;

    let isActive = true;
    setupInProgressRef.current = true;

    const setupAudioProcessing = async () => {
      try {
        const ctx = audioContextRef.current;
        if (!ctx || ctx.state === 'closed' || !isActive) {
          setupInProgressRef.current = false;
          return;
        }

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        await ctx.audioWorklet.addModule('/worklets/audio-processor.js');

        if (!isActive) {
          setupInProgressRef.current = false;
          return;
        }

        audioWorkletNodeRef.current = new AudioWorkletNode(ctx, 'audio-processor', {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          processorOptions: {
            sampleRate: 16000,
            bufferSize: 4096,  // Larger buffer size like original
          },
          channelCount: 1,
          channelCountMode: 'explicit',
          channelInterpretation: 'speakers'
        });

        const source = ctx.createMediaStreamSource(stream);
        audioWorkletNodeRef.current.port.onmessage = (event) => {
          if (!isActive || isModelSpeaking) return;
          const { pcmData, level } = event.data;
          setAudioLevel(level);

          const pcmArray = new Uint8Array(pcmData);
          const b64Data = Base64.fromUint8Array(pcmArray);
          sendAudioData(b64Data);
        };

        source.connect(audioWorkletNodeRef.current);
        setIsAudioSetup(true);
        setupInProgressRef.current = false;

        return () => {
          source.disconnect();
          if (audioWorkletNodeRef.current) {
            audioWorkletNodeRef.current.disconnect();
          }
          setIsAudioSetup(false);
        };
      } catch (error) {
        if (isActive) {
          cleanupAudio();
          setIsAudioSetup(false);
        }
        setupInProgressRef.current = false;
      }
    };

    console.log("[Camera] Starting audio processing setup");
    setupAudioProcessing();

    return () => {
      isActive = false;
      setIsAudioSetup(false);
      setupInProgressRef.current = false;
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
      }
    };
  }, [isStreaming, stream, isWebSocketReady, isModelSpeaking]);

  // Capture and send image
  const captureAndSendImage = () => {
    if (!videoRef.current || !videoCanvasRef.current || !geminiWsRef.current) return;

    const canvas = videoCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame to canvas
    context.drawImage(videoRef.current, 0, 0);

    // Convert to base64 and send
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const b64Data = imageData.split(',')[1];
    geminiWsRef.current.sendMediaChunk(b64Data, "image/jpeg");
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800 p-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-[640px] h-[480px] rounded-lg overflow-hidden object-cover bg-black/20"
        />
        
        {/* Connection Status Overlay */}
        {isStreaming && connectionStatus !== 'connected' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg backdrop-blur-sm transition-all duration-300">
            <div className="text-center space-y-3 px-6 py-4 bg-black/40 rounded-2xl backdrop-blur-md">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent mx-auto" />
              <p className="text-white font-semibold text-lg">
                {connectionStatus === 'connecting' ? 'Connecting to Gemini...' : 'Disconnected'}
              </p>
              <p className="text-white/80 text-sm">
                Please wait while we establish a secure connection
              </p>
            </div>
          </div>
        )}

        {/* Control Buttons Container */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-4">
          {/* Camera Toggle Button */}
          <Button
            onClick={toggleCamera}
            size="icon"
            className={`rounded-full w-14 h-14 shadow-lg backdrop-blur-md transition-all duration-300 transform hover:scale-105
              ${isStreaming 
                ? 'bg-red-500/80 hover:bg-red-600/90 text-white' 
                : 'bg-emerald-500/80 hover:bg-emerald-600/90 text-white'
              }`}
          >
            {isStreaming ? 
              <VideoOff className="h-7 w-7 transition-transform duration-200" /> : 
              <Video className="h-7 w-7 transition-transform duration-200" />
            }
          </Button>

          {/* Front/Back Camera Toggle */}
          {isStreaming && (
            <Button
              onClick={toggleCameraFacing}
              size="icon"
              className="rounded-full w-14 h-14 bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md transition-all duration-300 transform hover:scale-105"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-7 w-7 transition-transform duration-200"
              >
                <path d="M16 3h5v5" />
                <path d="M8 21H3v-5" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Audio Level Indicator */}
      {isStreaming && (
        <div className="w-[640px] h-2.5 rounded-full bg-gray-200/10 overflow-hidden backdrop-blur-sm p-0.5">
          <div
            className="h-full rounded-full transition-all bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg"
            style={{ 
              width: `${isModelSpeaking ? outputAudioLevel : audioLevel}%`,
              transition: 'all 150ms ease-out'
            }}
          />
        </div>
      )}
      <canvas ref={videoCanvasRef} className="hidden" />
    </div>
  );
}
