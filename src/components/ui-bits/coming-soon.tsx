import { Coffee, Check } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";

// Rich page scaffold for screens still being built — reads like a real page (with a
// skeleton preview) rather than an empty placeholder. Pass `features` to list what's coming.
export function ComingSoon({ title, subtitle, features }: { title: string; subtitle?: string; features?: string[] }) {
  const bar = (w: string) => <div className={`h-3 rounded-full bg-foam ${w}`} />;
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<span className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-oat/70 px-3 py-1 text-xs font-medium text-mocha"><Coffee className="size-3.5 text-caramel" /> Brewing — coming soon</span>}
      />

      {/* skeleton stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            {bar("w-1/2")}
            <div className="mt-3 h-7 w-2/3 rounded-lg bg-oat" />
            <div className="mt-3">{bar("w-1/3")}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* skeleton table */}
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass lg:col-span-2">
          <div className="mb-4 h-4 w-40 rounded bg-oat" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-foam" />
                <div className="flex-1 space-y-1.5"><div className="h-3 w-1/3 rounded bg-foam" />{bar("w-1/2")}</div>
                <div className="h-3 w-12 rounded bg-foam" />
              </div>
            ))}
          </div>
        </div>

        {/* what's coming */}
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mocha">
            <Coffee className="size-3.5 text-caramel" /> On the menu
          </div>
          {features && features.length ? (
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-coffee">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3 pt-1">
              {bar("w-5/6")}{bar("w-2/3")}{bar("w-3/4")}{bar("w-1/2")}
            </div>
          )}
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            The shell, theme and navigation are wired. This screen is part of the build — the layout above previews what it&apos;ll hold.
          </p>
        </div>
      </div>
    </div>
  );
}
