"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Glowing Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] rounded-full bg-secondary-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl w-full text-center space-y-8"
      >
        <div className="relative">
          <h1 className="text-[150px] sm:text-[200px] font-extrabold text-white/5 leading-none tracking-tighter select-none">
            404
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full glass-dark flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(247,148,29,0.3)] mb-4">
              <span className="text-4xl text-secondary-500">👀</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Page Not Found</h2>
          </div>
        </div>

        <p className="text-lg text-gray-400 font-light max-w-md mx-auto">
          We looked everywhere, but the page you are trying to find doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2 transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
