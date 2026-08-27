import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VedaAI",
  description: "AI-powered assessment extraction and answer mapping for teachers",
  icons: {
    icon: "/vedaai_logo.avif?v=2",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} h-full`}>
      <body
        className="h-screen overflow-hidden flex"
        style={{ background: "linear-gradient(180deg, #F5F5F5 0%, #E9E5E5 100%)" }}
      >
        {/* Fixed sidebar */}
        <Sidebar />

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <TopNav />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
