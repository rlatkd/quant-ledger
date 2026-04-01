import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "./_components/BottomNav";
import SessionGuard from "./_components/SessionGuard";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "퀀트 장부",
  description: "성균관대학교 퀀트응용경제학과 총무부 영수증 관리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <div className="flex-1 pb-20 max-w-md mx-auto w-full">
          {children}
        </div>
        <BottomNav />
        <SessionGuard />
      </body>
    </html>
  );
}
