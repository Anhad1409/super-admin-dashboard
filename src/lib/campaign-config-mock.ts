// Shared campaign-configuration data — Products (templates) seed flow/scoring/schema/voice/LLM,
// and back the Quick wizard, Advanced builder, and the campaign-detail config sections.

export type Product = {
  id: string;
  name: string;
  category: "Lending" | "Insurance" | "Collections" | "Surveys" | "Real Estate" | "Banking" | "EdTech";
  description: string;
  flow: string;
  schema: string;
  scoring: string;
  voice: string;
  llm: string;
  fields: number;
};

export const products: Product[] = [
  { id: "p_personal", name: "Personal Loan", category: "Lending", description: "Unsecured personal-loan outreach & qualification.", flow: "Loan Qualification v3", schema: "Loan Consolidation", scoring: "Lending — high intent", voice: "Aria · Sarvam Bulbul", llm: "GPT-4o-mini · 0.4", fields: 9 },
  { id: "p_edtech", name: "Personal edtech", category: "EdTech", description: "Course enrolment & counselling callbacks.", flow: "Counselling v2", schema: "Student Lead", scoring: "EdTech — warm-up", voice: "Meera · ElevenLabs", llm: "Gemini 2.5 Flash · 0.5", fields: 7 },
  { id: "p_emi", name: "EMI Reminders", category: "Collections", description: "Pre-due & overdue EMI reminder calls.", flow: "Collections — soft v4", schema: "Borrower", scoring: "Collections — risk", voice: "Kabir · Sarvam", llm: "GPT-4o-mini · 0.2", fields: 8 },
  { id: "p_health", name: "Health Insurance", category: "Insurance", description: "Policy renewal & cross-sell.", flow: "Insurance Renewal v1", schema: "Policyholder", scoring: "Insurance — propensity", voice: "Aria · ElevenLabs", llm: "Claude Haiku · 0.4", fields: 10 },
  { id: "p_banking", name: "Mobile Banking Activation", category: "Banking", description: "Activate dormant mobile-banking users.", flow: "Activation v2", schema: "Account Holder", scoring: "Activation — likelihood", voice: "Meera · Sarvam", llm: "Gemini 2.5 Flash · 0.3", fields: 6 },
  { id: "p_survey", name: "CSAT Survey", category: "Surveys", description: "Post-service satisfaction survey.", flow: "Survey — NPS v1", schema: "Respondent", scoring: "—", voice: "Kabir · Sarvam", llm: "GPT-4o-mini · 0.6", fields: 5 },
];

export type SchemaField = { key: string; label: string; type: "text" | "phone" | "number" | "email" | "date"; required?: boolean };
export const defaultSchema: SchemaField[] = [
  { key: "phone", label: "Phone", type: "phone", required: true },
  { key: "full_name", label: "Full name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "loan_amount", label: "Loan amount", type: "number" },
  { key: "employer", label: "Employer", type: "text" },
  { key: "city", label: "City", type: "text" },
];

export type ScoreRule = { field: string; condition: string; points: number };
export const scoringRules: ScoreRule[] = [
  { field: "loan_amount", condition: "> ₹3,00,000", points: 25 },
  { field: "employer", condition: "is salaried", points: 20 },
  { field: "city", condition: "is metro", points: 10 },
  { field: "intent", condition: "asked about rate", points: 30 },
];
export const scoreBands = { hot: 75, warm: 50 }; // Cold 0–50 · Warm 50–75 · Hot 75–100

// In-call score adjustments the agent applies live (built-ins are locked).
export const inCallSignals = [
  { key: "showed_interest", label: "Showed interest", delta: 15, locked: true },
  { key: "agreed_to_callback", label: "Agreed to callback", delta: 10, locked: true },
  { key: "confirmed_identity", label: "Confirmed identity", delta: 5, locked: true },
  { key: "provided_info", label: "Provided info", delta: 10, locked: true },
  { key: "busy_no_time", label: "Busy / no time", delta: -5, locked: true },
  { key: "rude_behavior", label: "Rude behaviour", delta: -20, locked: true },
  { key: "not_interested", label: "Not interested", delta: -25, locked: true },
  { key: "wrong_number", label: "Wrong number", delta: -50, locked: true },
  { key: "language_barrier", label: "Language barrier", delta: -10, locked: true },
];

// Campaign-creation option sets (match the original wizard)
export const campaignTypes2 = ["Outbound", "Missed Call", "Inbound"];
export const agentGenders = ["Female (default)", "Male"];
export const langs = ["Hinglish", "Hindi", "English", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali", "Gujarati", "Punjabi"];
export const fieldTypes = ["Text", "Number", "Yes-No"];
export const backgroundSounds = ["None", "Office", "Cafe", "Street"];

// Lead-schema core fields (always present, not editable)
export const coreFields = [
  { key: "phone", label: "Phone", note: "required · normalized to +91XXXXXXXXXX · used to place the call" },
  { key: "full_name", label: "Full Name", note: "required · used in the agent greeting & across the dashboard" },
  { key: "email", label: "Email", note: "optional · used by post-call automation" },
];

// Real-time tools the agent can call mid-conversation. 5 core are auto-enabled + locked.
export type Skill = { id: string; name: string; desc: string; core?: boolean; on: boolean };
export const agentSkills: Skill[] = [
  { id: "calc_savings", name: "calculate_savings", desc: "Compute EMI / savings live on call", core: true, on: true },
  { id: "transfer_call", name: "transfer_call", desc: "Warm-transfer to a human agent", core: true, on: true },
  { id: "schedule_callback", name: "schedule_callback", desc: "Book a callback slot", core: true, on: true },
  { id: "end_call", name: "end_call", desc: "Gracefully end the conversation", core: true, on: true },
  { id: "detect_voicemail", name: "detect_voicemail", desc: "Detect & handle voicemail", core: true, on: true },
  { id: "customer_data", name: "customer_data", desc: "Collect & store the Customer Data fields defined in step 3 — must be ON or nothing is captured", on: true },
  { id: "bureau_check", name: "bureau_check", desc: "Pull a credit-bureau (CIBIL) score mid-call", on: false },
  { id: "take_payment", name: "take_payment", desc: "Collect a payment / set up auto-pay on the call", on: false },
  { id: "send_sms", name: "send_sms", desc: "Send a follow-up SMS", on: false },
  { id: "lookup_account", name: "lookup_account", desc: "Fetch account details via API", on: false },
];

export const dispositions = [
  { key: "interested", label: "Interested / Qualified", tone: "success", builtin: true },
  { key: "callback", label: "Callback Scheduled", tone: "info", builtin: true },
  { key: "transferred", label: "Transferred", tone: "info", builtin: true },
  { key: "not_interested", label: "Not Interested", tone: "warning", builtin: true },
  { key: "no_outcome", label: "Ended — No Outcome", tone: "muted", builtin: true },
  { key: "not_connected", label: "Not Connected", tone: "muted", builtin: true },
  { key: "dnc", label: "Do Not Call", tone: "danger", builtin: true },
  { key: "wrong_number", label: "Wrong Number", tone: "danger", builtin: true },
];

export const phoneNumbers = [
  { id: "default", label: "Org default (+91 80 4718 xxxx)" },
  { id: "ddl1", label: "+91 80 4718 2201" },
  { id: "ddl2", label: "+91 22 6140 9930" },
];

export const callQualityPresets = ["Balanced (default)", "Low-latency", "High-accuracy"];
export const transferModes = ["Warm transfer", "Cold transfer", "No transfer"];
