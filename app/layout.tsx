import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ScheduleHero",
  description: "HelloHero internal scheduling + case management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex h-full overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto" style={{ background: '#F8F9FC' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
