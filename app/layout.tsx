import { client } from "@/lib/client-config";
import ClientBoundary from "./components/ClientBoundary";
import type { Metadata } from "next";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/sora";
import "./globals.css";
import { SessionProvider } from "./components/Session";
import MessageCenter from "./components/MessageCenter";
import NavBar from "./components/NavBar";

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
    <html lang="en" style={{"--font-display":"'Cinzel Variable'", "--font-body":"'Sora Variable'"} as React.CSSProperties}>
      <body data-client={client.id} style={{"--client-primary":client.theme.primary,"--client-accent":client.theme.accent,"--client-paper":client.theme.paper} as React.CSSProperties}>
        <main>
          <ClientBoundary><SessionProvider><NavBar />
          {children}{client.features.messaging&&<MessageCenter />}</SessionProvider></ClientBoundary>
        </main>
      </body>
    </html>
  );
}
