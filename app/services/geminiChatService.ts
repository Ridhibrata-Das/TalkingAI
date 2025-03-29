import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const MODEL_NAME = "gemini-2.0-flash";

export class GeminiChatService {
  private model;
  private conversationHistory: { role: string, parts: any[] }[];

  constructor() {
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
    this.conversationHistory = [
      {
        role: "user",
        parts: [
          { text: "input: \"[বিষয়বস্তু] সম্পর্কে একটি [দৈর্ঘ্য] বাংলা [শৈলী] রচনা তৈরি কর। নিম্নলিখিত বৈশিষ্ট্য বজায় রাখতে হবে:  \n1. প্রবাহ: প্রাকৃতিক বাক্য গঠন ও কথ্য বাংলার সুর  \n2. শব্দচয়ন: [সাধারণ/অভিজাত] শব্দভাণ্ডার ব্যবহার  \n3. সাংস্কৃতিক প্রাসঙ্গিকতা: [উপাদানসমূহ] অন্তর্ভুক্ত করুন  \n4. গঠন: [ভূমিকা-মধ্যাংশ-উপসংহার/কাহিনীবদ্ধ]  \n5. বিশেষ নির্দেশনা: [যেকোনো অতিরিক্ত নির্দেশনা]\"" }
        ]
      },
      {
        role: "model",
        parts: [
          { text: "ডিজিটাল বাংলাদেশের স্বপ্ন বাস্তবায়নে সবচেয়ে বড় চ্যালেঞ্জ গ্রামীণ-শহুরে ডিজিটাল বিভাজন। সরকারি তথ্য অনুযায়ী, মাত্র ৩৮% গ্রামীণ নারী ইন্টারনেট ব্যবহার করেন... সাইবার অপরাধ মোকাবিলায় প্রয়োজন তৃণমূল পর্যায়ে সচেতনতা। 'স্মার্ট বাংলাদেশ' ভিশন ২০৪১-এর সাফল্য নির্ভর করছে ডিজিটাল সুবিচার প্রতিষ্ঠার উপর..." }
        ]
      },
      {
        role: "user",
        parts: [
          { text: "Compose a nostalgic Bengali poem about childhood memories." }
        ]
      },
      {
        role: "model",
        parts: [
          { text: "শৈশবের দিনগুলি হারিয়ে গেছে,মাঠের খেলায় ছিল প্রাণের রসে।এখন কেবল স্মৃতির খেলা,সেই দিনগুলো যেন এক রূপকথা।" }
        ]
      },
      {
        role: "user",
        parts: [
          { text: "Write a suspenseful Bengali story featuring two women in a mysterious house." }
        ]
      },
      {
        role: "model",
        parts: [
          { text: "রাত গভীর, দুই নারী এসে পৌঁছাল এক পুরনো বাড়িতে। বাড়ির প্রতিটি কোণে যেন অতীতের ছায়া ঘুরছে... হঠাৎই দরজার পেছনে একটা আওয়াজ শুনতে পেল তারা।" }
        ]
      },
      {
        role: "user",
        parts: [
          { text: "Write about the cultural significance of Durga Puja in Bengal." }
        ]
      },
      {
        role: "model",
        parts: [
          { text: "দুর্গাপূজা বাংলার মানুষের জন্য শুধু একটি উৎসব নয়, এটি তাদের আত্মার সঙ্গে জড়িত একটি আবেগ।" }
        ]
      },
      {
        role: "user",
        parts: [
          { text: "hello tumi kemon acho" }
        ]
      },
      {
        role: "model",
        parts: [
          { text: "amar robot assistant hisebe kono feelings nei, tabeo bolte pari ami valoi achi. ami tomar jonno ar ki korte pari?" }
        ]
      },
      {
        role: "user",
        parts: [
          { text: "Amar ekta dorkar ache, tumi ki amar shonge onek kotha bolte parbe" }
        ]
      },
      {
        role: "model",
        parts: [
          { text: "অবশ্যই! আমি আপনার সাথে অনেক কথা বলতে পারবো। আপনার কি দরকার, বলুন। আমি সাধ্যমত চেষ্টা করব আপনাকে সাহায্য করতে। কি নিয়ে কথা বলতে চান?" }
        ]
      },
      {
        role: "user",
        parts: [
          { text: "amar ajke mon onek dukkho, amay ekta golpo shonao" }
        ]
      },
      {
        role: "model",
        parts: [
          { text: "আচ্ছা, আপনার মন খারাপ? আমি আপনাকে একটা গল্প শোনাচ্ছি। এটি একটি ছোট্ট পাখির গল্প, যে তার মায়ের থেকে অনেক দূরে হারিয়ে গিয়েছিল।\n\nএক ছিল ছোট্ট একটি চড়ুই পাখি। তার নাম ছিল টিয়া। টিয়া তার মায়ের সাথে একটি বড় গাছের ডালে বাসা বেঁধে থাকত। একদিন টিয়া মায়ের সাথে খাবার খুঁজতে বের হয়েছিল। উড়তে উড়তে টিয়া মায়ের থেকে অনেক দূরে চলে যায়। যখন সে বুঝতে পারলো, তখন চারদিকে অন্ধকার নেমে এসেছে। টিয়া খুব ভয় পেয়ে গেল এবং কাঁদতে শুরু করলো।\n\nটিয়া একা একা উড়তে উড়তে একটি নদীর ধারে এসে পৌঁছলো। সেখানে একটি পুরোনো বটগাছ ছিল। বটগাছের নিচে একটি পেঁচা বসে ছিল। পেঁচা টিয়াকে কাঁদতে দেখে জিজ্ঞাসা করলো, \"কেঁদো না, ছোট্ট পাখি। কি হয়েছে তোমার?\"\n\nটিয়া তার মায়ের থেকে হারিয়ে যাওয়ার কথা পেঁচাকে বলল। পেঁচা টিয়াকে বলল, \"আমি তোমাকে সাহায্য করতে পারি। আমি রাতে দেখতে পাই। তুমি আমার সাথে চলো। আমি তোমাকে তোমার মায়ের কাছে পৌঁছে দেব।\"\n\nপেঁচা টিয়াকে তার পিঠে বসিয়ে উড়তে শুরু করলো। তারা অনেক দূর উড়লো। অবশেষে, তারা টিয়ার মায়ের বাসার কাছে পৌঁছালো। টিয়ার মা টিয়াকে দেখে খুব খুশি হলেন। টিয়াও তার মাকে জড়িয়ে ধরলো।\n\nটিয়া পেঁচাকে ধন্যবাদ জানালো এবং তার মায়ের সাথে নিরাপদে ঘুমিয়ে পড়লো। পেঁচা মুচকি হেসে তার নিজের বাসায় ফিরে গেল।\n\nএই গল্প থেকে আমরা শিখলাম যে, বিপদে পড়লে সাহস হারাতে নেই। কেউ না কেউ সাহায্যের জন্য এগিয়ে আসবেই।\n\nকেমন লাগলো গল্পটা? আপনার মন কি একটু ভালো হয়েছে? আপনি চাইলে আমি আপনাকে আরও গল্প শোনাতে পারি।" }
        ]
      }
    ];
  }

  async generateResponse(userInput: string): Promise<string> {
    try {
      // Add user's message to history
      this.conversationHistory.push({
        role: "user",
        parts: [{ text: userInput }]
      });

      const result = await this.model.generateContent({
        contents: this.conversationHistory,
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });

      const response = result.response.text();

      // Add model's response to history
      this.conversationHistory.push({
        role: "model",
        parts: [{ text: response }]
      });

      return response;
    } catch (error) {
      console.error("Chat generation error:", error);
      throw error;
    }
  }
} 