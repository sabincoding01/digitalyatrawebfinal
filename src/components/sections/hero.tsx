"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code, Smartphone, Layout, Rocket } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-primary-950 text-white">
      {/* Background gradients and elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-medium text-accent-400">
              <Rocket className="w-4 h-4" />
              <span>Transforming Ideas into Digital Success</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-secondary-600">
                Businesses
              </span>{" "}
              Through Technology
            </h1>
            
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Digital Yatra delivers innovative web solutions, software development, digital marketing, branding, and IT consulting services that help businesses grow in the digital era.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="px-8 py-4 rounded-full bg-secondary-500 hover:bg-secondary-600 text-white font-medium flex items-center gap-2 transition-all hover:gap-4 hover:shadow-[0_0_20px_rgba(247,148,29,0.4)]"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#services"
                className="px-8 py-4 rounded-full glass hover:bg-white/10 text-white font-medium transition-colors"
              >
                Our Services
              </a>
            </div>
          </motion.div>

          {/* Hero Visual/Illustration using Framer Motion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-full glass-dark border border-white/10 flex items-center justify-center">
              {/* Central Core */}
              <motion.div
                animate={{ 
                  boxShadow: ["0 0 20px rgba(0,229,255,0.2)", "0 0 60px rgba(0,229,255,0.6)", "0 0 20px rgba(0,229,255,0.2)"] 
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center relative z-20"
              >
                <Code className="w-12 h-12 text-primary-950" />
              </motion.div>

              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-white/5 rounded-full"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl glass flex items-center justify-center border border-white/10 text-secondary-400">
                  <Layout className="w-8 h-8" />
                </div>
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-2rem] border border-white/5 rounded-full"
              >
                <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-16 h-16 rounded-2xl glass flex items-center justify-center border border-white/10 text-accent-400">
                  <Smartphone className="w-8 h-8" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
