"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Code, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discovery",
    desc: "Understanding client requirements, goals, and target audience.",
  },
  {
    number: "02",
    icon: PenTool,
    title: "Planning",
    desc: "Creating strategies, wireframes, and detailed project roadmaps.",
  },
  {
    number: "03",
    icon: Code,
    title: "Development",
    desc: "Designing and building high-quality, scalable digital solutions.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Launch & Support",
    desc: "Deployment, maintenance, and continuous performance improvement.",
  },
];

export function Process() {
  return (
    <section id="process" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">How We Work</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            Our Working Process
          </h2>
          <p className="text-lg text-foreground/70">
            A proven, systematic approach to delivering high-quality digital solutions on time and within budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-white/10 -translate-y-1/2 z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white dark:bg-primary-950 border-4 border-gray-50 dark:border-primary-900 shadow-xl flex items-center justify-center mb-6 relative group">
                  <div className="absolute inset-0 rounded-full bg-secondary-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Icon className="w-8 h-8 text-secondary-500" />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center text-sm font-bold border-2 border-white dark:border-primary-950">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-foreground/70">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
