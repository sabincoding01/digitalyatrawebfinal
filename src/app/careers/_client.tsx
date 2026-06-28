"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CareersClient() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, "careers"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs.");
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-32 pb-24">
      <div className="relative py-20 px-4 overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4" /> We are hiring
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Join the team at{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Digital Yatra
            </span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Help us build the next generation of digital products, services, and educational platforms.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-16">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Open Positions</h2>
          <p className="text-zinc-500">{jobs.length} open {jobs.length === 1 ? "role" : "roles"}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <Briefcase className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No open positions right now</h3>
            <p className="text-zinc-500">Check back later or send us your resume to keep on file.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md"
              >
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.type || "Full-time"}</span>
                    {job.department && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md font-medium text-zinc-700 dark:text-zinc-300">
                        {job.department}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={job.applyLink || "mailto:digitalyatra.tech@gmail.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all group-hover:scale-105"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
