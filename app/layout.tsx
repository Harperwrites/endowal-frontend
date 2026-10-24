import { client } from "@/lib/client-config";
import ClientBoundary from "./components/ClientBoundary";
import type { Metadata } from "next";
import { Cinzel, Sora } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./components/Session";
import MessageCenter from "./components/MessageCenter";
import NavBar from "./components/NavBar";

const display = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-display"
});

const body = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: `${client.name} | Financial Learning`,
  description: client.description
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body data-client={client.id} style={{"--client-primary":client.theme.primary,"--client-accent":client.theme.accent,"--client-paper":client.theme.paper} as React.CSSProperties}>
        <main>
          <ClientBoundary><SessionProvider><NavBar />
          {children}{client.features.messaging&&<MessageCenter />}</SessionProvider></ClientBoundary>
        </main>
      </body>
    </html>
  );
}
