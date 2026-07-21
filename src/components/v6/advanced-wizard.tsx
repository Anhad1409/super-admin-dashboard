"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, ChevronLeft, ChevronRight, Info, Save, Plus, Trash2, Lock, AlertTriangle,
  ListChecks, Users2, Target, GitBranch, Phone, BookOpen, Sparkles, ChevronDown, Braces, Wrench,
  CalendarClock, ShieldAlert, Coffee, Bell, Calendar, UploadCloud, Bot, Play, X, Mail, MessageSquare,
} from "lucide-react";
import { LeadUpload, type LeadUploadInfo } from "@/components/campaigns/lead-upload";
import { worldCampaigns } from "@/lib/derived";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpHint } from "@/components/ui-bits/help-hint";
import { Tour, type TourStep } from "@/components/onboarding/tour";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import {
  products, coreFields, fieldTypes, campaignTypes2, agentGenders, langs, scoreBands,
  inCallSignals, dispositions, phoneNumbers, backgroundSounds, agentSkills,
} from "@/lib/campaign-config-mock";
import { WEEKDAYS, TIMEZONES, defaultQuietHours, type QuietWindow } from "@/lib/v6-mock";

const inputCls = "w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel focus:ring-1 focus:ring-caramel/30";
const STEPS = [
  { key: "basic", label: "Basics", icon: Info, sub: "Name, agent & calling rules" },
  { key: "schema", label: "Lead Schema", icon: ListChecks, sub: "The columns each lead carries" },
  { key: "customer", label: "Customer Data", icon: Users2, sub: "What to collect on the call" },
  { key: "scoring", label: "Scoring", icon: Target, sub: "How leads are ranked" },
  { key: "flow", label: "Conversation", icon: GitBranch, sub: "What the agent says" },
  { key: "voiceai", label: "Voice & AI", icon: Bot, sub: "Transcriber, LLM & speaking voice" },
  { key: "phone", label: "Phone & Outcomes", icon: Phone, sub: "Number, transfer & dispositions" },
  { key: "skills", label: "Agent Skills", icon: Wrench, sub: "Real-time tools the agent can use" },
  { key: "messaging", label: "Email & SMS", icon: Mail, sub: "Templates the agent can send", badge: "new" },
  { key: "schedule", label: "Schedule", icon: CalendarClock, sub: "When it runs", badge: "new" },
  { key: "pauses", label: "Smart pauses", icon: ShieldAlert, sub: "Quiet hours & auto-pause", badge: "new" },
  { key: "leads", label: "Upload Leads", icon: UploadCloud, sub: "CSV, paste, or add later" },
];

// seed template libraries (org-level; provider setup lives in Settings)
const SEED_EMAIL_TPLS = [
  { name: "Loan offer summary", subject: "Your pre-approved offer, {full_name}", on: true },
  { name: "Payment link follow-up", subject: "Complete your payment — secure link inside", on: false },
];
const SEED_SMS_TPLS = [
  { name: "Payment reminder", body: "Dear {full_name}, your EMI of ₹{emi_amount} is due on {due_date}. Pay: {link}", dlt: true, on: true },
  { name: "KYC link", body: "{full_name}, complete your KYC here: {link} — takes 2 minutes.", dlt: true, on: false },
];

// Voice & AI option sets (org defaults first, matching the provider stack)
const LLM_OPTS = ["Use org default — Groq · Llama-3.3-70B", "Google · Gemini 2.5 Flash", "OpenAI · GPT-4o-mini"];
const TTS_OPTS = ["Use org default — Cartesia · Sonic-3", "Sarvam · Bulbul v3", "ElevenLabs · Multilingual v2"];
const VOICE_OPTS = ["Default voice", "Aria (warm, f)", "Meera (crisp, f)", "Kabir (calm, m)"];
const PRESETS = ["No preset — use the settings below", "Crisp collections", "Warm sales", "Patient support"];
const COUNTS_AS = ["Committed", "Positive", "Neutral", "Negative"];
const countsTone: Record<string, string> = {
  Committed: "border-success/30 bg-success/10 text-success",
  Positive: "border-info/30 bg-info/10 text-info",
  Neutral: "border-foam bg-oat/60 text-mocha",
  Negative: "border-danger/30 bg-danger/10 text-danger",
};
const slugify = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "outcome";

// real hover tooltip (not a native title=) — shows the explanation on hover/focus
function Tip({ t }: { t: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" aria-label="More info" className="inline-flex cursor-help text-muted-foreground/60 transition-colors hover:text-caramel"><Info className="size-3.5" /></button>}
      />
      <TooltipContent side="top" className="max-w-[260px] text-left leading-relaxed">{t}</TooltipContent>
    </Tooltip>
  );
}
function Lbl({ children, req, tip }: { children: React.ReactNode; req?: boolean; tip?: string }) {
  return <label className="flex items-center gap-1 text-sm font-medium text-coffee">{children}{req && <span className="text-danger">*</span>}{tip && <Tip t={tip} />}</label>;
}
function Group({ title, sub, help, children }: { title?: string; sub?: string; help?: string; children: React.ReactNode }) {
  return <div>{title && <div className="mb-3"><h3 className="flex items-center gap-1.5 text-sm font-semibold text-coffee">{title}{help && <HelpHint text={help} side="top" />}</h3>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</div>}<div className="space-y-4">{children}</div></div>;
}
function More({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-foam bg-card/60">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-mocha"><ChevronDown className="size-4 transition-transform group-open:rotate-180" /> {label}</summary>
      <div className="space-y-4 px-3.5 pb-4 pt-1">{children}</div>
    </details>
  );
}
function Toggle({ on, set, dim }: { on: boolean; set?: () => void; dim?: boolean }) {
  return <button type="button" disabled={!set} onClick={set} className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-success" : "bg-foam", dim && "opacity-60")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} /></button>;
}
type XField = { label: string; name: string; type: string; def: string; required: boolean; scoring: boolean; convo: boolean };

export type EditCampaign = { id: string; name: string; description?: string | null; agent?: string; language?: string };

export function V6AdvancedWizard({ edit }: { edit?: EditCampaign }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  // remember the step the user was on when they launched the tour, so finishing
  // or skipping it returns them exactly there instead of stranding them mid-flow.
  const stepRef = useRef(step);
  stepRef.current = step;
  const preTourStep = useRef(0);
  useEffect(() => {
    const capture = () => { preTourStep.current = stepRef.current; };
    window.addEventListener("start-tour", capture);
    return () => window.removeEventListener("start-tour", capture);
  }, []);
  const [name, setName] = useState(edit?.name ?? "");
  const [desc, setDesc] = useState(edit?.description ?? "");
  const [agent, setAgent] = useState(edit?.agent ?? "");
  const [type, setType] = useState(campaignTypes2[0]);
  const [lang, setLang] = useState(() => langs.find((l) => l.toLowerCase() === edit?.language?.toLowerCase()) ?? langs[0]);
  const [xfields, setXfields] = useState<XField[]>([]);
  const [cdata, setCdata] = useState<{ label: string }[]>([]);
  const [warmT, setWarmT] = useState(scoreBands.warm);
  const [hotT, setHotT] = useState(scoreBands.hot);
  const [leadInfo, setLeadInfo] = useState<LeadUploadInfo>({ state: "empty", fileName: "", total: 0, valid: 0, invalid: 0 });
  // custom in-call adjustments + custom outcomes (built-ins stay locked)
  const [customSignals, setCustomSignals] = useState<{ label: string; delta: number }[]>([]);
  const [outcomes, setOutcomes] = useState<{ name: string; code: string; countsAs: string; desc: string; endCall: boolean }[]>([]);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [oName, setOName] = useState(""); const [oCounts, setOCounts] = useState(COUNTS_AS[0]);
  const [oDesc, setODesc] = useState(""); const [oEnd, setOEnd] = useState(false);
  // messaging templates the agent may send mid-call
  const [emailTpls, setEmailTpls] = useState(SEED_EMAIL_TPLS);
  const [smsTpls, setSmsTpls] = useState(SEED_SMS_TPLS);
  const [newEmail, setNewEmail] = useState<{ name: string; subject: string } | null>(null);
  const [newSms, setNewSms] = useState<{ name: string; body: string } | null>(null);
  // voice & AI
  const [llm, setLlm] = useState(LLM_OPTS[0]);
  const [tts, setTts] = useState(TTS_OPTS[0]);
  const [voice, setVoice] = useState(VOICE_OPTS[0]);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [speed, setSpeed] = useState(1.2);
  const [temp, setTemp] = useState(0.7);
  const [transcriber, setTranscriber] = useState("Hindi");

  const addOutcome = () => {
    if (!oName.trim()) return;
    setOutcomes((o) => [...o, { name: oName.trim(), code: slugify(oName), countsAs: oCounts, desc: oDesc.trim(), endCall: oEnd }]);
    setOutcomeOpen(false); setOName(""); setOCounts(COUNTS_AS[0]); setODesc(""); setOEnd(false);
    toast({ title: "Outcome added", body: `“${oName.trim()}” counts as ${oCounts}.`, severity: "success" });
  };
  const [prompt, setPrompt] = useState("You are {agent_name} from {company}. Greet warmly, confirm the right person, state the benefit in one line, handle objections, and capture intent. Respect Do-Not-Call.");
  const [objs, setObjs] = useState<{ o: string; r: string }[]>([{ o: "not available right now", r: "what would be a good time to call you back?" }]);
  const [transferOn, setTransferOn] = useState(false);
  const [skills, setSkills] = useState(() => agentSkills.map((s) => ({ ...s })));
  // v6: scheduling
  const [startMode, setStartMode] = useState<"now" | "later">("now");
  const [startDate, setStartDate] = useState("2026-06-27");
  const [startTime, setStartTime] = useState("09:00");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [callStart, setCallStart] = useState("09:00");
  const [callEnd, setCallEnd] = useState("18:00");
  const [tz, setTz] = useState(TIMEZONES[0]);
  // v6: smart pauses
  const [quietOn, setQuietOn] = useState(true);
  const [quiet, setQuiet] = useState<QuietWindow[]>(defaultQuietHours);
  const [issueOn, setIssueOn] = useState(true);
  const [threshold, setThreshold] = useState(10);
  const [severity, setSeverity] = useState("High & medium");
  const [mode, setMode] = useState<"notify" | "auto">("notify");
  const toggleDay = (i: number) => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort()));
  const dayLabel = days.length === 7 ? "every day" : days.length === 5 && days.every((d) => d < 5) ? "Mon–Fri" : days.length === 0 ? "no days" : days.map((d) => WEEKDAYS[d]).join(", ");
  const tzShort = tz.split("(")[1]?.replace(")", "") || "IST";
  const schedLine = `${dayLabel}, ${callStart}–${callEnd} ${tzShort}${startMode === "later" ? ` · from ${startDate}` : " · starts now"}`;
  const cur = STEPS[step];

  const addX = () => setXfields((f) => [...f, { label: `Field ${String.fromCharCode(65 + f.length)}`, name: `field_${f.length + 1}`, type: "Text", def: "", required: false, scoring: false, convo: true }]);
  const setX = (i: number, patch: Partial<XField>) => setXfields((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const scoringFields = xfields.filter((f) => f.scoring);

  const canNext = (() => {
    if (cur.key === "basic") return name.trim().length > 0 && agent.trim().length > 0;
    if (cur.key === "schema") return xfields.length >= 1;
    return true;
  })();
  const goNext = () => { if (!canNext) { setTried(true); return; } setTried(false); setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const draft = () => toast({ title: "Saved as draft", body: "Resume anytime — drafts live for 5 days.", severity: "info" });
  const create = () => {
    if (edit) {
      toast({ title: "Changes saved", body: `“${name || edit.name}” updated.`, severity: "success" });
      router.push(`/campaigns/${edit.id}`);
      return;
    }
    toast({ title: "Campaign scheduled", body: `“${name || "Untitled"}” will run ${schedLine.toLowerCase()}.`, severity: "success" });
    router.push("/campaigns");
  };

  // live summary rows
  const summary = [
    { k: "Type", v: type, done: true },
    { k: "Lead schema", v: xfields.length ? `${xfields.length} extra field${xfields.length > 1 ? "s" : ""}` : "core only", done: xfields.length > 0 },
    { k: "Leads", v: leadInfo.state === "done" ? `${leadInfo.valid} imported` : leadInfo.state === "preview" ? `${leadInfo.valid} ready to import` : "add later", done: leadInfo.state === "done" },
    { k: "Customer data", v: cdata.length ? `${cdata.length} field${cdata.length > 1 ? "s" : ""}` : "none", done: cdata.length > 0 },
    { k: "Scoring", v: `${warmT} / ${hotT}`, done: true },
    { k: "Objection handlers", v: `${objs.length}`, done: objs.length > 0 },
    { k: "Voice & AI", v: preset === PRESETS[0] ? `${speed.toFixed(1)}× · t${temp.toFixed(1)}` : preset, done: true },
    { k: "Custom outcomes", v: outcomes.length ? `${outcomes.length}` : "built-ins only", done: outcomes.length > 0 },
    { k: "Transfer", v: transferOn ? "On" : "Off", done: true },
    { k: "Messaging", v: `${emailTpls.filter((t) => t.on).length} email · ${smsTpls.filter((t) => t.on).length} SMS`, done: emailTpls.some((t) => t.on) || smsTpls.some((t) => t.on) },
    { k: "Agent skills", v: `${skills.filter((s) => s.on).length} on`, done: true },
    { k: "Schedule", v: schedLine, done: true },
    { k: "Quiet hours", v: quietOn ? `${quiet.length} window${quiet.length > 1 ? "s" : ""}` : "off", done: quietOn },
    { k: "Auto-pause", v: issueOn ? `≥${threshold} reports` : "off", done: issueOn },
  ];

  // Guided walkthrough of the FULL campaign journey — each step drives the
  // wizard to the matching page (via `before`) so the tour shows real content,
  // not just an overview. Triggered by the "Show me how" button (start-tour).
  const advTour: TourStep[] = [
    { sel: '[data-tour="adv-steps"]', title: "Twelve steps, one campaign", body: `${STEPS.map((s) => s.label).join(" · ")}. Green = done — jump to any step from this rail anytime, and hover any ⓘ for help as you go.`, before: () => setStep(0) },
    { sel: '[data-tour="adv-form"]', title: "1 · Basics", body: "Name the campaign and its agent — the only required fields to advance. Language, greeting, calling rules and limits live here too.", before: () => setStep(0) },
    { sel: '[data-tour="adv-form"]', title: "2 · Lead Schema", body: "The columns each lead carries. Phone, Full Name and Email are automatic — add extras like monthly_income. One extra field unlocks Next.", before: () => setStep(1) },
    { sel: '[data-tour="adv-form"]', title: "3 · Customer Data", body: "Extra details the agent collects live on the call. Auto-prefixed ld_enrich_ and stored per call — needs the Customer Data skill on.", before: () => setStep(2) },
    { sel: '[data-tour="adv-form"]', title: "4 · Scoring", body: "Set where Cold becomes Warm becomes Hot, weight your scoring fields, review the locked in-call signals — and add your own custom adjustments.", before: () => setStep(3) },
    { sel: '[data-tour="adv-form"]', title: "5 · Conversation", body: "What the agent says — system prompt, greeting, the {variables} it can use, and your objection handlers.", before: () => setStep(4) },
    { sel: '[data-tour="adv-form"]', title: "6 · Voice & AI", body: "Transcriber language, the LLM brain, the speaking voice with preview, and call-behaviour presets with fine-tuning.", before: () => setStep(5) },
    { sel: '[data-tour="adv-form"]', title: "7 · Phone & Outcomes", body: "Pick the outbound number, switch on human transfer, and define custom outcomes — each counts as a result that drives colour and follow-up.", before: () => setStep(6) },
    { sel: '[data-tour="adv-form"]', title: "8 · Agent Skills", body: "Real-time tools the agent can invoke mid-call. Core skills stay on; toggle the optional ones per campaign.", before: () => setStep(7) },
    { sel: '[data-tour="adv-form"]', title: "9 · Email & SMS", body: "Pre-approved templates the agent can send mid-call — {placeholders} fill from the lead row. SMS honours DLT approval.", before: () => setStep(8) },
    { sel: '[data-tour="adv-form"]', title: "10 · Schedule", body: "Start now or pick a date, then choose the days and calling window — calls only ever dial inside it.", before: () => setStep(9) },
    { sel: '[data-tour="adv-form"]', title: "11 · Smart pauses", body: "Auto-pause during quiet hours, and let VoiceBrew step in if many customers report the same blocker.", before: () => setStep(10) },
    { sel: '[data-tour="adv-form"]', title: "12 · Upload Leads", body: "Last step: drop the CSV this campaign will dial — columns map to your schema by name, invalid phones are flagged before import. Or add leads later.", before: () => setStep(11) },
    { sel: '[data-tour="adv-next"]', title: "Save or create", body: "Save as Draft on any step — drafts live for 5 days. When every step looks good, Create Campaign here or from the summary panel.", before: () => setStep(11) },
    { sel: '[data-tour="adv-summary"]', title: "Live summary", body: "This panel updates as you build and tracks your progress. Create the campaign from here anytime.", before: () => setStep(11) },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={edit ? "Edit Campaign" : "Create Campaign"}
        subtitle={edit ? `Editing “${edit.name}” — changes apply when you save.` : "Advanced — full control, step by step."}
        actions={
          <div className="flex items-center gap-2">
            <button data-tour="adv-help" onClick={() => window.dispatchEvent(new CustomEvent("start-tour"))} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foam bg-oat/70 px-3 py-1.5 text-xs font-medium text-mocha transition-colors hover:bg-foam">
              <Sparkles className="size-3.5 text-caramel" /> Show me how
            </button>
            <Button variant="outline" size="sm" onClick={() => router.push("/campaigns/quick")} className="text-mocha">Switch to Quick</Button>
          </div>
        } />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[190px_1fr_270px]">
        {/* STEP RAIL */}
        <nav data-tour="adv-steps" className="flex gap-1 overflow-x-auto rounded-2xl border border-foam bg-porcelain p-2 shadow-glass lg:flex-col lg:overflow-visible">
          {STEPS.map((s, i) => {
            const Icon = s.icon; const active = i === step; const done = i < step;
            return (
              <button key={s.key} onClick={() => setStep(i)} className={cn("flex shrink-0 items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors", active ? "bg-secondary" : "hover:bg-oat/60")}>
                <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", done ? "bg-success text-white" : active ? "bg-brand text-brand-foreground" : "bg-foam text-muted-foreground")}>{done ? <Check className="size-3" /> : i + 1}</span>
                <span className="min-w-0"><span className={cn("block text-sm font-medium", active ? "text-brand" : done ? "text-coffee" : "text-mocha/80")}>{s.label}</span><span className="hidden text-[11px] leading-tight text-muted-foreground lg:block">{s.sub}</span></span>
              </button>
            );
          })}
        </nav>

        {/* FORM */}
        <div data-tour="adv-form" className="rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
          <div className="mb-1 flex items-center gap-2"><cur.icon className="size-5 text-caramel" /><h2 className="font-serif text-xl font-semibold text-coffee">{cur.label}</h2></div>
          <p className="mb-6 text-sm text-muted-foreground">{cur.sub}.</p>

          {/* STEP: BASICS */}
          {cur.key === "basic" && (
            <div className="space-y-6">
              <Group title="Identity" help="The campaign's name, who the AI says it is, and the language it speaks. Name and Agent are required; everything else inherits org defaults.">
                <div className="space-y-1.5"><Lbl req tip="Naming convention: Product - Segment - Quarter. Appears in reports and the calls list. Start typing for recent names.">Campaign Name</Lbl><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home Loan — Salaried — Q1" list="vb-campaign-names" className={inputCls} /><datalist id="vb-campaign-names">{worldCampaigns.map((w) => <option key={w.id} value={w.name} />)}</datalist>{tried && !name.trim() && <p className="text-xs text-danger">Campaign name is required</p>}</div>
                <div className="space-y-1.5"><Lbl tip="Internal note — never spoken on the call. Helps your team know what this campaign is for.">Description</Lbl><textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description of the campaign" className={inputCls + " h-16 resize-none"} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Lbl req tip="The name the AI introduces itself with.">Agent Name</Lbl><Input value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="e.g. Anjali" className={inputCls} />{tried && !agent.trim() && <p className="text-xs text-danger">Agent name is required</p>}</div>
                  <div className="space-y-1.5"><Lbl>Company Name</Lbl><Input defaultValue="Blostem" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl tip="Drives Hindi conjugation & TTS voice.">Agent Gender</Lbl><select className={inputCls}>{agentGenders.map((g) => <option key={g}>{g}</option>)}</select></div>
                  <div className="space-y-1.5"><Lbl>Language</Lbl><select value={lang} onChange={(e) => setLang(e.target.value)} className={inputCls}>{langs.map((l) => <option key={l}>{l}</option>)}</select></div>
                </div>
                <div className="space-y-1.5"><Lbl tip="Opening line. Supports {full_name}, {company}, {agent_name}.">Greeting</Lbl><Input defaultValue="Hi {full_name}, this is {agent_name} from {company}." className={inputCls} /></div>
              </Group>

              <More label="Calling rules & limits">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Lbl tip="Outbound: you call leads. Missed Call: auto-callback. Inbound: receive.">Campaign Type</Lbl><select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>{campaignTypes2.map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div className="space-y-1.5"><Lbl tip="Shown on Truecaller.">Call Reason Tag</Lbl><Input placeholder="e.g. Loan Offer" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Call Start (IST)</Lbl><Input type="time" defaultValue="09:00" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Call End (IST)</Lbl><Input type="time" defaultValue="21:00" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Max Concurrent Calls</Lbl><Input type="number" defaultValue={3} className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Daily Call Limit</Lbl><Input type="number" defaultValue={1000} className={inputCls} /></div>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Info className="size-3.5" /> Calls stay within the compliance window (09:00–21:00 IST).</p>
              </More>
            </div>
          )}

          {/* STEP: LEAD SCHEMA */}
          {cur.key === "schema" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-info/25 bg-info/5 p-3 text-xs text-mocha">
                <span className="font-medium text-coffee">3 core fields are automatic</span> — Phone, Full Name, Email. Only add the extra columns this campaign needs (e.g. monthly_income, employer).
              </div>
              <div className="space-y-1.5"><Lbl req>Schema name</Lbl><Input defaultValue={name ? `${name} — Lead Schema` : "Lead Schema"} className={inputCls + " max-w-sm"} /></div>

              {xfields.length === 0 ? (
                <button onClick={addX} className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-latte bg-oat/30 px-6 py-8 text-center transition-colors hover:border-caramel hover:bg-oat/50">
                  <Plus className="size-6 text-caramel" /><span className="text-sm font-medium text-coffee">Add your first field</span><span className="text-xs text-muted-foreground">Next unlocks once you add one.</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {xfields.map((f, i) => (
                    <div key={i} className="rounded-xl border border-foam bg-card p-3">
                      <div className="flex items-center gap-2">
                        <Input value={f.label} onChange={(e) => setX(i, { label: e.target.value })} className={inputCls + " flex-1"} placeholder="Label" />
                        <Input value={f.name} onChange={(e) => setX(i, { name: e.target.value })} className={inputCls + " w-28 font-data"} placeholder="name" />
                        <select value={f.type} onChange={(e) => setX(i, { type: e.target.value })} className={inputCls + " w-24"}>{fieldTypes.map((t) => <option key={t}>{t}</option>)}</select>
                        <Input value={f.def} onChange={(e) => setX(i, { def: e.target.value })} className={inputCls + " w-24"} placeholder="Default" />
                        <button onClick={() => setXfields((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-mocha">
                        <span className="flex items-center gap-1.5"><Toggle on={f.required} set={() => setX(i, { required: !f.required })} /> Required <Tip t="Leads missing this column are rejected at upload." /></span>
                        <span className="flex items-center gap-1.5"><Toggle on={f.scoring} set={() => setX(i, { scoring: !f.scoring })} /> Scoring input <Tip t="Only fields flagged here feed the pre-call score (Cold / Warm / Hot)." /></span>
                        <span className="flex items-center gap-1.5"><Toggle on={f.convo} set={() => setX(i, { convo: !f.convo })} /> Agent can see <code className="font-data">{`{${f.name}}`}</code> <Tip t="Exposes the value to the agent at call time. Off keeps it private even if populated." /></span>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addX} variant="outline" size="sm" className="gap-1.5 text-mocha"><Plus className="size-4" /> Add field</Button>
                </div>
              )}
            </div>
          )}

          {/* STEP: UPLOAD LEADS */}
          {cur.key === "leads" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload the list this campaign will dial. Required column: <code className="font-data text-mocha">phone</code> —
                extra columns are matched to your <span className="font-medium text-coffee">Lead Schema</span> fields by name.
                {xfields.length > 0 && <> Expecting: <span className="font-data text-mocha">{["phone", "full_name", "email", ...xfields.map((f) => f.name)].join(", ")}</span>.</>}
              </p>
              <LeadUpload onChange={setLeadInfo} note="Optional — you can also add leads any time from the campaign page or the Leads section." />
            </div>
          )}

          {/* STEP: CUSTOMER DATA */}
          {cur.key === "customer" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Details the agent collects <span className="font-medium text-coffee">during the call</span> (optional). Field names are auto-prefixed <code className="font-data text-mocha">ld_enrich_</code> so they can never clash with Lead Schema, and answers are stored <span className="font-medium text-coffee">per call</span> — re-calling a lead records a fresh set.</p>
              <div className="flex items-start gap-2 rounded-xl border border-warning/25 bg-warning/5 p-3 text-xs text-mocha"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> Needs the <span className="font-medium text-coffee">“Customer Data” agent skill</span> enabled (Settings → Skills) to actually collect.</div>
              {cdata.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-foam bg-card p-2.5">
                  <Input value={c.label} onChange={(e) => setCdata((d) => d.map((x, j) => (j === i ? { label: e.target.value } : x)))} className={inputCls + " flex-1"} placeholder="e.g. Monthly Income" />
                  <span className="font-data text-xs text-muted-foreground">ld_enrich_{c.label.toLowerCase().replace(/\s+/g, "_") || "field"}</span>
                  <select className={inputCls + " w-28"}>{fieldTypes.map((t) => <option key={t}>{t}</option>)}</select>
                  <button onClick={() => setCdata((d) => d.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <Button onClick={() => setCdata((d) => [...d, { label: "" }])} variant="outline" size="sm" className="gap-1.5 text-mocha"><Plus className="size-4" /> Add field</Button>
            </div>
          )}

          {/* STEP: SCORING */}
          {cur.key === "scoring" && (
            <div className="space-y-6">
              <Group title="Score buckets" sub="Where Cold becomes Warm becomes Hot.">
                <div className="flex gap-2 text-xs"><span className="rounded-full bg-secondary px-2.5 py-1 text-mocha">Cold 0–{warmT}</span><span className="rounded-full bg-warning/15 px-2.5 py-1 text-warning">Warm {warmT}–{hotT}</span><span className="rounded-full bg-danger/12 px-2.5 py-1 text-danger">Hot {hotT}–100</span></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="flex justify-between text-xs text-mocha"><span>Warm threshold</span><span className="font-data">{warmT}</span></div><input type="range" min={10} max={hotT - 5} value={warmT} onChange={(e) => setWarmT(+e.target.value)} className="w-full accent-caramel" /></div>
                  <div><div className="flex justify-between text-xs text-mocha"><span>Hot threshold</span><span className="font-data">{hotT}</span></div><input type="range" min={warmT + 5} max={95} value={hotT} onChange={(e) => setHotT(+e.target.value)} className="w-full accent-caramel" /></div>
                </div>
              </Group>
              <More label={`Pre-score weights (${scoringFields.length})`}>
                {scoringFields.length === 0 ? <p className="text-xs text-muted-foreground">Flag a field as “Scoring input” in Lead Schema to weight it here.</p>
                  : scoringFields.map((f) => <div key={f.name} className="flex items-center justify-between rounded-xl border border-foam bg-card px-3 py-2 text-sm"><span className="text-coffee">{f.label}</span><Input type="number" defaultValue={10} className={inputCls + " w-20 text-right"} /></div>)}
              </More>
              <More label={`In-call adjustments (${inCallSignals.length} built-in)`}>
                <p className="text-xs text-muted-foreground">Locked signals the agent applies live as the score moves Cold → Warm → Hot during the call.</p>
                <div className="space-y-1.5">{inCallSignals.map((s) => (
                  <div key={s.key} className="flex items-center justify-between rounded-lg border border-foam bg-card px-3 py-1.5 text-sm"><span className="flex items-center gap-1.5 text-coffee"><Lock className="size-3 text-muted-foreground" /> {s.label}</span><span className={cn("font-data", s.delta >= 0 ? "text-success" : "text-danger")}>{s.delta > 0 ? "+" : ""}{s.delta}</span></div>
                ))}</div>
                {customSignals.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-caramel/30 bg-card px-3 py-1.5">
                    <Input value={s.label} placeholder="e.g. asked_for_whatsapp" onChange={(e) => setCustomSignals((c) => c.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={inputCls + " flex-1 font-data text-xs"} />
                    <Input type="number" value={s.delta} onChange={(e) => setCustomSignals((c) => c.map((x, j) => (j === i ? { ...x, delta: +e.target.value } : x)))} className={inputCls + " w-20 text-right"} />
                    <button onClick={() => setCustomSignals((c) => c.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger" aria-label="Remove adjustment"><Trash2 className="size-4" /></button>
                  </div>
                ))}
                <button onClick={() => setCustomSignals((c) => [...c, { label: "", delta: 5 }])} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-latte px-3 py-1.5 text-sm text-mocha transition-colors hover:border-caramel"><Plus className="size-4" /> Add custom adjustment</button>
              </More>
            </div>
          )}

          {/* STEP: CONVERSATION */}
          {cur.key === "flow" && (
            <div className="space-y-5">
              <Button variant="outline" size="sm" className="gap-1.5 text-mocha" onClick={() => toast({ title: "Import flow", body: "Pick a template from the library.", severity: "info" })}><BookOpen className="size-4" /> Import from library</Button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Lbl>Greeting</Lbl><Input defaultValue="Hi {full_name}, this is {agent_name}…" className={inputCls} /></div>
                <div className="space-y-1.5"><Lbl>End-call message</Lbl><Input defaultValue="Thanks for your time!" className={inputCls} /></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><Lbl tip="Every LLM turn re-processes this prompt — keep it tight. Variables below are filled per lead at call time.">System prompt</Lbl><span className="text-xs text-muted-foreground">{prompt.length} chars</span></div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className={inputCls + " h-28 font-data text-xs"} />
              </div>

              {/* variables reference panel */}
              <div className="rounded-xl border border-foam bg-oat/30 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-coffee"><Braces className="size-3.5 text-caramel" /> Variables you can use<HelpHint text="Drop any of these into the greeting, end-call message or system prompt — each is replaced with the lead's value at call time." side="top" /></div>
                <div className="mt-2.5 space-y-2">
                  {[
                    { g: "Campaign", vars: ["{company}", "{agent_name}", "{agent_gender}", "{language}"] },
                    { g: "Lead", vars: ["{full_name}", "{phone}", "{email}"] },
                    { g: "Lead schema", vars: xfields.filter((f) => f.convo).map((f) => `{${f.name}}`) },
                    { g: "Customer data", vars: cdata.filter((c) => c.label).map((c) => `{ld_enrich_${c.label.toLowerCase().replace(/\s+/g, "_")}}`) },
                  ].map((row) => (
                    <div key={row.g} className="flex flex-wrap items-baseline gap-1.5">
                      <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{row.g}</span>
                      {row.vars.length
                        ? row.vars.map((v) => <code key={v} className="rounded border border-foam bg-card px-1.5 py-0.5 font-data text-[11px] text-mocha">{v}</code>)
                        : <span className="text-[11px] italic text-muted-foreground/70">none yet — add fields in earlier steps</span>}
                    </div>
                  ))}
                </div>
              </div>
              <More label="Objection handlers">
                {objs.map((o, i) => (
                  <div key={i} className="flex items-center gap-2"><Input value={o.o} onChange={(e) => setObjs((x) => x.map((y, j) => (j === i ? { ...y, o: e.target.value } : y)))} placeholder="Objection" className={inputCls + " flex-1"} /><ChevronRight className="size-4 shrink-0 text-muted-foreground" /><Input value={o.r} onChange={(e) => setObjs((x) => x.map((y, j) => (j === i ? { ...y, r: e.target.value } : y)))} placeholder="Response" className={inputCls + " flex-1"} /><button onClick={() => setObjs((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button></div>
                ))}
                <Button onClick={() => setObjs((o) => [...o, { o: "", r: "" }])} variant="outline" size="sm" className="gap-1.5 text-mocha"><Plus className="size-4" /> Add handler</Button>
              </More>
              <More label="Voice, LLM & timing">
                <div className="grid grid-cols-3 gap-4 text-xs text-mocha">
                  {[["Stability", "0.6"], ["Speed", "1.05×"], ["Temperature", "0.3"], ["Max tokens", "150"], ["Silence timeout", "30s"], ["Max duration", "600s"]].map(([k, v]) => (
                    <div key={k}><div className="flex justify-between"><span>{k}</span><span className="font-data text-coffee">{v}</span></div><input type="range" className="mt-1 w-full accent-caramel" defaultValue={50} /></div>
                  ))}
                  <div className="space-y-1.5"><span>Background sound</span><select className={inputCls}>{backgroundSounds.map((b) => <option key={b}>{b}</option>)}</select></div>
                </div>
              </More>
            </div>
          )}

          {/* STEP: VOICE & AI */}
          {cur.key === "voiceai" && (
            <div className="space-y-6">
              <Group title="Transcriber" help="Speech-to-text that hears the customer. Pick the language that matches how your customers actually speak.">
                <div className="space-y-1.5">
                  <Lbl req>Transcriber Language</Lbl>
                  <select value={transcriber} onChange={(e) => setTranscriber(e.target.value)} className={inputCls + " max-w-sm"}>{langs.map((l) => <option key={l}>{l}</option>)}</select>
                  <p className="text-xs text-muted-foreground">Campaign language is <span className="font-medium text-coffee">{lang}</span> — pick a transcriber language that matches.</p>
                </div>
              </Group>
              <Group title="LLM — the agent's brain" help="Generates every agent response. Org default is tuned for Indian calling latency; override per campaign only if you have a reason.">
                <select value={llm} onChange={(e) => setLlm(e.target.value)} className={inputCls + " max-w-md"}>{LLM_OPTS.map((o) => <option key={o}>{o}</option>)}</select>
              </Group>
              <Group title="Text-to-Speech — the speaking voice" help="The voice your customers hear. Preview before committing.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Lbl>TTS Provider</Lbl><select value={tts} onChange={(e) => setTts(e.target.value)} className={inputCls}>{TTS_OPTS.map((o) => <option key={o}>{o}</option>)}</select></div>
                  <div className="space-y-1.5"><Lbl>Voice</Lbl>
                    <div className="flex items-center gap-2">
                      <select value={voice} onChange={(e) => setVoice(e.target.value)} className={inputCls + " flex-1"}>{VOICE_OPTS.map((o) => <option key={o}>{o}</option>)}</select>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: "Voice preview", body: `Playing a sample of ${voice} at ${speed.toFixed(1)}× speed.`, severity: "info" })} className="gap-1 border-foam text-mocha hover:text-coffee"><Play className="size-3.5" /> Preview</Button>
                    </div>
                  </div>
                </div>
              </Group>
              <Group title="Call behaviour" help="Presets bundle voice, LLM, timing and toggles. Pick one, or fine-tune yourself below.">
                <select value={preset} onChange={(e) => setPreset(e.target.value)} className={inputCls + " max-w-md"}>{PRESETS.map((o) => <option key={o}>{o}</option>)}</select>
                <More label="Fine-tune voice, LLM & conversation settings">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between text-xs text-mocha"><span>Speech speed</span><span className="font-data">{speed.toFixed(1)}×</span></div>
                      <input type="range" min={0.8} max={1.5} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-caramel" />
                      <p className="text-[11px] text-muted-foreground">Best: 1.2–1.3× for natural Indian-market conversation.</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-mocha"><span>Creativity (temperature)</span><span className="font-data">{temp.toFixed(1)}</span></div>
                      <input type="range" min={0} max={1} step={0.1} value={temp} onChange={(e) => setTemp(+e.target.value)} className="w-full accent-caramel" />
                      <p className="text-[11px] text-muted-foreground">Lower = predictable script, higher = adaptive phrasing.</p>
                    </div>
                  </div>
                </More>
              </Group>
            </div>
          )}

          {/* STEP: PHONE & OUTCOMES */}
          {cur.key === "phone" && (
            <div className="space-y-6">
              <Group title="Outbound number"><select className={inputCls + " max-w-sm"}>{phoneNumbers.map((n) => <option key={n.id}>{n.label}</option>)}</select></Group>
              <div className="flex items-center justify-between rounded-xl border border-foam bg-card p-4">
                <div><div className="text-sm font-medium text-coffee">Enable Call Transfer</div><div className="text-xs text-muted-foreground">{transferOn ? "Agent hands off to a human." : "Agent ends calls itself."}</div></div>
                <Toggle on={transferOn} set={() => setTransferOn((v) => !v)} />
              </div>
              {transferOn && <div className="space-y-1.5"><Lbl req>Transfer number</Lbl><Input placeholder="+91 …" className={inputCls + " max-w-sm"} /></div>}
              <Group title="Call dispositions" sub="Built-ins are locked; add your own below." help="Outcomes the agent records at the end of every call. The built-ins are fixed; add campaign-specific outcomes and pick which result they count as — that drives the colour, the counts and any follow-up.">
                <div className="flex flex-wrap gap-2">
                  {dispositions.map((d) => <span key={d.key} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-card px-3 py-1.5 text-sm text-coffee"><Lock className="size-3 text-muted-foreground" /> {d.label}</span>)}
                </div>
                {outcomes.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-mocha">Your custom outcomes</div>
                    {outcomes.map((o, i) => (
                      <div key={o.code} className="flex items-center gap-3 rounded-xl border border-foam bg-card px-3 py-2">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", countsTone[o.countsAs])}>{o.countsAs}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-coffee">{o.name} {o.endCall && <span className="ml-1 rounded-full bg-oat px-1.5 py-0.5 text-[10px] text-mocha">ends call</span>}</div>
                          <div className="font-data text-[11px] text-muted-foreground">{o.code}{o.desc ? ` · ${o.desc}` : ""}</div>
                        </div>
                        <button onClick={() => setOutcomes((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger" aria-label={`Remove ${o.name}`}><Trash2 className="size-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setOutcomeOpen(true)} className="rounded-full border border-dashed border-latte px-3 py-1.5 text-sm text-mocha hover:border-caramel">+ Add outcome</button>
              </Group>

              {/* add-outcome modal */}
              {outcomeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-espresso/30 backdrop-blur-[2px]" onClick={() => setOutcomeOpen(false)} />
                  <div className="relative w-full max-w-md rounded-2xl border border-foam bg-porcelain p-5 shadow-card-lg">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-serif text-lg font-semibold text-coffee">Add outcome</h3>
                      <button onClick={() => setOutcomeOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-coffee"><X className="size-4" /></button>
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">An outcome specific to this campaign that the agent can record.</p>
                    <div className="space-y-3.5">
                      <div className="space-y-1.5"><Lbl req>Name</Lbl><Input value={oName} onChange={(e) => setOName(e.target.value)} placeholder="e.g. Qualified" className={inputCls} autoFocus /></div>
                      <div className="space-y-1.5"><Lbl tip="Created automatically from the name — used in exports and the API.">Code</Lbl>
                        <div className={inputCls + " flex items-center gap-1.5 bg-oat/50 font-data text-xs text-mocha"}><Lock className="size-3" /> {oName.trim() ? slugify(oName) : "created from the name"}</div>
                      </div>
                      <div className="space-y-1.5"><Lbl req tip="Which result this outcome rolls up to — drives the colour, the counts and any follow-up.">Counts as</Lbl>
                        <select value={oCounts} onChange={(e) => setOCounts(e.target.value)} className={inputCls}>{COUNTS_AS.map((r) => <option key={r}>{r}</option>)}</select>
                      </div>
                      <div className="space-y-1.5"><Lbl>Description (optional)</Lbl><Input value={oDesc} onChange={(e) => setODesc(e.target.value)} placeholder="What this outcome means." className={inputCls} /></div>
                      <div className="flex items-center justify-between rounded-xl border border-foam bg-card px-3 py-2.5">
                        <span className="text-sm text-coffee">End the call when the agent records this</span>
                        <Toggle on={oEnd} set={() => setOEnd((v) => !v)} />
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOutcomeOpen(false)} className="border-foam text-mocha">Cancel</Button>
                      <Button onClick={addOutcome} disabled={!oName.trim()} className="bg-brand text-brand-foreground hover:bg-brand-dark">Add</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: AGENT SKILLS */}
          {cur.key === "skills" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Real-time tools the agent can invoke <span className="font-medium text-coffee">mid-call</span>. Core skills are always on; toggle the optional ones for this campaign.</p>
              <div className="flex items-start gap-2 rounded-xl border border-info/25 bg-info/5 p-3 text-xs text-mocha"><Info className="mt-0.5 size-4 shrink-0 text-info" /> Keep <code className="font-data text-coffee">customer_data</code> on or the Customer Data fields you defined in step 3 won&apos;t be collected. Org-wide skills live in <span className="font-medium text-coffee">Settings → Agent Skills</span>.</div>
              <div className="space-y-2">
                {skills.map((s, i) => {
                  const gates = s.id === "customer_data";
                  return (
                    <div key={s.id} className={cn("flex items-center gap-3 rounded-xl border bg-card p-3", gates ? "border-info/40" : "border-foam")}>
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", s.on ? "bg-secondary text-brand" : "bg-oat text-latte")}><Wrench className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="font-data text-sm font-medium text-coffee">{s.name}</code>
                          {s.core && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mocha">core</span>}
                          {gates && <span className="rounded-full bg-info/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info">gates step 3</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.desc}</div>
                      </div>
                      {s.core
                        ? <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground"><Lock className="size-3" /> Always on</span>
                        : <Toggle on={s.on} set={() => setSkills((arr) => arr.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))} />}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => toast({ title: "Add custom skill", body: "Connect a tool/API the agent can call. Configure in Settings → Agent Skills.", severity: "info" })} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-latte px-3 py-2 text-sm text-mocha transition-colors hover:border-caramel"><Plus className="size-4" /> Add custom skill</button>
            </div>
          )}

          {/* STEP: EMAIL & SMS TEMPLATES */}
          {cur.key === "messaging" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Pre-approved messages the agent can send <span className="font-medium text-coffee">during the call</span> ("I&apos;m sending you the link now").
                <code className="font-data text-mocha"> {"{placeholders}"}</code> fill from the lead row at send time. Attach the ones this campaign may use.
              </p>

              <Group title="Email templates" help="Requires an email provider (Settings → Email Configuration). The agent can only send templates attached here — never free-form email.">
                <div className="space-y-2">
                  {emailTpls.map((t, i) => (
                    <div key={t.name} className="flex items-center gap-3 rounded-xl border border-foam bg-card px-3.5 py-2.5">
                      <Mail className="size-4 shrink-0 text-caramel" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-coffee">{t.name}</div>
                        <div className="truncate font-data text-[11px] text-muted-foreground">{t.subject}</div>
                      </div>
                      <Toggle on={t.on} set={() => setEmailTpls((x) => x.map((y, j) => (j === i ? { ...y, on: !y.on } : y)))} />
                    </div>
                  ))}
                  {newEmail ? (
                    <div className="space-y-2 rounded-xl border border-caramel/40 bg-card p-3">
                      <Input value={newEmail.name} onChange={(e) => setNewEmail({ ...newEmail, name: e.target.value })} placeholder="Template name — e.g. Sanction letter" className={inputCls} autoFocus />
                      <Input value={newEmail.subject} onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })} placeholder="Subject — supports {full_name}, {company}…" className={inputCls} />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={!newEmail.name.trim()} onClick={() => { setEmailTpls((x) => [...x, { name: newEmail.name.trim(), subject: newEmail.subject.trim() || "—", on: true }]); setNewEmail(null); toast({ title: "Email template added", body: "Attached to this campaign.", severity: "success" }); }} className="bg-brand text-brand-foreground hover:bg-brand-dark">Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => setNewEmail(null)} className="text-mocha">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setNewEmail({ name: "", subject: "" })} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-latte px-3 py-2 text-sm text-mocha transition-colors hover:border-caramel"><Plus className="size-4" /> New email template</button>
                  )}
                </div>
              </Group>

              <Group title="SMS templates" help="India: promotional SMS routes through your DLT-registered 140-series header; service messages use the 160-series. Only DLT-approved templates get sent.">
                <div className="space-y-2">
                  {smsTpls.map((t, i) => (
                    <div key={t.name} className="flex items-center gap-3 rounded-xl border border-foam bg-card px-3.5 py-2.5">
                      <MessageSquare className="size-4 shrink-0 text-steam" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-coffee">{t.name}
                          {t.dlt ? <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">DLT ✓</span>
                            : <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">DLT pending</span>}
                        </div>
                        <div className="truncate font-data text-[11px] text-muted-foreground">{t.body}</div>
                      </div>
                      <Toggle on={t.on} set={() => setSmsTpls((x) => x.map((y, j) => (j === i ? { ...y, on: !y.on } : y)))} />
                    </div>
                  ))}
                  {newSms ? (
                    <div className="space-y-2 rounded-xl border border-caramel/40 bg-card p-3">
                      <Input value={newSms.name} onChange={(e) => setNewSms({ ...newSms, name: e.target.value })} placeholder="Template name" className={inputCls} autoFocus />
                      <textarea value={newSms.body} onChange={(e) => setNewSms({ ...newSms, body: e.target.value })} placeholder="Message — supports {full_name}, {link}… Submitted for DLT approval on save." className={inputCls + " h-16 resize-none"} />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={!newSms.name.trim()} onClick={() => { setSmsTpls((x) => [...x, { name: newSms.name.trim(), body: newSms.body.trim() || "—", dlt: false, on: true }]); setNewSms(null); toast({ title: "SMS template added", body: "Queued for DLT approval — it sends once approved.", severity: "info" }); }} className="bg-brand text-brand-foreground hover:bg-brand-dark">Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => setNewSms(null)} className="text-mocha">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setNewSms({ name: "", body: "" })} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-latte px-3 py-2 text-sm text-mocha transition-colors hover:border-caramel"><Plus className="size-4" /> New SMS template</button>
                  )}
                </div>
              </Group>
            </div>
          )}

          {/* STEP: SCHEDULE (v6) */}
          {cur.key === "schedule" && (
            <div className="space-y-6">
              <Group title="Start" help="When the campaign begins dialing.">
                <div className="grid grid-cols-2 gap-2">
                  {(["now", "later"] as const).map((m) => (
                    <button key={m} onClick={() => setStartMode(m)} className={cn("rounded-xl border px-3 py-2.5 text-left text-sm transition-colors", startMode === m ? "border-caramel bg-caramel/10 text-coffee" : "border-foam text-mocha hover:bg-oat/50")}>
                      <span className="font-medium">{m === "now" ? "Start now" : "Schedule for later"}</span>
                      <span className="block text-[11px] text-muted-foreground">{m === "now" ? "Begin as soon as you launch" : "Pick a date & time"}</span>
                    </button>
                  ))}
                </div>
                {startMode === "later" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Lbl>Start date</Lbl><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></div>
                    <div className="space-y-1.5"><Lbl>Start time</Lbl><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} /></div>
                  </div>
                )}
              </Group>
              <Group title="Calling window" help="Calls only dial inside this window — respecting calling-hour compliance.">
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d, i) => <button key={d} onClick={() => toggleDay(i)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", days.includes(i) ? "bg-brand text-brand-foreground" : "bg-foam text-mocha hover:bg-oat")}>{d}</button>)}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Lbl>From</Lbl><Input type="time" value={callStart} onChange={(e) => setCallStart(e.target.value)} className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>To</Lbl><Input type="time" value={callEnd} onChange={(e) => setCallEnd(e.target.value)} className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Timezone</Lbl><select value={tz} onChange={(e) => setTz(e.target.value)} className={inputCls}>{TIMEZONES.map((t) => <option key={t}>{t}</option>)}</select></div>
                </div>
              </Group>
              <div className="flex items-center gap-2 rounded-xl border border-info/25 bg-info/5 p-3 text-xs text-mocha"><Calendar className="size-4 shrink-0 text-info" /> Will call <span className="font-medium text-coffee">{schedLine}</span>.</div>
            </div>
          )}

          {/* STEP: SMART PAUSES (v6) */}
          {cur.key === "pauses" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-foam bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="flex items-center gap-1.5 text-sm font-semibold text-coffee"><Coffee className="size-4 text-caramel" /> Quiet hours</div><p className="mt-0.5 text-xs text-muted-foreground">Auto-pause during sensitive times (e.g. lunch) so you don&apos;t disturb customers. The campaign <span className="font-medium text-coffee">resumes automatically</span> after each window.</p></div>
                  <Toggle on={quietOn} set={() => setQuietOn((v) => !v)} />
                </div>
                {quietOn && (
                  <div className="mt-3 space-y-2">
                    {quiet.map((w, i) => (
                      <div key={w.id} className="flex items-center gap-2 rounded-xl border border-foam bg-oat/40 p-2.5">
                        <Input value={w.label} onChange={(e) => setQuiet((q) => q.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} className={inputCls + " flex-1"} placeholder="Label" />
                        <Input type="time" value={w.start} onChange={(e) => setQuiet((q) => q.map((x, j) => j === i ? { ...x, start: e.target.value } : x))} className={inputCls + " w-28"} />
                        <span className="text-muted-foreground">→</span>
                        <Input type="time" value={w.end} onChange={(e) => setQuiet((q) => q.map((x, j) => j === i ? { ...x, end: e.target.value } : x))} className={inputCls + " w-28"} />
                        <button onClick={() => setQuiet((q) => q.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
                      </div>
                    ))}
                    <Button onClick={() => setQuiet((q) => [...q, { id: `w${q.length + 1}`, label: "Quiet window", start: "18:00", end: "19:00" }])} variant="outline" size="sm" className="gap-1.5 text-mocha"><Plus className="size-4" /> Add window</Button>
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-foam bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="flex items-center gap-1.5 text-sm font-semibold text-coffee"><ShieldAlert className="size-4 text-caramel" /> Auto-pause on reported issues</div><p className="mt-0.5 text-xs text-muted-foreground">If many customers report the same blocker, VoiceBrew AI can step in before it hurts your numbers — it shows up as a high-priority notification.</p></div>
                  <Toggle on={issueOn} set={() => setIssueOn((v) => !v)} />
                </div>
                {issueOn && (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-coffee">Pause when <span className="inline-flex items-center rounded-lg border border-foam"><button onClick={() => setThreshold((n) => Math.max(3, n - 1))} className="px-2 py-1 text-mocha hover:bg-oat">–</button><span className="w-8 text-center font-medium tabular-nums">{threshold}</span><button onClick={() => setThreshold((n) => n + 1)} className="px-2 py-1 text-mocha hover:bg-oat">+</button></span> customers report the same blocker within an hour.</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Lbl>Severity to watch</Lbl><select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputCls}>{["High only", "High & medium", "All"].map((s) => <option key={s}>{s}</option>)}</select></div>
                      <div className="space-y-1.5"><Lbl>When it triggers</Lbl><select value={mode} onChange={(e) => setMode(e.target.value as "notify" | "auto")} className={inputCls}><option value="notify">Notify me first (recommended)</option><option value="auto">Pause automatically</option></select></div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-oat/50 p-2.5 text-xs text-mocha"><Bell className="size-3.5 text-caramel" /> {mode === "notify" ? "You'll get a high-priority notification with a one-tap report and a Pause/Ignore choice." : "We'll pause and send you the analysis report — resume anytime."}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* footer nav */}
          <div className="mt-7 flex items-center justify-between border-t border-foam pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => { setTried(false); setStep((s) => s - 1); }} className="gap-1.5 text-mocha"><ChevronLeft className="size-4" /> Back</Button>
            <div data-tour="adv-next" className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={draft} className="gap-1.5 text-mocha"><Save className="size-4" /> Save Draft</Button>
              {step < STEPS.length - 1
                ? <Button onClick={goNext} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark">Next <ChevronRight className="size-4" /></Button>
                : <Button onClick={create} className="gap-1.5 bg-coffee text-cream hover:bg-espresso">{edit ? "Save Changes" : "Create Campaign"} <Check className="size-4" /></Button>}
            </div>
          </div>
        </div>

        {/* LIVE SUMMARY */}
        <aside data-tour="adv-summary" className="h-fit rounded-2xl border border-foam bg-porcelain p-5 shadow-glass lg:sticky lg:top-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mocha"><Sparkles className="size-3.5 text-caramel" /> Live summary</div>
          <div className="mt-2 font-serif text-lg font-semibold text-coffee">{name || <span className="text-muted-foreground">Untitled campaign</span>}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{agent ? `Agent ${agent}` : "No agent yet"} · {lang}</div>

          <div className="mt-4 space-y-2 border-t border-foam pt-3">
            {summary.map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">{r.done ? <Check className="size-3.5 text-success" /> : <span className="size-3.5 rounded-full border border-latte" />}{r.k}</span>
                <span className="truncate text-right font-medium text-coffee">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div><span className="font-data text-[11px] text-muted-foreground">{step + 1}/{STEPS.length}</span></div>

          <Button onClick={create} className="mt-4 w-full gap-1.5 bg-coffee text-cream hover:bg-espresso"><Check className="size-4" /> {edit ? "Save Changes" : "Create Campaign"}</Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">{edit ? "Changes apply immediately on save." : "Saved as draft — activate when ready."}</p>
        </aside>
      </div>

      <Tour steps={advTour} onFinish={() => setStep(preTourStep.current)} />
    </div>
  );
}
