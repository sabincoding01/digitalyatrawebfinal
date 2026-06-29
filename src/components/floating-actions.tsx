"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle, Star, X, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TestimonialForm } from "./TestimonialForm";

export function FloatingActions() {
  const pathname = usePathname();
  const isAppRoute = pathname.startsWith("/admin") || pathname.startsWith("/portal");

  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [isDarkLogoColor, setIsDarkLogoColor] = useState(false);
  const hints = ["WhatsApp Support", "Give Feedback"];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      setIsVisible(scrollY > 300);
      
      const scrolled = (scrollY / (docHeight - winHeight)) * 100;
      setScrollProgress(scrolled);

      // Change button color when not in Hero (<600px) and not in Footer (bottom 600px)
      const inHero = scrollY < 600;
      const inFooter = scrollY + winHeight > docHeight - 600;
      setIsDarkLogoColor(!inHero && !inFooter);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) return;
    const interval = setInterval(() => {
      setActiveHintIndex((prev) => (prev + 1) % hints.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isMenuOpen, hints.length]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isAppRoute) return null;

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className={`fixed top-0 left-0 w-full h-1 z-[60] bg-transparent transition-opacity duration-300 ${scrollProgress > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div 
          className="h-full bg-secondary-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Independent Scroll to Top */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-[150px] right-6 z-[60] w-12 h-12 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-all hover:scale-110"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Grouped Floating Action Button (Support & Connect) */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
        
        {/* Expanded Options Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 mb-2"
            >
              
              {/* WhatsApp Option */}
              <a
                href="https://wa.me/9779864155993"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2 pr-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                aria-label="WhatsApp Support"
              >
                <div className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">WhatsApp Support</span>
              </a>

              {/* Feedback Option */}
              <button
                onClick={() => {
                  setIsFeedbackOpen(true);
                  setIsMenuOpen(false);
                }}
                className="group flex items-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2 pr-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                aria-label="Give Feedback"
              >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">Give Feedback</span>
              </button>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Rotating Tooltip when closed */}
        <AnimatePresence mode="wait">
          {!isMenuOpen && (
            <motion.div
              key={activeHintIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute -top-12 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg whitespace-nowrap pointer-events-none border border-zinc-200 dark:border-zinc-700 flex flex-col items-center right-0"
            >
              {hints[activeHintIndex]}
              {/* Small triangle pointer */}
              <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-white dark:bg-zinc-800 border-b border-r border-zinc-200 dark:border-zinc-700 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`relative flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl backdrop-blur-lg border border-white/20 transition-all duration-300 hover:scale-105 ${
            isMenuOpen 
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
              : isDarkLogoColor
                ? "bg-primary-900 hover:bg-primary-950 text-white"
                : "bg-secondary-500 hover:bg-secondary-600 text-white"
          }`}
          aria-label="Connect Options"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <HelpCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{isMenuOpen ? "Close" : "Connect"}</span>
          
          {/* Subtle one-time pulse effect when closed */}
          {!isMenuOpen && (
            <span className="absolute inset-0 rounded-full border-2 border-secondary-500/40 animate-pulse pointer-events-none" />
          )}
        </button>

      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl"
            >
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full z-10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <TestimonialForm />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
