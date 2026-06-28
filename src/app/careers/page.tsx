import type { Metadata } from "next";
import CareersClient from "./_client";

export const metadata: Metadata = {
  title: "Careers — Join Our Team",
  description:
    "Explore open job positions at Digital Yatra. We're looking for passionate developers, designers, and digital marketers to join our growing team in Nepal.",
  alternates: { canonical: "https://digitalyatra.com/careers" },
  openGraph: {
    title: "Careers | Digital Yatra",
    description: "Join Nepal's premier IT agency. View open roles and apply today.",
    url: "https://digitalyatra.com/careers",
    type: "website",
    images: [{ url: "https://digitalyatra.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers | Digital Yatra",
    description: "Join Nepal's premier IT agency — view open roles.",
  },
};

export default function CareersPage() {
  return <CareersClient />;
}
