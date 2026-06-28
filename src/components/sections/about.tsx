"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Users, Lightbulb, HeadphonesIcon } from "lucide-react";

const highlights = [
  { icon: Users, text: "Experienced Professionals" },
  { icon: Lightbulb, text: "Innovative Solutions" },
  { icon: CheckCircle2, text: "Client-Centric Approach" },
  { icon: HeadphonesIcon, text: "Reliable Technical Support" },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50 dark:bg-primary-950/30 transform skew-x-12 translate-x-20 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image/Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl bg-gray-100 dark:bg-gray-800">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                alt="Digital Yatra Team" 
                className="w-full h-full object-cover"
              />
              
              {/* 10+ Years Experience Block */}
              <div className="absolute bottom-4 left-4 right-4 p-4 sm:bottom-6 sm:left-6 sm:right-6 sm:p-6 rounded-xl bg-white dark:bg-primary-950 shadow-2xl z-10 border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-secondary-500 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0">
                    10+
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">Years Experience</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">In Digital Transformation</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Who We Are</span>
              <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
                Transforming Ideas into Digital Reality
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Digital Yatra is a forward-thinking IT company dedicated to helping businesses establish a strong digital presence. We combine creativity, technology, and strategy to deliver high-quality digital solutions that drive measurable results and long-term growth.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-white/5 border border-primary-100 dark:border-white/10 hover:border-secondary-500 dark:hover:border-secondary-500 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-secondary-500 shrink-0" />
                    <span className="font-medium text-foreground">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="pt-4">
              <a href="#contact" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-primary-900 dark:border-white text-primary-900 dark:text-white hover:bg-primary-900 hover:text-white dark:hover:bg-white dark:hover:text-primary-900 font-semibold rounded-full transition-all">
                Learn More About Us
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
