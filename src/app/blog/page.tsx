import type { Metadata } from "next";
import BlogClient from "./_client";

export const metadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Read the latest articles, tutorials, and insights from Digital Yatra on web development, digital marketing, software engineering, and tech trends in Nepal.",
  alternates: { canonical: "https://digitalyatra.com/blog" },
  openGraph: {
    title: "Blog & Insights | Digital Yatra",
    description:
      "Latest articles on web dev, digital marketing, and tech from Nepal's premier IT agency.",
    url: "https://digitalyatra.com/blog",
    type: "website",
    images: [{ url: "https://digitalyatra.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Insights | Digital Yatra",
    description: "Latest articles from Nepal's premier IT agency.",
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
