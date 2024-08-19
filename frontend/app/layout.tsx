import FirebaseUserProvider from "@/lib/firebase-user";
import "@/styles/globals.css";
import { RootProvider } from 'fumadocs-ui/provider';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compass",
  description: "Compass ai chat",
  icons: "/icon/compass_icon.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>        
        <FirebaseUserProvider>
          <RootProvider>
          {children} 
          </RootProvider>
        </FirebaseUserProvider>
      </body>
    </html>
  );
}
