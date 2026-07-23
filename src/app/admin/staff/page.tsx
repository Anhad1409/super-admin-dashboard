"use client";

/* /admin/staff — Blostem team accounts: roles, 2FA posture and activity. */

import { UsersRound, ShieldCheck, ShieldAlert, Plus } from "lucide-react";
import { toast } from "@/components/notifications/toaster";
import { CpHeader, StatTile, Card, Tag, mono } from "@/components/admin/cp";
import { staff, ROLE_META } from "@/lib/admin-mock";
import { listDetail } from "@/lib/metric-details";

export default function StaffPage() {
  const superAdmins = staff.filter((s) => s.role === "super_admin").length;
  const no2fa = staff.filter((s) => !s.twoFA).length;

  const teamDetail = listDetail("Team members", String(staff.length),
    "Everyone with control-plane access, by activity this month.", "By member",
    [...staff].sort((a, b) => b.actions30d - a.actions30d).map((m) => ({
      name: m.name, value: `${m.actions30d} actions`, pct: m.actions30d,
      tint: ROLE_META[m.role].tint, sub: ROLE_META[m.role].label, flag: !m.twoFA,
    })), undefined, "Flagged members are missing 2FA.");
  const tfaDetail = listDetail("2FA enabled", `${staff.length - no2fa} / ${staff.length}`,
    "Two-factor status per member — enforce before the next login for anyone off.", "By member",
    [...staff].sort((a, b) => Number(a.twoFA) - Number(b.twoFA)).map((m) => ({
      name: m.name, value: m.twoFA ? "On" : "Off",
      tint: m.twoFA ? "var(--color-success)" : "var(--color-danger)",
      sub: ROLE_META[m.role].label, flag: !m.twoFA,
    })));
  const no2faDetail = listDetail("Missing 2FA", String(no2fa),
    no2fa ? "These accounts can act on client data without a second factor." : "Every staff account is secured.",
    "Needs enforcement",
    staff.filter((m) => !m.twoFA).map((m) => ({
      name: m.name, value: m.email, tint: "var(--color-danger)", sub: ROLE_META[m.role].label, flag: true,
    })));

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Staff" subtitle="Blostem team accounts with access to the control plane — roles, 2FA and activity."
        right={<button onClick={() => toast({ title: "Invite staff", body: "Open the staff invite flow.", severity: "info" })} className="inline-flex items-center gap-1.5 rounded-full bg-caramel/20 px-3.5 py-2 text-xs font-semibold text-caramel hover:bg-caramel/30"><Plus className="size-3.5" /> Invite staff</button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={UsersRound} label="Team members" value={staff.length} sub={`${superAdmins} super admins`} tint="var(--color-caramel)" detail={teamDetail} />
        <StatTile icon={ShieldCheck} label="2FA enabled" value={`${staff.length - no2fa} / ${staff.length}`} sub="of all staff" tint="var(--color-success)" detail={tfaDetail} />
        <StatTile icon={ShieldAlert} label="Missing 2FA" value={no2fa} sub={no2fa ? "enforce before next login" : "all secured"} tint={no2fa ? "var(--color-danger)" : "var(--color-success)"} detail={no2faDetail} />
      </div>

      <Card title="Team">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 font-medium">Member</th><th className="font-medium">Role</th><th className="font-medium">2FA</th><th className="text-right font-medium">Actions · 30d</th><th className="pl-4 font-medium">Last active</th>
            </tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.email} className="border-b border-foam/60 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-caramel to-mocha text-[12px] font-semibold text-cream">{s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                      <div><div className="text-[13px] font-semibold text-coffee">{s.name}</div><div className="text-[11px] text-muted-foreground">{s.email}</div></div>
                    </div>
                  </td>
                  <td><Tag c={ROLE_META[s.role].tint}>{ROLE_META[s.role].label}</Tag></td>
                  <td>{s.twoFA ? <Tag c="var(--color-success)">On</Tag> : <Tag c="var(--color-danger)">Off</Tag>}</td>
                  <td className="text-right text-[13px] text-mocha tabular-nums">{s.actions30d}</td>
                  <td className="pl-4 text-[12px] text-muted-foreground">{new Date(s.lastActive + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
