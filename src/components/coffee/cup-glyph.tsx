// Tiny inline coffee-cup glyph (replaces the ☕ emoji which renders as tofu on some setups).
export function CupGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M4 9h11v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" fill="var(--color-caramel)" />
      <path d="M15 10h2.5a2.5 2.5 0 0 1 0 5H15" stroke="var(--color-mocha)" strokeWidth="1.6" fill="none" />
      <path d="M7 3.5c-.6 1 .6 1.6 0 2.6M11 3.5c-.6 1 .6 1.6 0 2.6" stroke="var(--color-latte)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
