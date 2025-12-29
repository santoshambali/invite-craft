import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EnvInfo from "./components/EnvInfo";
import { AuthProvider } from "./contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LAGU Invitations - Create Beautiful Invitations",
  description: "Create and share beautiful invitations with AI-powered design",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load runtime environment configuration */}
        <script src="/env-config.js" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <EnvInfo />
      </body>
    </html>
  );
}
