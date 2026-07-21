// Campaign-builder option data, derived from the captured providers/available + campaign config.
// "recommended" flags drive smart defaults so operators change as little as possible.

export type Provider = { id: string; name: string; sub?: string; recommended?: boolean };

export const telephonyProviders: Provider[] = [
  { id: "plivo", name: "Plivo", sub: "Default carrier", recommended: true },
  { id: "exotel", name: "Exotel", sub: "India DLT-ready" },
  { id: "smartflo", name: "SmartFlo", sub: "Tata Tele" },
  { id: "vapi", name: "Vapi", sub: "Global" },
];

export const sttProviders: Provider[] = [
  { id: "deepgram", name: "Deepgram", sub: "Nova-3 · best accuracy", recommended: true },
  { id: "sarvam", name: "Sarvam", sub: "Indic-tuned" },
];

export const llmProviders: Provider[] = [
  { id: "gemini", name: "Google Gemini", sub: "2.5 Flash · fast", recommended: true },
  { id: "gpt", name: "OpenAI GPT", sub: "4o-mini" },
  { id: "claude", name: "Anthropic Claude", sub: "Haiku" },
];

export const ttsProviders: Provider[] = [
  { id: "sarvam", name: "Sarvam (Bulbul)", sub: "Natural Indic voices", recommended: true },
  { id: "cartesia", name: "Cartesia (Sonic)", sub: "Low latency" },
];

export const languages = [
  { code: "hi", label: "Hindi", recommended: true },
  { code: "en", label: "English", recommended: true },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
];

export const campaignTypes = ["Outbound", "Reminder", "Collections", "Activation", "Survey"];

export const fieldTypes = ["text", "number", "phone", "date", "amount", "enum"] as const;
export type FieldType = (typeof fieldTypes)[number];

export type SchemaField = {
  id: string;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  scoring: boolean;   // feeds the lead score
  agentVar: boolean;  // exposed to the agent mid-call
};

export const defaultSchema: SchemaField[] = [
  { id: "f1", label: "Lead name", key: "name", type: "text", required: true, scoring: false, agentVar: true },
  { id: "f2", label: "Phone", key: "phone", type: "phone", required: true, scoring: false, agentVar: false },
  { id: "f3", label: "Amount due", key: "amount_due", type: "amount", required: false, scoring: true, agentVar: true },
  { id: "f4", label: "Days overdue", key: "days_overdue", type: "number", required: false, scoring: true, agentVar: false },
];

// scoring rule per scoring field: weight (1-5) + direction
export type ScoreRule = { key: string; label: string; weight: number; direction: "higher" | "lower" };

export const defaults = {
  telephony: "plivo",
  stt: "deepgram",
  llm: "gemini",
  tts: "sarvam",
  primaryLanguage: "hi",
  secondaryLanguages: ["en"],
  agentGender: "Female",
  callStart: "09:00",
  callEnd: "20:00",
  maxConcurrent: 3, // = 1 channel
  dailyLimit: 1000,
  voiceSpeed: 1.1,
  creativity: 0.7,
};
