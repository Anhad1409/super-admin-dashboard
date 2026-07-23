"use client";

/* /admin/compliance — DLT registration, DND scrubbing and TRAI-window
   posture across every client, with the gaps that need chasing. */

import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, Clock3, FileCheck2, ChevronRight } from "lucide-react";
import { CpHeader, StatTile, Card, Tag, mono, compactINR } from "@/components/admin/cp";
import { clients, PLAN_META, type Client } from "@/lib/clients-mock";
import { compliance } from "@/lib/admin-mock";
import { companyDetail } from "@/lib/metric-details";

const DLT_TONE = { registered: "var(--color-success)", in_progress: "var(--color-warning)", missing: "var(--color-danger)", not_required: "var(--color-latte)" } as const;
const DLT_LABEL = { registered: "Registered", in_progress: "In progress", missing: "Missing", not_required: "Not required" } as const;

const planMrr = (c: Client) => `${PLAN_META[c.plan].label} · ${compactINR(c.mrr)} MRR`;

const dltRegisteredDetail = companyDetail({
  title: "DLT registered",
  value: String(compliance.dlt.registered),
  description: "Clients with an approved DLT entity registration — cleared to send promotional traffic inside the TRAI calling window.",
  pool: clients.filter((c) => c.dltStatus === "registered"),
  of: (c) => c.callsMonth,
  fmt: (n) => `${n.toLocaleString("en-IN")} calls`,
  sub: planMrr,
  includeZero: true,
  note: "Bars scale by calls placed this month.",
});

const dltInProgressDetail = companyDetail({
  title: "DLT in progress",
  value: String(compliance.dlt.inProgress),
  description: "Registration filed but not yet approved by the operator — chase these before their next promo campaign goes out.",
  pool: clients.filter((c) => c.dltStatus === "in_progress"),
  of: (c) => c.callsMonth,
  fmt: (n) => `${n.toLocaleString("en-IN")} calls`,
  sub: planMrr,
  flag: (c) => !c.dndScrub,
  includeZero: true,
  note: "Flagged rows also have DND scrubbing off — a double compliance gap.",
});

const dltMissingDetail = companyDetail({
  title: "DLT missing",
  value: String(compliance.dlt.missing),
  description: "No DLT registration on file — promotional calls are blocked for these clients until they register.",
  pool: clients.filter((c) => c.dltStatus === "missing"),
  of: (c) => c.callsMonth,
  fmt: (n) => `${n.toLocaleString("en-IN")} calls`,
  sub: planMrr,
  flag: (c) => c.callsMonth > 0,
  includeZero: true,
  note: "Flagged rows are still placing calls this month despite the missing registration.",
});

const dndOffDetail = companyDetail({
  title: "DND scrubbing off",
  value: String(compliance.dndOff.length),
  description: "Live clients dialing without DND-registry scrubbing — block their promo batches until scrubbing is enforced.",
  pool: compliance.dndOff,
  of: (c) => c.callsMonth,
  fmt: (n) => `${n.toLocaleString("en-IN")} calls`,
  sub: planMrr,
  flag: () => true,
  includeZero: true,
  note: "Every row here is a violation risk under TRAI's UCC rules.",
});

export default function CompliancePage() {
  const router = useRouter();
  const live = clients.filter((c) => c.status !== "churned");

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Compliance" subtitle="DLT registration, DND scrubbing and TRAI calling-window posture across the platform." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={FileCheck2} label="DLT registered" value={compliance.dlt.registered} sub={`of ${live.length} live clients`} tint="var(--color-success)" detail={dltRegisteredDetail} />
        <StatTile icon={Clock3} label="DLT in progress" value={compliance.dlt.inProgress} sub="registration pending" tint="var(--color-warning)" detail={dltInProgressDetail} />
        <StatTile icon={ShieldAlert} label="DLT missing" value={compliance.dlt.missing} sub="promo calls blocked" tint="var(--color-danger)" detail={dltMissingDetail} />
        <StatTile icon={ShieldCheck} label="DND scrubbing off" value={compliance.dndOff.length} sub="needs enforcement" tint={compliance.dndOff.length ? "var(--color-danger)" : "var(--color-success)"} detail={dndOffDetail} />
      </div>

      {(compliance.dndOff.length > 0 || compliance.dltGaps.length > 0) && (
        <Card title="Needs action">
          <ul className="divide-y divide-foam/70">
            {compliance.dndOff.map((c) => (
              <li key={`dnd-${c.id}`}>
                <button onClick={() => router.push(`/admin/clients/${c.id}`)} className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-oat/40">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-danger/12 text-danger"><ShieldAlert className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-coffee">{c.name}</span><span className="block text-[11px] text-danger">DND scrubbing is OFF — block promo batches until enabled</span></span>
                  <ChevronRight className="size-4 shrink-0 text-latte" />
                </button>
              </li>
            ))}
            {compliance.dltGaps.map((c) => (
              <li key={`dlt-${c.id}`}>
                <button onClick={() => router.push(`/admin/clients/${c.id}`)} className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-oat/40">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-warning/12 text-warning"><Clock3 className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-coffee">{c.name}</span><span className="block text-[11px] text-mocha">DLT {DLT_LABEL[c.dltStatus].toLowerCase()} — chase before next promo campaign</span></span>
                  <ChevronRight className="size-4 shrink-0 text-latte" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Compliance register" right={<span className={`${mono} text-[11px] text-latte`}>{live.length} live clients</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 font-medium">Client</th><th className="font-medium">DLT status</th><th className="font-medium">DND scrub</th><th className="font-medium">Calling window</th><th className="font-medium">Series</th>
            </tr></thead>
            <tbody>
              {live.map((c) => (
                <tr key={c.id} onClick={() => router.push(`/admin/clients/${c.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                  <td className="py-3 text-[13px] font-medium text-coffee">{c.name}</td>
                  <td><Tag c={DLT_TONE[c.dltStatus]}>{DLT_LABEL[c.dltStatus]}</Tag></td>
                  <td>{c.dndScrub ? <Tag c="var(--color-success)">On</Tag> : <Tag c="var(--color-danger)">Off</Tag>}</td>
                  <td className="text-[12.5px] text-mocha">09:00–21:00 IST</td>
                  <td className="text-[12.5px] text-mocha">{c.plan === "enterprise" || c.plan === "scale" ? "160 (txn)" : "140 (promo)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
