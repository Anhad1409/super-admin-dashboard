import { V6Dashboard } from "@/components/v6/dashboard";
import { FirstPourCard } from "@/components/v6/first-pour-card";

export default function DashboardPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl"><FirstPourCard /></div>
      <V6Dashboard />
    </>
  );
}
