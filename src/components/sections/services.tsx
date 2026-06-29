"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  Code,
  Smartphone,
  Monitor,
  Megaphone,
  PenTool,
  Lightbulb,
  Globe,
  Database,
  Cpu,
  Server,
  Settings,
  LineChart,
  Cloud,
  Search,
  Share2,
  Code2,
  MonitorSmartphone,
  Eye,
  Shield,
  Layers,
  HelpCircle
} from "lucide-react";

const IconMap: Record<string, React.ComponentType<any>> = {
  Code,
  Smartphone,
  Monitor,
  Megaphone,
  PenTool,
  Lightbulb,
  Globe,
  Database,
  Cpu,
  Server,
  Settings,
  LineChart,
  Cloud,
  Search,
  Share2,
  Code2,
  MonitorSmartphone,
  Eye,
  Shield,
  Layers,
  HelpCircle
};

export function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(collection(db, "services"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-24 bg-gray-50 dark:bg-primary-950/20 flex justify-center">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (services.length === 0) return null;

  return (
    <section id="services" className="py-24 bg-gray-50 dark:bg-primary-950/20 scroll-mt-header">
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
            // @ts-ignore
            const Icon = IconMap[service.icon] || IconMap.Monitor;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-primary-950 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
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
