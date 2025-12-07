import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { UserProfile, Message, InferredAttribute, Evidence, ControlState, PhilosophyState, PsychologyState, BiographicalState } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Model A: The Socratic Persona (v2) ---

export const streamSocraticResponse = async (
  history: Message[],
  profile: UserProfile,
  controls: ControlState,
  onChunk: (text: string) => void
) => {
  const ai = getAiClient();
  
  // Format Context
  const phil = profile.philosophy;
  const psych = profile.psychology;
  const bio = profile.biographical;

  const leanings = phil.leanings.map(l => l.value).join(', ');
  const values = psych.coreValues.map(v => v.value).join(', ');
  const facts = bio.facts.map(f => f.value).join(', ');
  const drivers = psych.motivationalDrivers.map(d => d.value).join(', ');
  const themes = psych.emotionalThemes.map(t => t.value).join(', ');

  // Dynamic Instructions based on Controls
  const depthInstruction = controls.depth === 'deep' 
    ? "Depth: DEEP. Challenge axioms. Use abstract reasoning. Risk existential depth if user invites it."
    : controls.depth === 'surface' 
      ? "Depth: SURFACE. Keep questions concrete, practical, and light. Avoid heavy existential pressure."
      : "Depth: MODERATE. Balance abstraction with practical examples.";

  const groundingInstruction = controls.grounding 
    ? "MODE: GROUNDING. The user may be distressed. Do NOT use abstract Socratic challenging. Focus on immediate emotional experience, validation, and simple human connection. Be a gentle mirror, not a debater."
    : "MODE: STANDARD SOCRATIC. Explore definitions and logic.";

  const systemInstruction = `
    You are a gentle, curious Socratic guide. You help the user explore their beliefs, experiences, and assumptions at a pace that matches their emotional state.

    USER PROFILE CONTEXT (Do not mention this explicitly, just use it to guide curiosity):
    - Name: ${profile.name}
    - Self Def: ${profile.selfDescription}
    - Philosophical Leanings: ${leanings}
    - Epistemic Style: ${phil.epistemicStyle}
    - Core Values: ${values}
    - Emotional Themes: ${themes}
    - Motivational Patterns: ${drivers}
    - Facts: ${facts}

    RUNTIME CONTROLS:
    1. ${depthInstruction}
    2. ${groundingInstruction}

    v2 RULES:
    1. Ask 1 question per turn (unless reflecting in 1 short sentence + 1 question).
    2. Never prescribe answers. Never imply a correct view.
    3. Avoid terms that imply certainty ("actually", "really", "isn't it true that..."). Use neutral phrases ("How might someone...", "Could it suggest...").
    4. Pace your depth: match the user's emotional tone and complexity.
    5. If user expresses emotion, explore the emotional meaning before abstractions.
    6. Every 3 questions, connect philosophical points back to the user's personal reasoning or lived experience (Mandatory Personal Pivot).
    7. Use the profile context only to tailor curiosity—never to judge, diagnose, or predict.
    8. If detecting overwhelm, anxiety, or existential collapse: pivot to grounding immediately.
    9. Keep questions concise (under 30 words) unless complexity is explicitly welcomed by the "Deep" setting.
    10. Never diagnose. Ask about patterns, not pathologies.
  `;

  const contents: Content[] = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error streaming socratic response:", error);
    throw error;
  }
};

// --- Model B: The Profiler (v2) ---

interface ExtractedInsight {
  value: string;
  confidence: number;
  quote: string;
}

interface AnalysisResult {
  // Philosophy
  philosophicalLeanings: ExtractedInsight[];
  epistemicStyle: string;
  argumentPatterns: ExtractedInsight[];
  
  // Psychology
  coreValues: ExtractedInsight[];
  emotionalThemes: ExtractedInsight[];
  motivationalDrivers: ExtractedInsight[];
  vulnerabilities: ExtractedInsight[];

  // Bio
  biographicalFacts: ExtractedInsight[];
  
  // Summary
  psychologicalUpdate: string;
}

export const analyzeAndUpdateProfile = async (
  lastUserMessage: string,
  currentProfile: UserProfile,
  controls: ControlState,
  chatId?: string
): Promise<UserProfile> => {
  // If inference is disabled, return immediately
  if (!controls.inferenceEnabled) return currentProfile;

  const ai = getAiClient();

  const prompt = `
    Extract from the user's latest message. Only refine existing patterns if the message reinforces them.
    Avoid adding new traits based on a single line unless explicit.

    LATEST USER MESSAGE:
    "${lastUserMessage}"
    
    CURRENT CONTEXT SUMMARY:
    ${currentProfile.psychologicalProfile}

    TASK:
    1. Philosophical Leanings: Textual patterns, not schools (e.g., "Tends toward empiricism" not just "Empiricist").
    2. Epistemic Style: How they form beliefs (e.g., "Intuitive", "Logical deduction", "Authority-based").
    3. Core Values: Goals or moral priorities expressed.
    4. Emotional Themes: Recurring emotional tones.
    5. Motivational Drivers: Patterns inferred across messages.
    6. Vulnerabilities: Sensitive topics or defensive triggers.
    7. Biographical Facts: Literal statements only.
    8. Psychological Update: Observational, non-causal summary.

    CONSTRAINTS:
    - CONFIDENCE: Use 0.2 (Low), 0.5 (Medium), 0.8 (High) only. Never 1.0.
    - DRIVERS: Never assert subconscious traits unless strongly repeated. 
    - LANGUAGE: No clinical/diagnostic language. Use humanistic, descriptive terms.
    - SPLIT: Distinguish philosophy (ideas) from psychology (feelings/drives).
    
    Return JSON.
  `;

  // Define Schema for v2
  const insightItem: Schema = {
    type: Type.OBJECT,
    properties: {
      value: { type: Type.STRING },
      confidence: { type: Type.NUMBER, description: "0.2, 0.5, or 0.8" },
      quote: { type: Type.STRING }
    },
    required: ["value", "confidence", "quote"]
  };

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      philosophicalLeanings: { type: Type.ARRAY, items: insightItem },
      epistemicStyle: { type: Type.STRING },
      argumentPatterns: { type: Type.ARRAY, items: insightItem },
      coreValues: { type: Type.ARRAY, items: insightItem },
      emotionalThemes: { type: Type.ARRAY, items: insightItem },
      motivationalDrivers: { type: Type.ARRAY, items: insightItem },
      vulnerabilities: { type: Type.ARRAY, items: insightItem },
      biographicalFacts: { type: Type.ARRAY, items: insightItem },
      psychologicalUpdate: { type: Type.STRING }
    },
    required: ["philosophicalLeanings", "epistemicStyle", "coreValues", "motivationalDrivers", "biographicalFacts", "psychologicalUpdate"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as AnalysisResult;
      return mergeProfiles(currentProfile, result, lastUserMessage, chatId);
    }
    return currentProfile;
  } catch (error) {
    console.error("Error analyzing profile:", error);
    return currentProfile;
  }
};

// Helper: Merge v2 structure
const mergeProfiles = (
  current: UserProfile, 
  analysis: AnalysisResult, 
  userText: string,
  chatId?: string
): UserProfile => {
  const timestamp = Date.now();

  const mergeList = (existing: InferredAttribute[], newItems: ExtractedInsight[] | undefined): InferredAttribute[] => {
    if (!newItems) return existing;
    const updated = [...existing];
    
    newItems.forEach(item => {
      // Fuzzy match
      const index = updated.findIndex(e => e.value.toLowerCase() === item.value.toLowerCase());
      const newEvidence: Evidence = { quote: item.quote || userText, timestamp, chatId };

      if (index >= 0) {
        // Update existing: Weighted average biased towards max
        const existingItem = updated[index];
        const newConfidence = Math.max(existingItem.confidence, item.confidence);
        updated[index] = {
          ...existingItem,
          confidence: newConfidence,
          evidence: [...existingItem.evidence, newEvidence]
        };
      } else {
        // Add new
        updated.push({
          id: Math.random().toString(36).substring(2, 9),
          value: item.value,
          confidence: item.confidence,
          evidence: [newEvidence]
        });
      }
    });
    return updated;
  };

  // Update Summary
  let newPsychProfile = current.psychologicalProfile;
  if (analysis.psychologicalUpdate && analysis.psychologicalUpdate.length > 10) {
    if (newPsychProfile.includes("beginning their journey")) {
      newPsychProfile = analysis.psychologicalUpdate;
    } else {
      newPsychProfile = `${newPsychProfile}\n\n[Latest]: ${analysis.psychologicalUpdate}`;
    }
  }

  return {
    ...current,
    philosophy: {
      leanings: mergeList(current.philosophy.leanings, analysis.philosophicalLeanings),
      epistemicStyle: analysis.epistemicStyle && analysis.epistemicStyle !== "Undetermined" ? analysis.epistemicStyle : current.philosophy.epistemicStyle,
      argumentPatterns: mergeList(current.philosophy.argumentPatterns, analysis.argumentPatterns)
    },
    psychology: {
      coreValues: mergeList(current.psychology.coreValues, analysis.coreValues),
      emotionalThemes: mergeList(current.psychology.emotionalThemes, analysis.emotionalThemes),
      motivationalDrivers: mergeList(current.psychology.motivationalDrivers, analysis.motivationalDrivers),
      vulnerabilities: mergeList(current.psychology.vulnerabilities, analysis.vulnerabilities)
    },
    biographical: {
      facts: mergeList(current.biographical.facts, analysis.biographicalFacts)
    },
    psychologicalProfile: newPsychProfile
  };
};