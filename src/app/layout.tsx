import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FloatingActions } from "@/components/floating-actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Yatra | Transforming Ideas into Digital Success",
  description: "Digital Yatra delivers innovative web solutions, software development, digital marketing, branding, and IT consulting services that help businesses grow in the digital era.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ITService",
  "name": "Digital Yatra",
  "image": "https://digitalyatra.com/logo.png",
  "url": "https://digitalyatra.com",
  "telephone": "+977-9864155993",
  "email": "digitalyatra.tech@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Kathmandu",
    "addressCountry": "NP"
  },
  "description": "Digital Yatra delivers innovative web solutions, software development, digital marketing, branding, and IT consulting services that help businesses grow in the digital era.",
  "priceRange": "$$",
  "openingHours": "Mo,Tu,We,Th,Fr 09:00-18:00"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingActions />
        </ThemeProvider>
      </body>
    </html>
  );
}
