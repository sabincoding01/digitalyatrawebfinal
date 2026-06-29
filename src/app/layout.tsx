import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/app-shell";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Core
  title: {
    default: "Digital Yatra | Web Development, Software & Digital Marketing in Nepal",
    template: "%s | Digital Yatra",
  },
  description:
    "Digital Yatra is Nepal's premier IT agency offering web development, custom software, digital marketing, branding, IT consulting, and IT training courses. Based in Banepa, serving businesses globally.",
  keywords: [
    "web development Nepal",
    "software development Banepa",
    "digital marketing Nepal",
    "IT company Nepal",
    "branding Nepal",
    "IT courses Nepal",
    "app development Nepal",
    "SEO Nepal",
    "React Next.js developer Nepal",
    "Digital Yatra",
    "IT consulting Banepa",
    "custom software Nepal",
    "robotics AI training Nepal",
  ],

  // Canonical URL
  alternates: {
    canonical: "https://digitalyatranepal.netlify.app",
  },

  // Author & Publisher
  authors: [{ name: "Digital Yatra", url: "https://digitalyatranepal.netlify.app" }],
  creator: "Digital Yatra",
  publisher: "Digital Yatra",

  // Open Graph (Facebook, LinkedIn, WhatsApp previews)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://digitalyatranepal.netlify.app",
    siteName: "Digital Yatra",
    title: "Digital Yatra | Web Development, Software & Digital Marketing in Nepal",
    description:
      "Nepal's premier IT agency — web development, custom software, branding, digital marketing & IT training. We build digital systems that grow your business.",
    images: [
      {
        url: "https://digitalyatranepal.netlify.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Digital Yatra — Nepal's Premier IT Agency",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Digital Yatra | Web Development & Digital Marketing Nepal",
    description:
      "Nepal's premier IT agency — web development, software, branding & digital marketing. We build systems that grow your business.",
    images: ["https://digitalyatranepal.netlify.app/og-image.png"],
    creator: "@digitalyatra",
  },

  // Robots control
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Favicon & Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  // App metadata
  applicationName: "Digital Yatra",
  category: "technology",
  classification: "IT Services",
  manifest: "/manifest.json",
  verification: {
    google: "eudiXq8rVfS6W6rAAeOE6W_kV3qAfvim65T8i8Oc5WM",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#04121e" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Digital Yatra",
  "image": "https://digitalyatranepal.netlify.app/logo.png",
  "@id": "https://digitalyatranepal.netlify.app",
  "url": "https://digitalyatranepal.netlify.app",
  "telephone": "+977-9864155993",
  "email": "digitalyatra.tech@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Banepa",
    "addressLocality": "Banepa",
    "addressRegion": "Bagmati",
    "addressCountry": "NP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 27.6333,
    "longitude": 85.5167
  },
  "description": "Digital Yatra is a Nepal-based IT agency offering web development, custom software, digital marketing, branding, IT consulting, and IT training. We serve startups and small businesses with fast turnaround and transparent pricing.",
  "priceRange": "$$",
  "openingHours": "Mo,Tu,We,Th,Fr 09:00-18:00",
  "foundingDate": "2024",
  "areaServed": ["Nepal", "Global"]
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
        {/* Google Analytics Placeholder */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-FBB5H81KSK`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-FBB5H81KSK', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="beforeInteractive"
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
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
