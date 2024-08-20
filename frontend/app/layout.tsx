import FirebaseUserProvider from "@/lib/firebase-user";
import "@/styles/globals.css";
import { RootProvider } from 'fumadocs-ui/provider';
import { ThemeProvider } from "@/components/common/ThemeProvider";
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
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
            {children} 
            </ThemeProvider>
          </RootProvider>
        </FirebaseUserProvider>
      </body>
    </html>
  );
}
