"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const service = formData.get("service") as string;
    const message = formData.get("message") as string;

    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE");

    try {
      // Send email via Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      // Save to Firebase regardless of Web3Forms result
      try {
        await addDoc(collection(db, "contacts"), {
          name,
          email,
          phone,
          service,
          message,
          status: "new",
          createdAt: serverTimestamp(),
        });
      } catch (fbErr) {
        console.error("Firebase save error:", fbErr);
      }

      if (data.success) {
        setStatus("success");
        toast.success("Message Sent!", {
          description: "Thank you! We will get back to you shortly."
        });
        (event.target as HTMLFormElement).reset();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        toast.error("Failed to send", {
          description: data.message || "Something went wrong. Please try again."
        });
      }
    } catch (error) {
      setStatus("error");
      toast.error("Network Error", {
        description: "Please check your connection and try again."
      });
    }
  };

  return (
    <section id="contact" className="py-24 bg-background relative scroll-mt-header">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Get In Touch</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            Let's Discuss Your Project
          </h2>
          <p className="text-lg text-foreground/70">
            Ready to transform your ideas into reality? Contact us today for a free consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="bg-primary-950 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-secondary-500 rounded-full blur-[80px]" />
              
              <h3 className="text-2xl font-bold mb-6 relative z-10">Contact Info</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-secondary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-1">Email Us</h4>
                    <a href="mailto:digitalyatra.tech@gmail.com" className="text-lg hover:text-secondary-400 transition-colors">digitalyatra.tech@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-secondary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-1">Call Us</h4>
                    <a href="tel:+9779864155993" className="text-lg hover:text-secondary-400 transition-colors">+977 9864155993</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-1">WhatsApp</h4>
                    <a href="https://wa.me/9779864155993" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#25D366] transition-colors">+977 9864155993</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-secondary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-1">Location</h4>
                    <span className="text-lg">Banepa, Nepal</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-primary-950/40 p-6 sm:p-8 md:p-12 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground/80">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-primary-900 border border-gray-200 dark:border-white/10 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition-all dark:text-white"
                    placeholder="Ram......."
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-primary-900 border border-gray-200 dark:border-white/10 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition-all dark:text-white"
                    placeholder="ram@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground/80">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-primary-900 border border-gray-200 dark:border-white/10 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition-all dark:text-white"
                    placeholder="+977 **********"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service" className="text-sm font-medium text-foreground/80">Service Required</label>
                  <select 
                    id="service" 
                    name="service"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-primary-900 border border-gray-200 dark:border-white/10 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition-all dark:text-white appearance-none"
                  >
                    <option value="">Select a service</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile App</option>
                    <option value="design">UI/UX Design</option>
                    <option value="marketing">Digital Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground/80">Your Message</label>
                <textarea 
                  id="message" 
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-primary-900 border border-gray-200 dark:border-white/10 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition-all dark:text-white resize-none"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-secondary-500 hover:bg-secondary-600 disabled:bg-secondary-500/50 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
                {status !== "loading" && <Send className="w-5 h-5" />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
