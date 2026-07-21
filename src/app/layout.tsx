import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono, Calistoga } from "next/font/google";
import "./globals.css";
import { V6Sidebar } from "@/components/v6/sidebar";
import { V6Topbar } from "@/components/v6/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { Toaster } from "@/components/notifications/toaster";
import { BackgroundMotifs } from "@/components/coffee/background-motifs";
import { GuidedTour } from "@/components/onboarding/guided-tour";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-display" });
const jetmono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-data" });
const calistoga = Calistoga({ subsets: ["latin"], weight: ["400"], variable: "--font-brew" });

export const metadata: Metadata = {
  title: "VoiceBrew",
  description: "VoiceBrew — AI voice-calling operations",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetmono.variable} ${calistoga.variable} h-full antialiased`}
    >
      <body className="h-full">
        <BackgroundMotifs />
        <TooltipProvider>
          <div className="flex h-screen overflow-hidden">
            <V6Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <V6Topbar />
              <main className="flex-1 overflow-y-auto px-6 py-7 lg:px-8">{children}</main>
            </div>
          </div>
          <CommandPalette />
          <GuidedTour />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
