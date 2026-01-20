import type { Metadata } from "next";
import { Cinzel, Sora } from "next/font/google";
import "./globals.css";
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
  title: "Endowal | Financial Classroom Studio",
  description: "Project-based finance app for teachers and students."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <main>
          <NavBar />
          {children}
        </main>
      </body>
    </html>
  );
}
