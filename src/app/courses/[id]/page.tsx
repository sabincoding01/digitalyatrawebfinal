"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { Clock, Users, ArrowLeft, Phone, CreditCard, CheckCircle2, X, Download, FileText } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CourseDetailsPage() {
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  
  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!params.id) return;
        const docRef = doc(db, "courses", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Course not found.");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  const handleSyllabusDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setIsSubmittingLead(true);
    try {
      await addDoc(collection(db, "courseLeads"), {
        courseId: course.id,
        courseTitle: course.title,
        name: leadName,
        email: leadEmail,
        createdAt: new Date()
      });
      toast.success("Syllabus Sent!", {
        description: "The syllabus has been sent to your email (Demo)."
      });
      setIsSyllabusModalOpen(false);
      
      // In a real app, you would trigger a file download or email here.
      // For now, we'll just simulate a download.
      const link = document.createElement("a");
      link.href = "#"; // Replace with actual PDF link
      link.download = `${course.title}-Syllabus.pdf`;
      link.click();
      
    } catch (err) {
      console.error("Error saving lead:", err);
      toast.error("Failed to process request. Please try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{error || "Course not found"}</h1>
        <Link href="/#courses" className="text-blue-600 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Link href="/#courses" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to all courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {course.thumbnailUrl && (
                <div className="w-full h-64 md:h-96 relative rounded-3xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {course.duration || "4 Weeks"}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {course.level || "Beginner"}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
                  {course.title}
                </h1>
                
                <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap mb-8">
                  {course.description}
                </div>

                <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border">
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-1">Curriculum & Syllabus</h3>
                    <p className="text-sm text-zinc-500">Get a detailed PDF of what you will learn in this course.</p>
                  </div>
                  <button
                    onClick={() => setIsSyllabusModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar / Booking Area */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Book Your Seat</h3>
                <p className="text-zinc-500 mb-8">Scan the QR code below to make your payment securely via eSewa.</p>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center mb-8">
                  <button 
                    onClick={() => setIsQrModalOpen(true)}
                    className="relative group block w-48 h-48 mb-4 rounded-xl overflow-hidden cursor-pointer"
                    aria-label="Enlarge QR Code"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/esewa-qr.jpeg" alt="eSewa QR Code" className="w-full h-full object-contain bg-white p-2" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Click to enlarge</span>
                    </div>
                  </button>
                  
                  <div className="text-center w-full space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500 text-sm">Account Name</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">Sabin Timalsina</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-zinc-500 text-sm">eSewa ID / Phone</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">9864155993</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> After Payment
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Send a screenshot of your successful transaction to confirm your enrollment.
                  </p>
                  
                  <a
                    href="https://wa.me/9779864155993"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Confirm on WhatsApp
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Syllabus Download Lead Capture Modal */}
      <AnimatePresence>
        {isSyllabusModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800"
            >
              <button 
                onClick={() => setIsSyllabusModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Download Course Syllabus</h3>
                <p className="text-sm text-zinc-500 mt-2">Enter your details to receive the detailed PDF syllabus for <strong>{course.title}</strong>.</p>
              </div>

              <form onSubmit={handleSyllabusDownload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmittingLead ? "Processing..." : (
                    <>
                      <Download className="w-4 h-4" /> Download PDF
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white p-4 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center"
            >
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="w-full text-center mb-4 pt-2">
                <h3 className="text-xl font-bold text-zinc-900">Scan to Pay</h3>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/esewa-qr.jpeg" alt="eSewa QR Code" className="w-full max-w-[300px] h-auto object-contain rounded-xl border-4 border-emerald-500" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
