// The Pour — post-submit cinematic timeline (ms). See LOGIN-DESIGN-SPEC.md §8.
export const POUR = {
  BREW_PILL: 0,      // button → Brewing… pill; form rows exit
  GLIDE: 150,        // jewel panel slides out; cup glides to center
  STREAM: 650,       // caramel pour-stream tops the cup; counter rolls
  STEAM: 900,        // steam blooms; ticker stamps final line
  RING: 1400,        // the cup "speaks" one teal ring
  WIPE: 1650,        // porcelain radial wipe
  PUSH: 1700,        // router.push under the wipe
  DONE: 2050,
  SKIP_AFTER: 300,   // any key/click after this jumps to WIPE
  MOCK_LATENCY: 650, // fake auth latency (error fires here)
} as const;

export const TICKER_ENTRIES = [
  { label: "collections reminder", city: "PUNE", dur: "00:42" },
  { label: "KYC verification", city: "JAIPUR", dur: "01:15" },
  { label: "payment follow-up", city: "MUMBAI", dur: "00:58" },
  { label: "loan onboarding", city: "INDORE", dur: "02:04" },
  { label: "mandate confirmation", city: "SURAT", dur: "00:37" },
] as const;

export const HEADLINE_WORDS = ["brewed", "poured", "answered", "spoken"] as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
