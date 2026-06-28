"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function TestimonialForm() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    message: "",
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await addDoc(collection(db, "testimonials"), {
        ...formData,
        createdAt: new Date(),
        status: "pending", // To be approved by admin
      });
      setSubmitStatus("success");
      toast.success("Testimonial Submitted!", {
        description: "Thank you! Your feedback is under review."
      });
      setFormData({ name: "", role: "", message: "", rating: 5 });
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Failed to submit", {
        description: "Please check your network connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Share Your Experience</h2>
        <p className="text-zinc-500 dark:text-zinc-400">We'd love to hear your thoughts about our services.</p>
      </div>

      {submitStatus === "success" ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4"
        >
          <CheckCircle2 className="w-12 h-12" />
          <div>
            <h3 className="text-xl font-semibold mb-1">Thank You!</h3>
            <p>Your testimonial has been submitted successfully and is pending review.</p>
          </div>
          <button 
            onClick={() => setSubmitStatus("idle")}
            className="mt-4 px-6 py-2 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-lg transition-colors font-medium"
          >
            Submit Another
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder:text-zinc-400 dark:text-white"
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Role / Company
              </label>
              <input
                type="text"
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder:text-zinc-400 dark:text-white"
                placeholder="CEO at Company"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="rating" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all dark:text-white"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Star" : "Stars"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder:text-zinc-400 resize-none dark:text-white"
              placeholder="Tell us about your experience..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-blue-800 text-white font-medium rounded-xl transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit Testimonial</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
