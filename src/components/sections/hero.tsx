"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Monitor, Code, Megaphone, PenTool, Lightbulb, BarChart3, Fingerprint, BookOpen, Smartphone } from "lucide-react";

export function Hero() {
  const floatingCards = [
    { title: "Web Development", icon: Monitor, color: "text-accent-500", delay: 0 },
    { title: "Software Dev", icon: Code, color: "text-secondary-400", delay: 0.2 },
    { title: "App Development", icon: Smartphone, color: "text-blue-400", delay: 0.3 },
    { title: "Digital Marketing", icon: Megaphone, color: "text-pink-400", delay: 0.4 },
    { title: "Branding", icon: PenTool, color: "text-purple-400", delay: 0.6 },
    { title: "IT Courses", icon: BookOpen, color: "text-orange-400", delay: 0.7 },
    { title: "IT Consulting", icon: Lightbulb, color: "text-emerald-400", delay: 0.8 },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-gradient-to-b from-primary-950 via-[#030914] to-black text-white">
      {/* Abstract Glowing Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-500/10 blur-[150px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent-500/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-5 sm:space-y-6 max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
          >
            {/* Pill badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-xs font-medium text-accent-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
            >
              <Fingerprint className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Nepal-Based IT Agency · Fast Turnaround · Transparent Pricing</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight text-white">
              Your Digital Partner<br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 via-secondary-500 to-orange-600">
                {" "}Built in Nepal, Ready for the World
              </span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-light">
              We're a Banepa-based IT agency building websites, apps, and digital strategies for startups and small businesses. Direct founder-level communication. No layers, no fluff — just results delivered on time.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center lg:justify-start">
              <a
                href="#contact"
                className="px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 hover:to-orange-600 text-white font-medium flex items-center justify-center gap-2 transition-all hover:gap-3 hover:shadow-[0_0_25px_rgba(247,148,29,0.5)] shadow-lg text-sm sm:text-base"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#projects"
                className="px-6 py-3 sm:py-3.5 rounded-xl glass hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-white/20 text-sm sm:text-base"
              >
                <Play className="w-4 h-4 fill-white/20" aria-hidden="true" />
                View Our Work
              </a>
            </div>

            {/* Trust Indicators — replaced avatars with verified stat badges */}
            <div className="pt-4 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-medium text-gray-200">Founded 2024 · Banepa, Nepal</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-secondary-400 shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-medium text-gray-200">Affordable &amp; Transparent Pricing</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column — Mobile: clean grid, Desktop: 3D floating cards */}
          
          {/* Mobile service grid */}
          <div className="lg:hidden grid grid-cols-2 gap-2.5 sm:gap-3 mt-2">
            {floatingCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: card.delay }}
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl glass-dark border border-white/10 backdrop-blur-xl"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.color}`} aria-hidden="true" />
                  </div>
                  <span className="font-medium text-[11px] sm:text-xs text-gray-200 tracking-wide">{card.title}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop 3D illustration */}
          <div className="relative h-[500px] lg:h-[700px] w-full hidden lg:flex items-center justify-center perspective-1000">
            {/* Central Glowing Core */}
            <motion.div
              animate={{ 
                boxShadow: ["0 0 40px rgba(0,229,255,0.2)", "0 0 100px rgba(0,229,255,0.4)", "0 0 40px rgba(0,229,255,0.2)"] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-primary-900 to-black glass-dark border border-white/10 flex items-center justify-center z-20 shadow-2xl"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-600/20 to-secondary-500/20 flex items-center justify-center blur-sm absolute inset-auto" />
              <Code className="w-10 h-10 text-accent-400 relative z-10" aria-hidden="true" />
            </motion.div>

            {/* Orbiting Rings */}
            <div
              style={{ transform: "rotateX(60deg)" }}
              className="absolute w-[400px] h-[400px] rounded-full border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] z-10 animate-spin-slow"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <PenTool className="w-4 h-4 text-secondary-400" aria-hidden="true" />
              </div>
            </div>
            
            <div
              style={{ transform: "rotateX(70deg)" }}
              className="absolute w-[550px] h-[550px] rounded-full border border-white/5 z-0 animate-spin-reverse-slow"
            >
              <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <BarChart3 className="w-4 h-4 text-blue-400" aria-hidden="true" />
              </div>
            </div>

            {/* Floating UI Cards */}
            {floatingCards.map((card, index) => {
              const Icon = card.icon;
              const positions = [
                { top: "5%", left: "15%" },
                { top: "20%", right: "5%" },
                { bottom: "25%", left: "5%" },
                { bottom: "10%", right: "15%" },
                { top: "0%", right: "30%" },
                { top: "45%", left: "-2%" },
                { bottom: "35%", right: "-2%" },
              ];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: card.delay }}
                  className="absolute z-30 flex items-center gap-3 p-2.5 pr-4 rounded-xl glass-dark border border-white/10 shadow-xl hover:bg-white/5 hover:border-white/20 transition-colors cursor-default backdrop-blur-xl animate-float-slow"
                  style={{
                    ...positions[index],
                    animationDelay: `${index * 0.4}s`
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shadow-inner shrink-0">
                    <Icon className={`w-4 h-4 ${card.color}`} aria-hidden="true" />
                  </div>
                  <span className="font-medium text-xs text-gray-200 tracking-wide whitespace-nowrap">{card.title}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
