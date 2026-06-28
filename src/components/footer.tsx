"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Code2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";



export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "subscribers"), {
        email,
        subscribedAt: new Date()
      });
      toast.success("Subscribed successfully!", {
        description: "Thank you for subscribing to our newsletter."
      });
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-primary-950 text-white pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Overview */}
          <div className="space-y-6">
            <Link href="#home" aria-label="Digital Yatra — Go to homepage" className="flex items-center gap-2 group">
              <Image src="/logo.png" alt="Digital Yatra Logo" width={56} height={56} className="h-14 w-auto bg-primary-900 rounded-lg p-1 group-hover:bg-primary-600 transition-colors" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transforming Ideas into Digital Success. We deliver innovative web solutions, software development, and IT consulting services to help businesses grow in the digital era.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> About Us</a></li>
              <li><a href="#services" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> Services</a></li>
              <li><a href="#expertise" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> Our Expertise</a></li>
              <li><a href="#process" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> Working Process</a></li>
              <li><a href="#contact" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#services" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> Web Development</a></li>
              <li><a href="#services" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> Mobile Apps</a></li>
              <li><a href="#services" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> UI/UX Design</a></li>
              <li><a href="#services" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> Digital Marketing</a></li>
              <li><a href="#services" className="hover:text-secondary-500 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4 text-secondary-500" /> IT Consulting</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary-500 shrink-0 mt-0.5" />
                <span>Banepa, Nepal</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary-500 shrink-0" />
                <span>+977 9864155993</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary-500 shrink-0" />
                <span>digitalyatra.tech@gmail.com</span>
              </li>
            </ul>

            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3">Subscribe to Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex border border-white/20 rounded-lg overflow-hidden focus-within:border-secondary-500 transition-colors">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  className="bg-transparent px-4 py-2 text-sm w-full outline-none text-white placeholder:text-gray-500 disabled:opacity-50"
                  required
                  disabled={loading}
                />
                <button type="submit" disabled={loading} className="bg-secondary-500 px-4 py-2 text-white hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2026 Digital Yatra. All Rights Reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
