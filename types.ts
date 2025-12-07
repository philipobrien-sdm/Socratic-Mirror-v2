export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Evidence {
  quote: string;
  timestamp: number;
  chatId?: string;
}

export interface InferredAttribute {
  id: string;
  value: string;
  confidence: number; // 0.2 (Low), 0.5 (Medium), 0.8 (High) - Scaled down for v2
  evidence: Evidence[];
}

// v2 Profile Structure
export interface PhilosophyState {
  leanings: InferredAttribute[];
  epistemicStyle: string; // How they form beliefs
  argumentPatterns: InferredAttribute[];
}

export interface PsychologyState {
  coreValues: InferredAttribute[];
  emotionalThemes: InferredAttribute[];
  motivationalDrivers: InferredAttribute[]; // Non-clinical drivers
  vulnerabilities: InferredAttribute[];
}

export interface BiographicalState {
  facts: InferredAttribute[];
}

export interface ControlState {
  depth: 'surface' | 'moderate' | 'deep';
  grounding: boolean; // Emotional safety mode
  inferenceEnabled: boolean;
}

export interface UserProfile {
  name: string;
  selfDescription: string;
  
  // v2 Namespaces
  philosophy: PhilosophyState;
  psychology: PsychologyState;
  biographical: BiographicalState;
  
  // Narrative Summary
  psychologicalProfile: string; // Kept as general summary, but softer tone
}

export interface AppState {
  chats: Record<string, ChatSession>;
  activeChatId: string | null;
  userProfile: UserProfile;
  controls: ControlState; // Runtime controls
  darkMode: boolean;
}

export const INITIAL_CONTROLS: ControlState = {
  depth: 'moderate',
  grounding: false,
  inferenceEnabled: true,
};

export const INITIAL_PROFILE: UserProfile = {
  name: 'Seeker',
  selfDescription: '',
  philosophy: {
    leanings: [],
    epistemicStyle: "Undetermined",
    argumentPatterns: []
  },
  psychology: {
    coreValues: [],
    emotionalThemes: [],
    motivationalDrivers: [],
    vulnerabilities: []
  },
  biographical: {
    facts: []
  },
  psychologicalProfile: 'The user is beginning their journey of self-discovery.'
};