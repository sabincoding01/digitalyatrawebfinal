import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Script from "next/script";
import { FloatingActions } from "@/components/floating-actions";
import { Toaster } from "sonner";

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
    images: ["https://digitalyatra.com/og-image.png"],
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
  themeColor: "#F7941D",
  verification: {
    google: "eudiXq8rVfS6W6rAAeOE6W_kV3qAfvim65T8i8Oc5WM",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ITService",
  "name": "Digital Yatra",
  "image": "https://digitalyatranepal.netlify.app/logo.png",
  "@id": "https://digitalyatranepal.netlify.app",
  "url": "https://digitalyatranepal.netlify.app",
  "telephone": "+977-9864155993",
  "email": "digitalyatra.tech@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Banepa",
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
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              Tawk_API.onLoad = function(){
                Tawk_API.hideWidget();
              };
              Tawk_API.onChatMinimized = function(){
                Tawk_API.hideWidget();
              };
              Tawk_API.onChatHidden = function(){
                Tawk_API.hideWidget();
              };
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/6a40b946110aba1d52a2e12b/1js6d7f7k';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
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
          <Toaster position="bottom-right" richColors theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
