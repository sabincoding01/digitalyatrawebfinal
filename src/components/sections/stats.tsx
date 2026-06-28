"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Simple counter component that animates from 0 to target
const Counter = ({ target, suffix = "", isString = false }: { target: number | string; suffix?: string; isString?: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isString) return;
    const numTarget = typeof target === 'string' ? parseFloat(target) : target;
    if (isNaN(numTarget)) return;

    let startTime: number;
    let animationFrame: number;
    const duration = 2000; // 2 seconds

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        const nextCount = Math.min(Math.floor((progress / duration) * numTarget), numTarget);
        setCount(nextCount);
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(numTarget);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, isString]);

  if (isString) {
    return <span>{target}{suffix}</span>;
  }
  return <span>{count}{suffix}</span>;
};

const benefits = [
  "Affordable Pricing",
  "Quality Assurance",
  "On-Time Delivery",
  "Transparent Communication",
  "Long-Term Partnership",
];

export function Stats() {
  const [isInView, setIsInView] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(collection(db, "stats"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (data.length > 0) {
          setStats(data);
        } else {
          // Fallback static data if empty
          setStats([
            { id: '1', target: 50, suffix: '+', label: 'Projects Completed' },
            { id: '2', target: 30, suffix: '+', label: 'Happy Clients' },
            { id: '3', target: 99, suffix: '%', label: 'Client Satisfaction' },
            { id: '4', target: '24/7', suffix: '', label: 'Technical Support', isString: true }
          ]);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-24 bg-primary-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary-400 font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6">
              Your Trusted Partner for Digital Innovation
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              We don't just build software; we build partnerships. Our commitment to excellence, transparent communication, and timely delivery sets us apart as a premium IT service provider.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-accent-400 shrink-0" />
                  <span className="text-lg text-gray-200">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            onViewportEnter={() => setIsInView(true)}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {stats.map((stat, index) => {
              const isEven = index % 2 === 1;
              const textColorClass = index % 2 === 0 ? "text-secondary-400" : "text-accent-400";
              const translateYClass = isEven ? "sm:translate-y-8" : "";
              
              return (
                <div key={stat.id} className={`glass rounded-2xl p-6 sm:p-8 border border-white/10 text-center hover:bg-white/5 transition-colors ${translateYClass}`}>
                  <div className={`text-4xl md:text-5xl font-bold mb-2 ${textColorClass}`}>
                    {isInView ? <Counter target={stat.target} suffix={stat.suffix} isString={stat.isString} /> : "0"}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
