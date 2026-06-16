"use client";

import { motion } from "framer-motion";
import { Monitor, Smartphone, LayoutTemplate, Megaphone, Palette, Server } from "lucide-react";

const services = [
  {
    icon: Monitor,
    title: "Web Development",
    description: "Custom websites, business websites, e-commerce platforms, and web applications built with cutting-edge technologies.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Scalable and intuitive Android and iOS applications that provide seamless user experiences across devices.",
  },
  {
    icon: LayoutTemplate,
    title: "UI/UX Design",
    description: "User-centered interfaces focused on usability, accessibility, and high engagement to delight your customers.",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Data-driven SEO, social media marketing, and paid advertising solutions to boost your online visibility.",
  },
  {
    icon: Palette,
    title: "Graphic Design & Branding",
    description: "Memorable logo design, brand identity, marketing creatives, and promotional materials that stand out.",
  },
  {
    icon: Server,
    title: "IT Consulting",
    description: "Strategic technology guidance and digital transformation planning to optimize your business operations.",
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-gray-50 dark:bg-primary-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">What We Do</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            Our Premium Services
          </h2>
          <p className="text-lg text-foreground/70">
            We offer a comprehensive suite of digital services designed to help your business thrive in the modern technological landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white dark:bg-primary-950 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Hover Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-white/5 text-secondary-500 flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-accent-400 transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-foreground/70 group-hover:text-white/80 transition-colors leading-relaxed">
                    {service.description}
                  </p>
                </div>
                
                {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary-500/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors z-0" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
