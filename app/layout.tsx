import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Upforge Content OS",
  description: "Shardul's Instagram content operating system: calendar, hooks, scripts, research, and prompts, all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background text-foreground">
        <Nav />
        <main className="flex-1 min-w-0 px-6 py-8 md:px-10 md:py-10">{children}</main>
      </body>
    </html>
  );
}
