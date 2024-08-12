import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FirebaseUserProvider from "../lib/firebase-user";
import FrameLayout from "@/components/common/FrameLayout";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Compass",
  description: "Compass AI",
  icons: "/icon/compass_icon.png"
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseUserProvider>
          {/* {children} */}
          <FrameLayout>
            {children}
          </FrameLayout>
        </FirebaseUserProvider>
      </body>
    </html>
  );
};

export default RootLayout;
