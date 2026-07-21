/* /terms — House Rules: Terms of Service + Acceptable Use Policy.
   Written to shift misuse liability onto the customer (prank calls,
   spoofing, spam, consent violations) and cap VoiceBrew's exposure.
   Standalone overlay so it's readable from signup without app chrome. */

import Link from "next/link";
import { VoiceBrewMark } from "@/components/layout/voicebrew-logo";

const mono = "font-[family-name:var(--font-data)]";

function S({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="flex items-baseline gap-2 font-serif text-xl" style={{ color: "#2a1a0f" }}>
        <span className={`${mono} text-[12px]`} style={{ color: "#b8763d" }}>{n}</span> {title}
      </h2>
      <div className="mt-2 space-y-2 text-[14px] leading-relaxed" style={{ color: "#3d2817" }}>{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: "#fdf8f0" }}>
      <div className="mx-auto max-w-[760px] px-6 py-12">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <VoiceBrewMark className="size-7 text-coffee" />
            <span className={`${mono} text-[11px] uppercase tracking-[0.2em]`} style={{ color: "#6b4423" }}>VoiceBrew · by Blostem</span>
          </span>
          <Link href="/signup" className="text-[13px] font-medium underline-offset-4 hover:underline" style={{ color: "#b8763d" }}>← Back to the counter</Link>
        </div>
        <div className="mt-3 h-px w-full" style={{ background: "#d8bf9a" }} />

        <h1 className="mt-8 font-serif text-4xl" style={{ color: "#2a1a0f" }}>The House Rules</h1>
        <p className={`${mono} mt-2 text-[11px] uppercase tracking-[0.14em]`} style={{ color: "#6b4423" }}>
          Terms of Service &amp; Acceptable Use Policy · v1.0 · Effective 6 July 2026
        </p>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "#3d2817" }}>
          These terms are a binding agreement between you (the business opening a tab) and VoiceBrew by Blostem
          (&ldquo;VoiceBrew&rdquo;, &ldquo;we&rdquo;). By creating an account, checking the consent box, or placing a call through the
          platform, you accept every rule below. If you do not agree, do not use the service.
        </p>

        <S n="01" title="Eligibility & business use">
          <p>The service is offered to businesses and their authorised representatives, aged 18 or over, for lawful commercial voice communication. It is not offered for personal, consumer or entertainment use.</p>
        </S>

        <S n="02" title="Acceptable Use — what the house will never pour">
          <p>You must not use VoiceBrew, directly or indirectly, to place or attempt:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><b>Prank, hoax or nuisance calls</b> of any kind, including repeated hang-ups, wind-ups, or calls made to annoy, distress or waste the time of any person;</li>
            <li><b>Harassment, stalking, intimidation or threats</b>, or contact with any person who has asked not to be contacted;</li>
            <li><b>Impersonation or deception</b> — pretending to be another person, brand, government body, bank or authority; misrepresenting the caller&apos;s identity or purpose; manipulated or misleading caller ID (&ldquo;spoofing&rdquo;);</li>
            <li><b>Fraud or social engineering</b> — phishing, vishing, OTP harvesting, payment or KYC scams, or collecting personal data under false pretences;</li>
            <li><b>Unsolicited commercial calling in breach of law</b> — including calls to numbers on India&apos;s DND/NCPR registry without valid consent, calls outside permitted hours, or any violation of TRAI&apos;s TCCCPR and related regulations;</li>
            <li><b>Calls to emergency services</b> (112, 100, 101, 102, 108 or equivalents anywhere);</li>
            <li><b>Illegal, obscene, hateful or violent content</b>, or content that violates the rights (including privacy and publicity rights) of any person;</li>
            <li><b>Interference</b> — probing, overloading or circumventing the platform&apos;s limits, sandboxes or safety systems (including the verified-number rule for free credits).</li>
          </ul>
          <p>We may monitor usage signals, suspend calls or campaigns instantly, and terminate accounts for any breach — without refund and, where the law requires, with a report to the relevant authorities.</p>
        </S>

        <S n="03" title="Your responsibilities — you are the caller of record">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>You are solely responsible for the <b>content of every call</b>, script, prompt and campaign you run, and for the accuracy of anything your configured AI agent says.</li>
            <li>You must hold and be able to evidence a <b>lawful basis and any required consent</b> for every number you dial, and honour every opt-out immediately.</li>
            <li>You are responsible for <b>regulatory registrations</b> that apply to your calling (e.g. DLT entity registration, approved sender IDs/headers, 140/160-series numbering, template registration) before calling real customers.</li>
            <li>Where calls are recorded, <b>you must ensure recording disclosures and consents</b> required by applicable law are given.</li>
            <li>You must keep credentials secure; activity under your account is deemed yours.</li>
            <li>You must comply with all applicable law, including the DPDP Act 2023 (India) for personal data you upload.</li>
          </ul>
        </S>

        <S n="04" title="Free credits & the sandbox">
          <p>Complimentary credits (&ldquo;sips&rdquo;) may be used only to call numbers verified to your own account via OTP. They carry no cash value, are non-transferable, and may be withdrawn in case of abuse. Paid balances are prepayments for usage; fees are non-refundable except where required by law.</p>
        </S>

        <S n="05" title="Indemnity — misuse is on your tab">
          <p>You will defend, indemnify and hold harmless VoiceBrew, Blostem and their officers, employees and suppliers from and against any claim, complaint, regulatory action, penalty, loss or expense (including legal fees) arising out of or related to: (a) your calls, campaigns, scripts or data; (b) your breach of these terms or of applicable law — including, without limitation, prank or nuisance calling, spoofing, harassment, DND violations or absence of consent; and (c) disputes between you and any call recipient.</p>
        </S>

        <S n="06" title="Disclaimers & limitation of liability">
          <p>The service is provided <b>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</b>, without warranties of any kind, express or implied, including fitness for a particular purpose, uptime, call completion or the accuracy of AI-generated speech. To the maximum extent permitted by law: (a) VoiceBrew is <b>not liable for the conduct or content of your calls</b>; (b) neither party is liable for indirect, incidental, special or consequential damages; and (c) VoiceBrew&apos;s total aggregate liability is capped at the <b>fees you paid in the three (3) months before the claim</b> (or ₹5,000 if you have paid nothing).</p>
        </S>

        <S n="07" title="Suspension, termination & enforcement">
          <p>We may suspend or terminate the service (wholly or per-campaign) immediately where we reasonably suspect a breach of §02–§03, a security risk, a legal or carrier requirement, or non-payment. We may preserve and disclose records where required by law or to protect call recipients.</p>
        </S>

        <S n="08" title="The boring-but-binding rest">
          <p>These terms are governed by the laws of India with exclusive jurisdiction of the courts of Delhi. We may update these terms with notice in-product; continued use is acceptance. If any clause is unenforceable, the rest survive. These terms plus your order form are the entire agreement.</p>
        </S>

        <div className={`${mono} mt-10 border-t pt-4 text-[10px] uppercase tracking-[0.14em]`} style={{ borderColor: "#d8bf9a", color: "#a3906e" }}>
          Questions? Ask the manager — legal@voicebrew.example · Blostem, Delhi NCR
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/signup" className="rounded-xl px-4 py-2.5 font-serif text-[15px] font-semibold" style={{ background: "#b8763d", color: "#fffdf9" }}>Agree &amp; open a tab</Link>
          <Link href="/login" className="rounded-xl border px-4 py-2.5 text-[14px] font-medium" style={{ borderColor: "#d8bf9a", color: "#3d2817" }}>Back to the counter</Link>
        </div>
      </div>
    </div>
  );
}
