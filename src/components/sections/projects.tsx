"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { ExternalLink, Code, ArrowRight } from "lucide-react";
import Link from "next/link";

const defaultProjects = [
  {
    id: "default-1",
    title: "E-Commerce Web Portal",
    category: "Web Application",
    description: "Problem: Client needed a fast shop to sell handicraft items. Solution: Developed a Next.js shop with 0.8s load time and direct checkout.",
    techStack: "Next.js, Tailwind CSS, Stripe",
    thumbnailUrl: ""
  },
  {
    id: "default-2",
    title: "SaaS Analytics Dashboard",
    category: "Software Development",
    description: "Problem: Needed to visualize high-frequency IoT data. Solution: Built a real-time responsive dashboard with chart indicators.",
    techStack: "React, Node.js, Chart.js",
    thumbnailUrl: ""
  },
  {
    id: "default-3",
    title: "Local Business Delivery App",
    category: "Mobile Application",
    description: "Problem: Restaurant wanted to cut out commission layers. Solution: Created a lightweight mobile app with order dispatch.",
    techStack: "React Native, Firebase, Maps API",
    thumbnailUrl: ""
  }
];

export function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length > 0) {
          setProjects(data);
        } else {
          setProjects(defaultProjects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects(defaultProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section id="projects" className="py-24 bg-gray-50 dark:bg-primary-950/20 flex justify-center">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 bg-gray-50 dark:bg-primary-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary-500 font-semibold tracking-wider uppercase text-sm">Portfolio</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground">
            Our Latest Projects
          </h2>
          <p className="text-lg text-foreground/70">
            Take a look at some of the recent digital solutions we've crafted for our amazing clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl bg-white dark:bg-primary-950 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="h-56 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                {project.thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={project.thumbnailUrl} alt={project.title} width={600} height={400} className="w-full h-full object-cover" />
                ) : (
                  <Code className="w-24 h-24 text-zinc-300 dark:text-zinc-700" aria-hidden="true" />
                )}
                
                <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/60 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary-500 rounded-full text-white hover:scale-110 transition-transform" aria-label={`View live site for ${project.title}`}>
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="p-6 sm:p-8 flex-grow flex flex-col">
                {project.category && (
                  <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">{project.category}</span>
                )}
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {project.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed flex-grow text-sm">
                  {project.description}
                </p>
                
                {project.techStack && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {project.techStack.split(",").map((tech: string) => (
                      <span key={tech} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-primary-900 rounded text-foreground/75 font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                {project.id.startsWith("default-") ? (
                  <a href="#contact" className="mt-6 inline-flex items-center gap-2 text-secondary-500 font-semibold text-sm group/link">
                    Inquire About Service <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
                  </a>
                ) : (
                  <Link href={`/projects/${project.id}`} className="mt-6 inline-flex items-center gap-2 text-secondary-500 font-semibold text-sm group/link">
                    Read Case Study <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
