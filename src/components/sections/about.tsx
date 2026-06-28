"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Users, Lightbulb, HeadphonesIcon } from "lucide-react";

const highlights = [
  { icon: Users, text: "Direct Founder Contact" },
  { icon: Lightbulb, text: "Transparent Pricing" },
  { icon: CheckCircle2, text: "Fast Turnaround" },
  { icon: HeadphonesIcon, text: "Dedicated Local Support" },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50 dark:bg-primary-950/30 transform skew-x-12 translate-x-20 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Side - Team Photo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
              <Image
                src="/team.png"
                alt="Digital Yatra team in Banepa, Nepal"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Subtle gradient overlay for badge readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Est 2024 Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 sm:bottom-6 sm:left-6 sm:right-6 sm:p-6 rounded-xl bg-white/90 dark:bg-primary-950/90 backdrop-blur-sm shadow-2xl z-10 border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 sm:gap-4 text-left">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-secondary-500 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
                    2024
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">Est. 2024</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Newly Launched &amp; Ready to Deliver</p>
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
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Who We Are</span>
              <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
                Sincere IT Solutions for Startups &amp; Small Businesses
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Digital Yatra is a Nepal-based IT agency focused on building reliable web apps, custom software, and digital branding. We cut out the unnecessary layers of account managers, giving you direct founder-level communication. We focus on transparent pricing, clean code, and fast turnaround so you can launch and scale without headaches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-white/5 border border-primary-100 dark:border-white/10 hover:border-secondary-500 dark:hover:border-secondary-500 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-secondary-500 shrink-0" aria-hidden="true" />
                    <span className="font-medium text-foreground">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4">
              <a href="#contact" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-primary-900 dark:border-white text-primary-900 dark:text-white hover:bg-primary-900 hover:text-white dark:hover:bg-white dark:hover:text-primary-900 font-semibold rounded-full transition-all">
                Work With Us
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
