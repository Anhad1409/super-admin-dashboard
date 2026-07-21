import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/layout/brand-mark";

/**
 * VoiceBrew brand mark — the official logo: a coffee cup wearing headphones,
 * steam rising as a voice waveform. Full-color vector; scales cleanly.
 * Pass `animated` for the login-journey reveal (spring in + drifting steam).
 */
export function VoiceBrewMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return <BrandMark className={className} animated={animated} />;
}

/** Full lockup: mark + "VoiceBrew" wordmark + "by Blostem". */
export function VoiceBrewLogo({ className, sub = true, animated = false }: { className?: string; sub?: boolean; animated?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <VoiceBrewMark className="size-9 shrink-0" animated={animated} />
      <span className="leading-tight">
        <span className="block font-serif text-lg font-semibold text-coffee">
          Voice<span className="text-caramel">Brew</span>
        </span>
        {sub && <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-latte">by Blostem</span>}
      </span>
    </span>
  );
}
