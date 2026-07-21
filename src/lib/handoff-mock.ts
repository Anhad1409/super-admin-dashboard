// Handoff console — calls the bot escalated/completed, each opens a 3-pane detail.
export type TLine = { who: "agent" | "customer"; text: string };
export type HandoffCall = {
  id: string;
  name: string; phone: string; email: string;
  campaign: string; campaignId: string;
  score: number; band: "hot" | "warm" | "cold";
  status: "Completed" | "Transferred" | "Callback";
  summary: string;
  lowConfidence: boolean;
  when: string; durationSec: number;
  concerns: string[];
  transcript: TLine[];
  collected: { k: string; v: string }[];
};

export const handoffCalls: HandoffCall[] = [
  {
    id: "hc1", name: "Rahul Mehta", phone: "+91 98•••• ••23", email: "rahul.m@example.com",
    campaign: "EMI Reminders", campaignId: "c2", score: 72, band: "warm", status: "Completed",
    summary: "Customer asked for a 7-day extension on the June EMI; confirmed identity and agreed to a callback after salary credit.",
    lowConfidence: false, when: "12 min ago", durationSec: 214,
    concerns: ["PAYMENT DELAY"],
    transcript: [
      { who: "agent", text: "नमस्ते, मैं Blostem Bank से Aria बोल रही हूँ। क्या मेरी बात Rahul जी से हो रही है?" },
      { who: "customer", text: "Haan, boliye." },
      { who: "agent", text: "आपकी June की EMI ₹8,400 due है। क्या आप आज भुगतान कर पाएंगे?" },
      { who: "customer", text: "Abhi thoda tight hai, salary 7 tareekh ko aayegi." },
      { who: "agent", text: "कोई बात नहीं — मैं 8 तारीख को callback schedule कर देती हूँ। ठीक है?" },
      { who: "customer", text: "Haan theek hai, 8th ko call kar lena." },
    ],
    collected: [{ k: "Full name", v: "Rahul Mehta" }, { k: "Reason", v: "Salary timing" }, { k: "Promise-to-pay", v: "8 Jun" }, { k: "Outstanding", v: "₹8,400" }],
  },
  {
    id: "hc2", name: "Sneha Iyer", phone: "+91 99•••• ••56", email: "sneha.iyer@example.com",
    campaign: "Outreach campaign", campaignId: "c1", score: 84, band: "hot", status: "Transferred",
    summary: "High-intent lead for a personal loan top-up; asked for exact rate and wanted to speak to a human. Transferred to closer.",
    lowConfidence: false, when: "26 min ago", durationSec: 167,
    concerns: ["RATE QUERY"],
    transcript: [
      { who: "agent", text: "Hi Sneha, this is Aria from Blostem. You'd pre-qualified for a top-up — is now a good time?" },
      { who: "customer", text: "Yes — what's the interest rate exactly?" },
      { who: "agent", text: "It depends on your profile; let me connect you to a specialist who can confirm the exact rate." },
      { who: "customer", text: "Sure, please do." },
    ],
    collected: [{ k: "Full name", v: "Sneha Iyer" }, { k: "Product", v: "Personal loan top-up" }, { k: "Intent", v: "High" }],
  },
  {
    id: "hc3", name: "Imran Khan", phone: "+91 98•••• ••89", email: "—",
    campaign: "IOB : Mobile Banking Activation", campaignId: "c3", score: 41, band: "cold", status: "Completed",
    summary: "Caller confused about app charges; partial info captured. Summary confidence low — recommend manual review.",
    lowConfidence: true, when: "1 hr ago", durationSec: 98,
    concerns: ["CONFUSION"],
    transcript: [
      { who: "agent", text: "नमस्ते, IOB Mobile Banking activation के लिए call कर रही हूँ।" },
      { who: "customer", text: "Ye charges kya hain? Mujhe samajh nahi aaya." },
      { who: "agent", text: "कोई charges नहीं हैं activation के लिए — बिल्कुल free है।" },
      { who: "customer", text: "Achha… theek hai dekhता hoon." },
    ],
    collected: [{ k: "Full name", v: "Imran Khan" }, { k: "Query", v: "App charges" }],
  },
];
