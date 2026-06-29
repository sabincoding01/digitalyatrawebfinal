import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Digital Yatra IT agency.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-600 font-semibold transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-secondary-500 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Last updated: June 28, 2026</p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
          <p>
            Welcome to Digital Yatra. By accessing or using our website at <strong>digitalyatranepal.netlify.app</strong>, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
          <p>
            By using this website or booking our IT services (including Web Development, Custom Software, Digital Marketing, and IT Courses), you agree to these Terms. If you do not agree, please refrain from using our site.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. Scope of IT Services</h2>
          <p>
            Digital Yatra provides digital consulting, design, coding, training, and marketing services. Project agreements, milestones, deliverables, and payment terms will be explicitly defined in custom service contracts signed directly with our client before the start of any paid project.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Course Training & Enrollment</h2>
          <p>
            Information provided regarding our featured IT training courses (duration, syllabus content, and levels) is subject to updates. Requesting a syllabus creates a lead in our system, and we will contact you directly to discuss enrollment details.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Intellectual Property</h2>
          <p>
            All custom software code, site designs, graphics, and training materials created by Digital Yatra are protected by copyright laws. Ownership of client-specific custom code is fully transferred to the client upon receipt of final project payments as agreed in individual contracts.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">5. Limitation of Liability</h2>
          <p>
            Digital Yatra will not be liable for any indirect, incidental, or consequential damages resulting from the use of our services or software post-delivery. We provide a support period after launch as detailed in client contracts to rectify coding anomalies.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">6. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising out of these terms shall be subject to the courts of Kavre/Kathmandu, Nepal.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">7. Contact Information</h2>
          <p>
            For any queries regarding these Terms of Service, please reach out to us:
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
