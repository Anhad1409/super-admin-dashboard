import { MetricProvider } from "@/components/admin/metric";

/* Every control-plane screen lives under one MetricProvider, so any KPI tile
   can open the shared drill-down drawer. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <MetricProvider>{children}</MetricProvider>;
}
