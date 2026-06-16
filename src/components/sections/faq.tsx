"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does a website project take?",
    answer: "Most projects take between 2–6 weeks depending on complexity. A simple business website might take 2 weeks, while a complex e-commerce platform could take up to 6 weeks or more.",
  },
  {
    question: "Do you provide ongoing support?",
    answer: "Yes, we offer comprehensive maintenance and support services to ensure your digital solutions remain up-to-date, secure, and perform optimally.",
  },
  {
    question: "Can you redesign existing websites?",
    answer: "Absolutely. We can modernize and improve existing websites, enhancing their UI/UX design, performance, and SEO capabilities.",
  },
  {
    question: "Do you provide SEO services?",
    answer: "Yes, we offer complete SEO and digital marketing solutions tailored to improve your search rankings and drive targeted traffic to your site.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-gray-50 dark:bg-primary-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="sticky top-28"
          >
            <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Got Questions?</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-foreground/70 mb-8">
              Find answers to common questions about our services, process, and how we can help your business grow digitally.
            </p>
            <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 bg-primary-900 text-white rounded-full hover:bg-primary-800 transition-colors">
              Still have questions? Contact us
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className={`border rounded-2xl overflow-hidden transition-colors ${
                    isOpen 
                      ? "bg-white dark:bg-primary-900 border-secondary-500/50 dark:border-secondary-500/50 shadow-md" 
                      : "bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex items-center justify-between w-full p-6 text-left"
                  >
                    <span className="font-bold text-lg text-foreground pr-8">{faq.question}</span>
                    <ChevronDown 
                      className={`w-6 h-6 text-secondary-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-foreground/70 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
