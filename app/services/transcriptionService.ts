import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiChatService } from "./geminiChatService";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const MODEL_NAME = "gemini-1.5-flash-8b";

export class TranscriptionService {
  private model;
  private chatService: GeminiChatService;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
    this.chatService = new GeminiChatService();
  }

  async transcribeAudio(audioBase64: string, mimeType: string = "audio/wav"): Promise<string> {
    try {
      // First, get the transcription
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        { text: "Please transcribe the spoken language in this audio accurately. Ignore any background noise or non-speech sounds." },
      ]);

      const transcription = result.response.text();

      // Then, generate a response using the chat service
      const response = await this.chatService.generateResponse(transcription);
      return response;
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }
} 