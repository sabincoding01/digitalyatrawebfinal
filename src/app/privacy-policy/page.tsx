import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Digital Yatra IT agency.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-600 font-semibold transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-secondary-500 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Last updated: June 28, 2026</p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
          <p>
            At Digital Yatra, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and handle your information when you visit our website at <strong>digitalyatranepal.netlify.app</strong>.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. Information We Collect</h2>
          <p>
            We collect information that you voluntarily provide to us when you fill out contact forms, apply for training courses, or subscribe to our newsletter. This information may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Service interest or course interest</li>
            <li>Custom message content</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Respond to your inquiries and project proposals</li>
            <li>Deliver IT course training syllabi to requested users</li>
            <li>Send newsletters and company updates (if you subscribed)</li>
            <li>Analyze web traffic using Google Analytics to improve user experience</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Database and Third-Party Tools</h2>
          <p>
            Your form submissions are securely recorded in our Firebase Firestore database. We use Google Analytics for basic traffic analysis. We do not sell, rent, or distribute your personal details to any third-party advertisers or external organizations.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Security</h2>
          <p>
            We implement standard digital security measures to safeguard your submissions. However, no transmission over the internet is 100% secure. Please avoid sending sensitive passwords or payment details via our contact forms.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">5. Cookies</h2>
          <p>
            Our site uses standard tracking cookies from Google Analytics to record visitor statistics. You can disable cookies in your browser settings if you wish to opt out.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <strong>Email:</strong> digitalyatra.tech@gmail.com
            <br />
            <strong>Phone:</strong> +977 9864155993
            <br />
            <strong>Location:</strong> Banepa, Nepal
          </p>
        </div>
      </div>
    </div>
  );
}
