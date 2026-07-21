"use client";

import { useState } from "react";
import { Mic, Square, Gauge, Sparkles, Activity, Terminal, KeyRound, Phone, Check } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const inputCls = "w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel focus:ring-1 focus:ring-caramel/30";
const TABS = ["Playground", "Credentials"];
const transcript = [
  { who: "agent", text: "नमस्ते! मैं Riya बोल रही हूँ। क्या अभी बात कर सकते हैं?" },
  { who: "user", text: "Haan boliye." },
  { who: "agent", text: "Great — mobile banking activate करने में बस एक मिनट लगेगा।" },
];
const latency = [
  { stage: "MIC", ms: 40, color: "var(--color-latte)" },
  { stage: "STT", ms: 180, color: "var(--color-mocha)" },
  { stage: "LLM", ms: 220, color: "var(--color-caramel)" },
  { stage: "TTS", ms: 160, color: "var(--color-success)" },
];
const trace = [
  "STT · partial “haan”", "STT · final “Haan boliye”", "LLM · stream 18 tok", "TTS · synth 160ms", "AUDIO · played 1.2s",
];
const creds = [
  { name: "Deepgram", kind: "STT", key: "dg_••••••3a91", on: true },
  { name: "Google Gemini", kind: "LLM", key: "gm_••••••7c20", on: true },
  { name: "Cartesia", kind: "TTS", key: "ct_••••••1f55", on: true },
  { name: "Sarvam", kind: "STT/TTS", key: "", on: false },
];

function Slider({ label, value, set, icon: Icon, suffix }: { label: string; value: number; set: (n: number) => void; icon: typeof Gauge; suffix: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 font-medium text-coffee"><Icon className="size-3.5 text-caramel" />{label}</span><span className="font-data text-mocha">{suffix}</span></div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => set(+e.target.value)} className="w-full accent-caramel" />
    </div>
  );
}
const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-foam bg-card p-3"><div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-mocha">{title}</div>{children}</div>
);

export default function VoicePlaygroundPage() {
  const [tab, setTab] = useState("Playground");
  const [live, setLive] = useState(false);
  const [speed, setSpeed] = useState(80);
  const [temp, setTemp] = useState(70);
  const [tokens, setTokens] = useState(60);
  const total = latency.reduce((a, b) => a + b.ms, 0);
  const maxMs = Math.max(...latency.map((l) => l.ms));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Voice Playground" subtitle="Live pipeline tester — tune STT · LLM · TTS and hear it in real time"
        actions={<Button size="sm" onClick={() => toast({ title: "Saved to campaign", body: "Pipeline config saved.", severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Check className="size-4" /> Save to campaign</Button>} />

      <div className="mb-4 flex gap-1 border-b border-foam">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>)}
      </div>

      {tab === "Credentials" ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Connect your providers — the playground uses these keys to run the live pipeline.</p>
          {creds.map((c) => (
            <div key={c.name} className="flex items-center gap-3 rounded-xl border border-foam bg-porcelain p-4 shadow-glass">
              <KeyRound className="size-4 text-mocha" />
              <div className="w-40"><div className="text-sm font-medium text-coffee">{c.name}</div><div className="text-[11px] text-muted-foreground">{c.kind}</div></div>
              <Input defaultValue={c.key} placeholder="Paste API key…" className={inputCls + " flex-1 font-data text-xs"} />
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", c.on ? "bg-success/12 text-success" : "bg-foam text-muted-foreground")}>{c.on ? "Connected" : "Not set"}</span>
              <Button size="sm" variant="outline" onClick={() => toast({ title: c.name, body: "Credential saved.", severity: "success" })} className="text-mocha">Save</Button>
            </div>
          ))}
        </div>
      ) : (
        <>
          {!creds.every((c) => c.kind === "STT/TTS" || c.on) && null}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr_0.9fr]">
            {/* PIPELINE CONFIG */}
            <div className="space-y-3 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
              <h3 className="font-serif text-base font-semibold text-coffee">Pipeline config</h3>
              <Block title="STT"><div className="grid grid-cols-2 gap-2"><select className={inputCls}><option>Deepgram</option><option>Sarvam</option></select><select className={inputCls}><option>Nova 3</option><option>Nova 2</option></select></div></Block>
              <Block title="LLM"><div className="grid grid-cols-2 gap-2"><select className={inputCls}><option>Google Gemini</option><option>OpenAI</option><option>Anthropic</option></select><select className={inputCls}><option>Gemini 2.5 Flash</option><option>GPT-4o-mini</option></select></div></Block>
              <Block title="TTS"><select className={inputCls}><option>Cartesia · Sonic-3</option><option>ElevenLabs</option><option>Sarvam Bulbul</option></select><select className={inputCls + " mt-2"}><option>Riya — College Roommate (Hindi female, playful)</option><option>Aria — warm female</option><option>Kabir — calm male</option></select></Block>
              <Block title="Language"><select className={inputCls}><option>Hindi</option><option>Hinglish</option><option>English</option><option>Tamil</option></select></Block>
              <Block title="Tuning">
                <div className="space-y-3">
                  <Slider label="Speech speed" value={speed} set={setSpeed} icon={Gauge} suffix={`${(0.5 + speed / 100).toFixed(2)}×`} />
                  <Slider label="Creativity" value={temp} set={setTemp} icon={Sparkles} suffix={(temp / 100 * 1.4).toFixed(2)} />
                  <Slider label="Response length" value={tokens} set={setTokens} icon={Gauge} suffix={`${100 + tokens * 2} tok`} />
                </div>
              </Block>
            </div>

            {/* LIVE CALL */}
            <div className="flex flex-col rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
              <div className="flex items-center justify-between"><h3 className="font-serif text-base font-semibold text-coffee">Live call</h3><span className="rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success">~{total}ms turn</span></div>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => { setLive((v) => !v); toast({ title: live ? "Stopped" : "Listening…", body: live ? "" : "Speak into your mic.", severity: "info" }); }} className={cn("flex-1 gap-1.5", live ? "bg-danger text-white hover:bg-danger/90" : "bg-brand text-brand-foreground hover:bg-brand-dark")}>{live ? <><Square className="size-4" /> Stop</> : <><Mic className="size-4" /> Start mic</>}</Button>
                <Button variant="outline" onClick={() => toast({ title: "Calling your number", body: "Connecting…", severity: "info" })} className="flex-1 gap-1.5 text-mocha"><Phone className="size-4" /> Call my number</Button>
              </div>
              <div className="mt-4 flex-1 space-y-2 rounded-xl border border-foam bg-oat/30 p-3">
                {transcript.map((m, i) => <div key={i} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", m.who === "agent" ? "bg-card text-coffee" : "ml-auto bg-caramel/15 text-coffee")}>{m.text}</div>)}
                {live && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mic className="size-3 animate-pulse text-caramel" /> listening…</div>}
              </div>
            </div>

            {/* LATENCY + TRACE */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
                <div className="mb-3 flex items-center gap-2"><Activity className="size-4 text-caramel" /><h3 className="font-serif text-base font-semibold text-coffee">Latency</h3><span className="ml-auto font-data text-sm text-coffee">{total}ms</span></div>
                <div className="space-y-2">{latency.map((l) => (
                  <div key={l.stage} className="flex items-center gap-2 text-xs"><span className="w-9 font-data text-muted-foreground">{l.stage}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full" style={{ width: `${(l.ms / maxMs) * 100}%`, background: l.color }} /></div><span className="w-12 text-right font-data text-coffee">{l.ms}ms</span></div>
                ))}</div>
              </div>
              <div className="rounded-2xl border border-foam bg-espresso p-4 shadow-glass">
                <div className="mb-2 flex items-center gap-2 text-cream/80"><Terminal className="size-4" /><span className="text-xs font-semibold uppercase tracking-wider">Live trace</span></div>
                <div className="space-y-1 font-data text-[11px] text-cream/70">{trace.map((t, i) => <div key={i}><span className="text-caramel">›</span> {t}</div>)}{live && <div className="text-success">› ● capturing…</div>}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
