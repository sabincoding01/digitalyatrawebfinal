"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, "testimonials"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTestimonials(data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [testimonials.length]);

  const goTo = (index: number) => {
    setActiveIndex((index + testimonials.length) % testimonials.length);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
  };

  if (loading) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-primary-950/20 flex justify-center">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  // Show up to 3 visible cards at once (centered on activeIndex)
  const getVisible = () => {
    if (testimonials.length === 1) return [{ t: testimonials[0], pos: "center", idx: 0 }];
    if (testimonials.length === 2) {
      return [
        { t: testimonials[activeIndex], pos: "center", idx: activeIndex },
        { t: testimonials[(activeIndex + 1) % 2], pos: "right", idx: (activeIndex + 1) % 2 },
      ];
    }
    const prev = (activeIndex - 1 + testimonials.length) % testimonials.length;
    const next = (activeIndex + 1) % testimonials.length;
    return [
      { t: testimonials[prev], pos: "left", idx: prev },
      { t: testimonials[activeIndex], pos: "center", idx: activeIndex },
      { t: testimonials[next], pos: "right", idx: next },
    ];
  };

  const visible = getVisible();

  return (
    <section className="py-24 bg-gray-50 dark:bg-primary-950/20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            What Our Clients Say
          </h2>
          <p className="text-lg text-foreground/70">
            Don&apos;t just take our word for it. Here is what some of our satisfied clients have to say about working with us.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 md:gap-6 min-h-[340px]">
            <AnimatePresence mode="popLayout">
              {visible.map(({ t, pos, idx }) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: pos === "center" ? 1 : 0.45,
                    scale: pos === "center" ? 1 : 0.82,
                    zIndex: pos === "center" ? 10 : 1,
                    filter: pos === "center" ? "blur(0px)" : "blur(1px)",
                  }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  onClick={() => goTo(idx)}
                  className={`bg-white dark:bg-primary-950 rounded-2xl border shadow-sm relative flex-shrink-0 cursor-pointer select-none transition-shadow duration-300
                    ${pos === "center"
                      ? "border-secondary-400/40 dark:border-secondary-500/30 shadow-xl w-full max-w-md p-8"
                      : "border-gray-100 dark:border-white/5 shadow-sm w-64 p-6 hidden md:block"
                    }`}
                >
                  {/* Quote icon */}
                  <Quote className={`absolute top-5 right-5 text-primary-100 dark:text-white/5 ${pos === "center" ? "w-12 h-12" : "w-8 h-8"}`} />

                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating || 5)].map((_: any, i: number) => (
                      <Star key={i} className={`fill-yellow-400 text-yellow-400 ${pos === "center" ? "w-5 h-5" : "w-4 h-4"}`} />
                    ))}
                  </div>

                  {/* Message */}
                  <p className={`text-foreground/80 italic leading-relaxed relative z-10 mb-6 ${pos === "center" ? "text-base line-clamp-5" : "text-sm line-clamp-3"}`}>
                    &ldquo;{t.message || t.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-auto">
                    <div className={`rounded-full bg-gradient-to-br from-primary-600 to-primary-900 text-white flex items-center justify-center font-bold shrink-0 ${pos === "center" ? "w-12 h-12 text-lg" : "w-9 h-9 text-sm"}`}>
                      {t.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-bold text-foreground ${pos === "center" ? "text-base" : "text-sm"}`}>{t.name}</h3>
                      <p className={`text-foreground/60 ${pos === "center" ? "text-sm" : "text-xs"}`}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Nav Arrows */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Previous testimonial"
                className="p-3 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-primary-950 hover:border-secondary-500 hover:text-secondary-500 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? "w-6 h-2.5 bg-secondary-500"
                        : "w-2.5 h-2.5 bg-gray-300 dark:bg-white/20 hover:bg-secondary-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Next testimonial"
                className="p-3 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-primary-950 hover:border-secondary-500 hover:text-secondary-500 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
