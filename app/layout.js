import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "CodSim.pro | Advanced Ecommerce Simulator",
  description: "Calculate profitability, plan budgets, and analyze funnels for Morocco COD e-commerce.",
};

import { AuthProvider } from "@/contexts/AuthContext";
import I18nProvider from "@/components/I18nProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <I18nProvider>
          <AuthProvider>
            <Navigation />
            <main className="pt-20 min-h-screen bg-slate-50/50">
              {children}
            </main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
