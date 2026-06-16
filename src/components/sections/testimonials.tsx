"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Saroj Timalsina",
    role: "CEO, TechNova",
    text: "Digital Yatra transformed our online presence with a stunning website and exceptional support. Their technical expertise is unmatched.",
    rating: 5,
  },
  {
    name: "Sabina Timalsina",
    role: "Marketing Director",
    text: "Their team exceeded our expectations. Highly recommended for any digital project. The attention to detail in UI/UX was fantastic.",
    rating: 5,
  },
  {
    name: "Nirjal Bajagain",
    role: "Business Owner",
    text: "Professional, responsive, and creative. Working with Digital Yatra was an excellent experience from start to finish.",
    rating: 5,
  },
  {
    name: "Sushil Banjara",
    role: "Startup Founder",
    text: "Outstanding service and impressive attention to detail throughout the project. They delivered exactly what we needed on time.",
    rating: 5,
  },
  {
    name: "Nabin Neupane",
    role: "E-commerce Manager",
    text: "The web application they built for us has significantly increased our sales and improved our customer engagement.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-primary-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            What Our Clients Say
          </h2>
          <p className="text-lg text-foreground/70">
            Don't just take our word for it. Here is what some of our satisfied clients have to say about working with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary-100 dark:text-white/5" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-foreground/80 mb-8 relative z-10 italic">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-900 text-white flex items-center justify-center font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
