import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Megaphone, Users, Phone, PhoneCall, BarChart3, Activity,
  FileText, ListOrdered, Workflow, Headset, Plug, ShieldCheck, Brain,
  FlaskConical, Bot, Mic, ScrollText, Settings, Wallet, Crown, Sun, Coffee, ShieldAlert,
  Building2, IndianRupee, Gauge, SlidersHorizontal, ServerCog, History, LifeBuoy, UsersRound,
  Percent, Repeat, Filter, MapPin, Bell, Target, Layers, LineChart, BarChart2,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; group: string };

export const navGroups: { key: string; label: string }[] = [
  { key: "operate", label: "Operate" },
  { key: "analyze", label: "Analyze" },
  { key: "studio", label: "AI Studio" },
  { key: "admin", label: "Admin" },
];

export const nav: NavItem[] = [
  { label: "Today", href: "/today", icon: Sun, group: "operate" },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "operate" },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone, group: "operate" },
  { label: "Leads", href: "/leads", icon: Users, group: "operate" },
  { label: "Calls", href: "/calls", icon: Phone, group: "operate" },
  { label: "Call Monitor", href: "/call-monitoring", icon: PhoneCall, group: "operate" },
  { label: "Handoff", href: "/handoff", icon: Headset, group: "operate" },

  { label: "Analytics", href: "/analytics", icon: BarChart3, group: "analyze" },
  { label: "Live Analytics", href: "/realtime-analytics", icon: Activity, group: "analyze" },
  { label: "Reports", href: "/reports", icon: FileText, group: "analyze" },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck, group: "analyze" },

  { label: "Voice Playground", href: "/voice-playground", icon: Mic, group: "studio" },
  { label: "Learning Engine", href: "/learning", icon: Brain, group: "studio" },
  { label: "Learning Lab", href: "/learning-lab", icon: FlaskConical, group: "studio" },
  { label: "AI Testing", href: "/testing", icon: Bot, group: "studio" },
  { label: "Automation", href: "/automation", icon: Workflow, group: "studio" },
  { label: "Sequences", href: "/sequences", icon: ListOrdered, group: "studio" },

  { label: "Integrations", href: "/integrations", icon: Plug, group: "admin" },
  { label: "Settings", href: "/settings", icon: Settings, group: "admin" },
  { label: "Plans", href: "/plans", icon: Coffee, group: "admin" },
  { label: "Billing", href: "/settings/billing", icon: Wallet, group: "admin" },
  { label: "System Logs", href: "/system-logs", icon: ScrollText, group: "admin" },
  { label: "Admin", href: "/admin", icon: Crown, group: "admin" },
  { label: "Control Plane", href: "/admin/clients", icon: ShieldAlert, group: "admin" },
];

// ---- Super-Admin control plane: the sidebar swaps to this under /admin ----
export const adminNavGroups: { key: string; label: string }[] = [
  { key: "cp", label: "Control Plane" },
  { key: "growth", label: "Growth" },
  { key: "governance", label: "Governance" },
  { key: "team", label: "Team" },
];

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin/clients", icon: LayoutDashboard, group: "cp" },
  { label: "Clients", href: "/admin/clients/list", icon: Building2, group: "cp" },
  { label: "Revenue", href: "/admin/revenue", icon: IndianRupee, group: "cp" },
  { label: "Usage", href: "/admin/usage", icon: Gauge, group: "cp" },
  { label: "Unit Economics", href: "/admin/margins", icon: Percent, group: "cp" },
  { label: "AI Operations", href: "/admin/ai-ops", icon: Bot, group: "cp" },

  { label: "Growth & Retention", href: "/admin/growth", icon: Repeat, group: "growth" },
  { label: "Goals", href: "/admin/goals", icon: Target, group: "growth" },
  { label: "Activation Funnel", href: "/admin/funnel", icon: Filter, group: "growth" },
  { label: "Segments", href: "/admin/segments", icon: Layers, group: "growth" },
  { label: "Forecast", href: "/admin/forecast", icon: LineChart, group: "growth" },
  { label: "Benchmarks", href: "/admin/benchmarks", icon: BarChart2, group: "growth" },
  { label: "Campaigns", href: "/admin/campaigns", icon: Megaphone, group: "growth" },
  { label: "Geography", href: "/admin/geography", icon: MapPin, group: "growth" },

  { label: "Compliance", href: "/admin/compliance", icon: ShieldCheck, group: "governance" },
  { label: "Alerts", href: "/admin/alerts", icon: Bell, group: "governance" },
  { label: "Feature Flags", href: "/admin/features", icon: SlidersHorizontal, group: "governance" },
  { label: "System Health", href: "/admin/system", icon: ServerCog, group: "governance" },
  { label: "Audit Log", href: "/admin/audit", icon: History, group: "governance" },

  { label: "Staff", href: "/admin/staff", icon: UsersRound, group: "team" },
  { label: "Support", href: "/admin/support", icon: LifeBuoy, group: "team" },
  { label: "Admin Console", href: "/admin", icon: Crown, group: "team" },
];
