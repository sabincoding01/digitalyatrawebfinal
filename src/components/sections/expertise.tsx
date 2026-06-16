"use client";

import { motion } from "framer-motion";
import { Code2, Smartphone, MonitorSmartphone, Search, Share2, PenTool, Cloud, LineChart } from "lucide-react";

const expertiseAreas = [
  { icon: Code2, title: "Web Development", desc: "React, Next.js, Node.js" },
  { icon: Smartphone, title: "Mobile Applications", desc: "React Native, Flutter, iOS, Android" },
  { icon: MonitorSmartphone, title: "UI/UX Design", desc: "Figma, Adobe XD, Prototyping" },
  { icon: Search, title: "Search Engine Optimization", desc: "On-page, Off-page, Technical SEO" },
  { icon: Share2, title: "Digital Marketing", desc: "Social Media, PPC, Content Strategy" },
  { icon: PenTool, title: "Graphic Design", desc: "Branding, Illustrations, UI Assets" },
  { icon: Cloud, title: "Cloud Solutions", desc: "AWS, Google Cloud, Azure" },
  { icon: LineChart, title: "IT Consulting", desc: "Strategy, Architecture, Scaling" },
];

export function Expertise() {
  return (
    <section id="expertise" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Our Technologies</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            Our Area of Expertise
          </h2>
          <p className="text-lg text-foreground/70">
            We leverage the latest technologies and industry best practices to build robust, scalable, and secure digital solutions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {expertiseAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group p-6 rounded-2xl bg-gray-50 dark:bg-primary-950/40 border border-gray-200 dark:border-white/5 flex flex-col items-center text-center hover:bg-white dark:hover:bg-primary-900 hover:shadow-xl hover:border-secondary-500/30 transition-all cursor-default"
              >
                <div className="w-16 h-16 rounded-full bg-white dark:bg-primary-900 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-secondary-500 transition-colors">{area.title}</h3>
                <p className="text-sm text-foreground/60">{area.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
