"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section id="courses" className="py-24 bg-white dark:bg-background flex justify-center">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (courses.length === 0) return null;

  return (
    <section id="courses" className="py-24 bg-white dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Learn With Us</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            Featured Courses
          </h2>
          <p className="text-lg text-foreground/70">
            Upskill yourself with our industry-leading courses designed by experts to help you master the digital world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-primary-950/40 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {course.thumbnailUrl ? (
                <div className="h-48 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.thumbnailUrl} alt={course.title} width={600} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary-900 to-primary-600 relative flex justify-center items-center overflow-hidden">
                  <BookOpen className="w-20 h-20 text-white/20" />
                </div>
              )}
              
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-foreground mb-3">{course.title}</h3>
                <p className="text-foreground/70 mb-6 flex-grow line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-foreground/60 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-secondary-500" />
                    <span>{course.duration || "4 Weeks"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-secondary-500" />
                    <span>{course.level || "Beginner"}</span>
                  </div>
                </div>
                
                <Link href={`/courses/${course.id}`} className="w-full py-3 bg-white dark:bg-primary-900 border border-gray-200 dark:border-white/10 hover:border-secondary-500 dark:hover:border-secondary-500 text-foreground font-medium rounded-xl flex items-center justify-center gap-2 transition-colors group">
                  Learn More
                  <ArrowRight className="w-4 h-4 text-secondary-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
