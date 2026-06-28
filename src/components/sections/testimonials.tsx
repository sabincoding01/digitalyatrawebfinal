"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, "testimonials"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTestimonials(data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-primary-950/20 flex justify-center">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50 dark:bg-primary-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            What Our Clients Say
          </h2>
          <p className="text-lg text-foreground/70 mb-6">
            Don't just take our word for it. Here is what some of our satisfied clients have to say about working with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary-100 dark:text-white/5" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-foreground/80 mb-8 relative z-10 italic">
                "{testimonial.message || testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-900 text-white flex items-center justify-center font-bold text-lg">
                  {testimonial.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{testimonial.name}</h3>
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
