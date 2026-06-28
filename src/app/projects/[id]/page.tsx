"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Target, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!params.id) return;
        const docRef = doc(db, "projects", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Project not found.");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{error || "Project not found"}</h1>
        <Link href="/#projects" className="text-blue-600 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-32 pb-24">
      {/* Hero / Header */}
      <div className="container mx-auto px-4 max-w-5xl mb-16">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium text-sm mb-4">
              {project.category || "Case Study"}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white">
              {project.title}
            </h1>
          </div>
          {project.link && (
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all shrink-0"
            >
              Live Project <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {project.thumbnailUrl && (
          <div className="w-full h-[40vh] md:h-[70vh] relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Case Study Content */}
      <div className="container mx-auto px-4 max-w-4xl space-y-16">
        
        {/* Overview */}
        <section>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Overview</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </section>

        {/* Dynamic Case Study Sections (If provided from Admin) */}
        {(project.problem || project.solution || project.results) && (
          <div className="grid grid-cols-1 gap-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            
            {project.problem && (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">The Challenge</h3>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {project.problem}
                </p>
              </div>
            )}

            {project.solution && (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Our Solution</h3>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {project.solution}
                </p>
              </div>
            )}

            {project.results && (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">The Results</h3>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {project.results}
                </p>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}
