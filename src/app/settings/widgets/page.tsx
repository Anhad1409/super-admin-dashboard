"use client";
import { MousePointerClick, Copy } from "lucide-react";
import { ChannelPage } from "@/components/settings/channel-page";
import { toast } from "@/components/notifications/toaster";

export default function WidgetsPage() {
  const snippet = `<script src="https://vox.blostem.info/widget.js" data-org="demo-org" data-campaign="callback" async></script>`;
  return (
    <ChannelPage icon={MousePointerClick} tint="var(--color-steam)" title="Click-to-Call Widgets"
      blurb="An embeddable callback button for your website — visitors leave a number, your AI agent calls them back within seconds."
      connectLabel="Generate widget"
      fields={[
        { label: "Allowed domain", placeholder: "www.yourcompany.in", mono: true },
        { label: "Callback campaign", placeholder: "Missed-call callbacks", hint: "Which campaign's agent handles widget callbacks." },
        { label: "Button label", placeholder: "Get a call in 30 seconds" },
        { label: "Accent colour", placeholder: "#b8763d", mono: true, hint: "Hex — defaults to your brand caramel (optional)." },
      ]}
      extras={
        <section className="mt-5 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-semibold text-coffee">Embed snippet</h2>
              <p className="text-xs text-muted-foreground">Paste before the closing &lt;/body&gt; tag.</p>
            </div>
            <button onClick={() => { navigator.clipboard?.writeText(snippet); toast({ title: "Copied", body: "Snippet on the clipboard.", severity: "info" }); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-foam px-3 py-1.5 text-xs font-medium text-mocha hover:border-caramel"><Copy className="size-3.5" /> Copy</button>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-espresso px-4 py-3 font-data text-[11px] leading-relaxed text-cream">{snippet}</pre>
        </section>
      } />
  );
}
