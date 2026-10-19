import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({
    subsets: ["latin", "latin-ext"],   // latin-ext carries the ₹ sign
    variable: "--font-montserrat",
    display: "swap",
});

const title = "Solid Wealth | Mutual Funds, SIPs and Investment Calculators";
const description = "Solid Wealth helps you start, run and review mutual fund investments. SIPs, tax saving and goal planning, tracked in the Solid Wealth app, with free calculators and PDF reports.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        locale: "en_IN",
        url: SITE_URL,
        title,
        description: "Mutual funds, SIPs and tax saving, set up with Solid Wealth and tracked in your own app.",
    },
};

export const viewport: Viewport = { themeColor: "#FF6A00" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        // "js" is added before paint so reveal-on-scroll blocks start hidden only when scripts run
        <html lang="en" className={montserrat.variable} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
            </head>
            <body>
                {children}
                <Analytics />
            </body>
        </html>
    );
}
