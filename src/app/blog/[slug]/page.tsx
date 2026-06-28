"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!params.slug) return;
        const docRef = doc(db, "blogs", params.slug as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{error || "Post not found"}</h1>
        <Link href="/blog" className="text-blue-600 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-32 pb-24">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>

        {post.coverImage && (
          <div className="w-full h-[40vh] md:h-[60vh] relative rounded-3xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-zinc-500 font-medium">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <span>{post.author}</span>
              </div>
            )}
            {post.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(post.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </header>

        <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 prose-headings:text-zinc-900 dark:prose-headings:text-white prose-a:text-blue-600 hover:prose-a:text-blue-500">
          {/* We are using dangerouslySetInnerHTML here if the content is rich text (HTML), or just standard whitespace-pre-wrap if it's plain text. 
              Given the admin panel will likely save simple text or raw html, we handle plain text gracefully. */}
          {post.content.includes('<') ? (
             <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <div className="whitespace-pre-wrap">{post.content}</div>
          )}
        </div>
      </article>
    </main>
  );
}
