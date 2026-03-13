import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXTAUTH_URL ?? "https://clockwork.harryj.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Clockwork", template: "%s | Clockwork" },
  description:
    "Freelance time tracking & invoicing. Track hours, manage clients, and send professional invoices — all in one place.",
  openGraph: {
    type: "website",
    siteName: "Clockwork",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Clockwork",
                url: siteUrl,
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Clockwork",
                description:
                  "Freelance time tracking & invoicing. Track hours, manage clients, and send professional invoices.",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
              },
            ]),
          }}
        />
        <Providers>{children}</Providers>
        <Toaster richColors />
        <Analytics />
      </body>
    </html>
  );
}
