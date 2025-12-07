import { AppState, INITIAL_CONTROLS } from "./types";

const now = Date.now();
const day = 86400000;

export const DEMO_DATA: AppState = {
  activeChatId: "chat-1",
  darkMode: false,
  controls: INITIAL_CONTROLS,
  chats: {
    "chat-1": {
      id: "chat-1",
      title: "The Nature of Truth",
      createdAt: now - day * 5,
      updatedAt: now - day * 4,
      messages: [
        { id: "m1", role: "user", text: "I believe that scientific truth is the only objective truth we have.", timestamp: now - day * 5 },
        { id: "m2", role: "model", text: "That is a bold claim. If scientific truth is based on observation, what happens to truths that cannot be observed, like the logic of mathematics or the feeling of love? Are they not 'true'?", timestamp: now - day * 5 },
        { id: "m3", role: "user", text: "Math is a tool we invented. Love is just chemical reactions.", timestamp: now - day * 5 },
        { id: "m4", role: "model", text: "How might someone see this differently? If math is merely an invention, why does it describe the physical universe so perfectly? And if love is 'just' chemicals, does the experience hold no independent reality for you?", timestamp: now - day * 5 }
      ]
    }
  },
  userProfile: {
    name: "Alex",
    selfDescription: "I am a software engineer.",
    psychologicalProfile: "The subject exhibits a strong tendency toward Materialism. They value Empirical evidence highly. There is a potential tension between their logical framework and emotional needs.",
    philosophy: {
      leanings: [
        { id: "p1", value: "Materialism", confidence: 0.8, evidence: [{ quote: "Love is just chemical reactions", timestamp: now, chatId: "chat-1" }] },
        { id: "p2", value: "Empiricism", confidence: 0.8, evidence: [{ quote: "Scientific truth is the only objective truth", timestamp: now, chatId: "chat-1" }] }
      ],
      epistemicStyle: "Logical / Scientific",
      argumentPatterns: [
        { id: "ap1", value: "Reductionism", confidence: 0.5, evidence: [{ quote: "Love is just chemical reactions", timestamp: now, chatId: "chat-1" }] }
      ]
    },
    psychology: {
      coreValues: [
        { id: "cv1", value: "Scientific Truth", confidence: 0.8, evidence: [{ quote: "Scientific truth is the only objective truth", timestamp: now, chatId: "chat-1" }] }
      ],
      emotionalThemes: [],
      motivationalDrivers: [
        { id: "md1", value: "Need for Certainty", confidence: 0.5, evidence: [{ quote: "only objective truth", timestamp: now, chatId: "chat-1" }] }
      ],
      vulnerabilities: []
    },
    biographical: {
      facts: [
        { id: "b1", value: "Software Engineer", confidence: 0.8, evidence: [{ quote: "I am a software engineer", timestamp: now, chatId: "chat-1" }] }
      ]
    }
  }
};