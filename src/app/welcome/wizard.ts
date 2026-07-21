// OPEN A TAB wizard — chip data, greetings, grant timeline.
// V3: 4 steps, zero repeated questions. The café language is garnish —
// every question reads plainly first; the metaphor lives in eyebrows,
// the receipt, and the animations. Enrichment questions that used to
// pad the wizard (team size, current setup, launch timeline, CRM) are
// captured later in-product where they have context.

export const ROLES = ["Founder", "Ops / Collections lead", "Developer", "Marketing", "Other"];
export const VERTICALS = ["NBFC", "Bank", "Fintech", "Insurance", "Edtech", "Healthcare", "Other"];
export const LANGS = ["Hinglish", "Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali"];
export const VOLUMES = ["Just exploring", "<1k", "1k–10k", "10k–100k", "100k+"];

// THE ORDER — asked exactly once. This one multi-select replaces the old
// use-case / goals / campaign-kinds triple-ask (three phrasings, one answer).
export const BREWS = [
  "Payment & EMI reminders",
  "Collections follow-ups",
  "KYC / verification",
  "Customer onboarding",
  "Lead qualification",
  "Promotional offers",
  "Surveys & feedback",
  "Missed-call callbacks",
];
// promotional → 140-series + DLT · service/transactional → 160-series (silent routing)
export const PROMO_BREWS = new Set(["Lead qualification", "Promotional offers"]);

export const DIRECTIONS = ["Outbound campaigns", "Inbound answering", "Both ways"];
export const DLT_STATUS = ["DLT-registered already", "Registration in progress", "DLT? Tell me more"];
export const PERSONAS = ["Warm & friendly (Hindi-first)", "Polite & formal (English)", "Firm but fair (collections)", "Upbeat seller (Hinglish)", "Surprise me"];
export const WINDOWS = ["Mornings (9–12)", "Afternoons (12–4)", "Evenings (4–8)", "You pick — keep me TRAI-safe"];

export const GREETINGS: Record<string, string> = {
  Hinglish: "Namaste! Aapki EMI kal due hai — main madad ke liye yahan hoon.",
  Hindi: "नमस्ते! आपकी EMI कल देय है — मैं मदद के लिए यहाँ हूँ।",
  English: "Hello! Your EMI is due tomorrow — I'm here to help.",
  Tamil: "Vanakkam! Ungal EMI naalai due aagum.",
  Telugu: "Namaskaram! Mee EMI repu due undi.",
  Marathi: "Namaskar! Tumchi EMI udya due aahe.",
  Bengali: "Nomoshkar! Apnar EMI kal due ache.",
};

export const STEP_LABELS = ["THE HOUSE", "THE ORDER", "THE VOICE", "THE FIRST POUR"];

export const GRANT = { SCROLL: 0, STAMP: 400, POUR: 900, SUB: 2600, WIPE: 3400, SKIP_AFTER: 300 } as const;

export type RLine = { label: string; value: string; tone?: "milk" | "free" | "verified" };

export const readback = (p: { name?: string; useCase?: string; languages?: string[]; vertical?: string }) => [
  `Namaste ${p.name?.split(" ")[0] || "ji"}! Aapka order taiyaar hai — ${(p.useCase || "voice campaigns").toLowerCase()}, ${p.languages?.[0] || "Hinglish"} mein, aapke ${p.vertical || "business"} ke liye.`,
  "Yeh raha aapka pehla pour — bilkul on the house.",
  "Jab aap taiyaar hon, dashboard se apna pehla campaign brew kijiye. Milte hain!",
];
