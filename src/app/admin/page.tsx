"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, CheckCircle, Clock, AlertCircle, Plus, X, Image as ImageIcon, Loader2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ADMIN_PIN = "5993";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [activeTab, setActiveTab] = useState("testimonials");
  const [data, setData] = useState<any>({
    testimonials: [],
    services: [],
    courses: [],
    projects: [],
    stats: [],
    blogs: [],
    careers: [],
    subscribers: [],
    courseLeads: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const collections = ["testimonials", "services", "courses", "projects", "stats", "blogs", "careers", "subscribers", "courseLeads"];
      const unsubscribes = collections.map(colName => {
        const q = query(collection(db, colName));
        return onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (colName === "stats") {
            docs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          } else {
            docs.sort((a: any, b: any) => {
              const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.subscribedAt?.toMillis ? a.subscribedAt.toMillis() : 0);
              const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.subscribedAt?.toMillis ? b.subscribedAt.toMillis() : 0);
              return bTime - aTime;
            });
          }
          setData((prev: any) => ({ ...prev, [colName]: docs }));
          setLoading(false);
        }, (err) => {
          console.error(`Error in ${colName}:`, err);
          setError("Failed to fetch some data.");
          setLoading(false);
        });
      });

      return () => unsubscribes.forEach(unsub => unsub());
    } catch (err) {
      console.error(err);
      setError("Failed to initialize Firebase queries.");
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      toast.success("Authentication successful");
    } else {
      setPinError("Invalid PIN code");
      toast.error("Invalid PIN code");
      setPinInput("");
    }
  };

  const handleDelete = async (colName: string, id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, colName, id));
      toast.success("Item deleted successfully");
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Failed to delete item");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "approved" ? "pending" : "approved";
      await updateDoc(doc(db, "testimonials", id), {
        status: newStatus
      });
      toast.success(`Testimonial marked as ${newStatus}`);
    } catch (err) {
      console.error("Error updating:", err);
      toast.error("Failed to update status");
    }
  };

  const openModal = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        createdAt: new Date(),
      };

      if (activeTab === "stats" && !payload.order) {
        payload.order = data.stats.length;
      }

      await addDoc(collection(db, activeTab), payload);
      toast.success(`${activeTab.slice(0, -1)} added successfully!`);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error submitting:", err);
      setError(err.message || "Failed to add entry.");
      toast.error("Failed to add entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8"
        >
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Access</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">Enter your 4-digit PIN to continue</p>
            </div>
          </div>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                className="w-full px-4 py-4 text-center text-3xl tracking-[1em] font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="••••"
                required
              />
              {pinError && <p className="text-red-500 text-sm mt-2 text-center">{pinError}</p>}
            </div>
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "testimonials", label: "Testimonials" },
    { id: "projects", label: "Projects" },
    { id: "blogs", label: "Blogs" },
    { id: "careers", label: "Careers" },
    { id: "services", label: "Services" },
    { id: "courses", label: "Courses" },
    { id: "stats", label: "Stats" },
    { id: "subscribers", label: "Newsletter Leads" },
    { id: "courseLeads", label: "Syllabus Leads" }
  ];

  const readOnlyTabs = ["testimonials", "subscribers", "courseLeads"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-zinc-500 mt-1">Manage your website's dynamic content and leads.</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Lock Dashboard
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-blue-600 text-white" 
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-semibold text-lg capitalize">{tabs.find(t => t.id === activeTab)?.label}</h2>
            {!readOnlyTabs.includes(activeTab) && (
              <button 
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Entry
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">Media/Icon</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">Content/Extra</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data[activeTab]?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  data[activeTab]?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                      <td className="px-6 py-4 align-top w-24">
                        {item.thumbnailUrl || item.coverImage ? (
                          <div className="w-16 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.thumbnailUrl || item.coverImage} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-zinc-900 dark:text-white">
                          {item.title || item.name || item.label || item.email || "Untitled"}
                        </div>
                        <div className="text-sm text-zinc-500 mt-1">
                          {activeTab === "subscribers" && item.subscribedAt ? new Date(item.subscribedAt.toDate()).toLocaleDateString() : null}
                          {activeTab === "courseLeads" && item.courseTitle ? `Course: ${item.courseTitle}` : null}
                          {activeTab === "careers" && `${item.location} • ${item.type}`}
                          {activeTab === "blogs" && `By ${item.author}`}
                          {item.role || item.duration || item.category || (item.target ? `Target: ${item.target}${item.suffix || ''}` : "")}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top max-w-md">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3">
                          {item.description || item.message || item.text || item.excerpt || (item.content ? "Rich Text Content" : null) || "No extra description"}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-right space-x-2 flex justify-end">
                        {activeTab === "testimonials" && (
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            {item.status === 'approved' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(activeTab, item.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
                <h3 className="text-xl font-bold capitalize">Add New {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <form id="add-form" onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Common Title */}
                  {["courses", "projects", "services", "blogs", "careers"].includes(activeTab) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ""}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Common Description */}
                  {["courses", "projects", "services"].includes(activeTab) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description || ""}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                      />
                    </div>
                  )}

                  {/* Common Image Upload for Courses and Projects */}
                  {(activeTab === "courses" || activeTab === "projects") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Image URL</label>
                      <input
                        type="url"
                        value={formData.thumbnailUrl || ""}
                        onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {/* -- BLOG FIELDS -- */}
                  {activeTab === "blogs" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cover Image URL</label>
                        <input
                          type="url"
                          value={formData.coverImage || ""}
                          onChange={e => setFormData({...formData, coverImage: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Author</label>
                          <input
                            type="text"
                            required
                            value={formData.author || ""}
                            onChange={e => setFormData({...formData, author: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Excerpt</label>
                          <input
                            type="text"
                            required
                            value={formData.excerpt || ""}
                            onChange={e => setFormData({...formData, excerpt: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="Short summary for the card"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Content (HTML or Plain text)</label>
                        <textarea
                          required
                          rows={6}
                          value={formData.content || ""}
                          onChange={e => setFormData({...formData, content: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-mono text-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* -- CAREERS FIELDS -- */}
                  {activeTab === "careers" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
                          <input
                            type="text"
                            value={formData.location || ""}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="e.g. Kathmandu, Remote"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                          <select
                            value={formData.type || "Full-time"}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Department</label>
                        <input
                          type="text"
                          value={formData.department || ""}
                          onChange={e => setFormData({...formData, department: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          placeholder="e.g. Engineering, Marketing"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Apply Link (Optional)</label>
                        <input
                          type="url"
                          value={formData.applyLink || ""}
                          onChange={e => setFormData({...formData, applyLink: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          placeholder="mailto: or Google Form link"
                        />
                      </div>
                    </>
                  )}

                  {/* -- PROJECT SPECIFIC -- */}
                  {activeTab === "projects" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                          <input
                            type="text"
                            value={formData.category || ""}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Live Link</label>
                          <input
                            type="url"
                            value={formData.link || ""}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <h4 className="font-semibold text-zinc-900 dark:text-white">Case Study Details</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">The Problem</label>
                          <textarea
                            rows={3}
                            value={formData.problem || ""}
                            onChange={e => setFormData({...formData, problem: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">The Solution</label>
                          <textarea
                            rows={3}
                            value={formData.solution || ""}
                            onChange={e => setFormData({...formData, solution: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">The Results</label>
                          <textarea
                            rows={3}
                            value={formData.results || ""}
                            onChange={e => setFormData({...formData, results: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* -- COURSES -- */}
                  {activeTab === "courses" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration</label>
                        <input
                          type="text"
                          required
                          value={formData.duration || ""}
                          onChange={e => setFormData({...formData, duration: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Level</label>
                        <select
                          required
                          value={formData.level || ""}
                          onChange={e => setFormData({...formData, level: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                          <option value="">Select Level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* -- SERVICES -- */}
                  {activeTab === "services" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Icon Name (Lucide)</label>
                      <input
                        type="text"
                        required
                        value={formData.icon || ""}
                        onChange={e => setFormData({...formData, icon: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>
                  )}

                  {/* -- STATS -- */}
                  {activeTab === "stats" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Label (e.g. Happy Clients)</label>
                        <input
                          type="text"
                          required
                          value={formData.label || ""}
                          onChange={e => setFormData({...formData, label: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Number</label>
                          <input
                            type="text"
                            required
                            value={formData.target || ""}
                            onChange={e => setFormData({...formData, target: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Suffix (Optional)</label>
                          <input
                            type="text"
                            value={formData.suffix || ""}
                            onChange={e => setFormData({...formData, suffix: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-form"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
