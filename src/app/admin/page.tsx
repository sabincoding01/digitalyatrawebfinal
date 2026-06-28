"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  Trash2, CheckCircle, Clock, AlertCircle, Plus, X, Image as ImageIcon,
  Loader2, Lock, Pencil, Save, FileText, ExternalLink, Phone, Mail, User, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ADMIN_PIN = "5993";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [activeTab, setActiveTab] = useState("contacts");
  const [data, setData] = useState<any>({
    testimonials: [],
    services: [],
    courses: [],
    projects: [],
    stats: [],
    blogs: [],
    careers: [],
    subscribers: [],
    courseLeads: [],
    contacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Edit State for Stats
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [editStatData, setEditStatData] = useState<any>({});

  // PDF Upload
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const collections = ["testimonials", "services", "courses", "projects", "stats", "blogs", "careers", "subscribers", "courseLeads", "contacts"];
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
      await updateDoc(doc(db, "testimonials", id), { status: newStatus });
      toast.success(`Testimonial marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleContactStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "read" ? "new" : "read";
      await updateDoc(doc(db, "contacts", id), { status: newStatus });
      toast.success(`Contact marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // --- STAT EDIT ---
  const startEditStat = (stat: any) => {
    setEditingStatId(stat.id);
    setEditStatData({ label: stat.label, target: stat.target, suffix: stat.suffix || "", isString: stat.isString || false });
  };

  const saveEditStat = async (id: string) => {
    try {
      await updateDoc(doc(db, "stats", id), {
        label: editStatData.label,
        target: editStatData.isString ? editStatData.target : Number(editStatData.target),
        suffix: editStatData.suffix,
        isString: editStatData.isString,
      });
      toast.success("Stat updated!");
      setEditingStatId(null);
    } catch (err) {
      toast.error("Failed to update stat");
    }
  };

  // --- PDF UPLOAD ---
  const uploadPdf = async (): Promise<string | null> => {
    if (!pdfFile) return null;
    setPdfUploading(true);
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `syllabi/${Date.now()}_${pdfFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, pdfFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPdfUploadProgress(Math.round(progress));
        },
        (error) => {
          setPdfUploading(false);
          toast.error("PDF upload failed");
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setPdfUploading(false);
          setPdfUploadProgress(0);
          resolve(url);
        }
      );
    });
  };

  const openModal = () => {
    setFormData({});
    setPdfFile(null);
    setPdfUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let payload: any = { ...formData, createdAt: serverTimestamp() };

      if (activeTab === "stats" && !payload.order) {
        payload.order = data.stats.length;
        if (!payload.isString) payload.target = Number(payload.target);
      }

      // Upload PDF if provided
      if (activeTab === "courses" && pdfFile) {
        const pdfUrl = await uploadPdf();
        if (pdfUrl) payload.syllabusUrl = pdfUrl;
      }

      await addDoc(collection(db, activeTab), payload);
      toast.success(`${activeTab.slice(0, -1)} added successfully!`);
      setIsModalOpen(false);
      setPdfFile(null);
    } catch (err: any) {
      console.error("Error submitting:", err);
      setError(err.message || "Failed to add entry.");
      toast.error("Failed to add entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIN SCREEN ---
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
                onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
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
    { id: "contacts", label: "📩 Contacts" },
    { id: "testimonials", label: "Testimonials" },
    { id: "projects", label: "Projects" },
    { id: "blogs", label: "Blogs" },
    { id: "careers", label: "Careers" },
    { id: "services", label: "Services" },
    { id: "courses", label: "Courses" },
    { id: "stats", label: "Stats" },
    { id: "subscribers", label: "Newsletter Leads" },
    { id: "courseLeads", label: "Syllabus Leads" },
  ];

  const readOnlyTabs = ["testimonials", "subscribers", "courseLeads", "contacts"];
  const newContactCount = data.contacts?.filter((c: any) => c.status === "new").length || 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-zinc-500 mt-1 text-sm">Manage your website content and leads.</p>
          </div>
          <div className="flex items-center gap-3">
            {newContactCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm font-medium rounded-full">
                {newContactCount} new contact{newContactCount > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Lock Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Tabs - horizontally scrollable on mobile */}
        <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap relative ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
              {tab.id === "contacts" && newContactCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {newContactCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-semibold text-base sm:text-lg capitalize">
              {tabs.find(t => t.id === activeTab)?.label}
              <span className="ml-2 text-sm text-zinc-400 font-normal">({data[activeTab]?.length || 0})</span>
            </h2>
            {!readOnlyTabs.includes(activeTab) && (
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add New Entry</span><span className="sm:hidden">Add</span>
              </button>
            )}
          </div>

          {/* ===== CONTACTS TAB ===== */}
          {activeTab === "contacts" && (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.contacts?.length === 0 ? (
                <div className="px-6 py-12 text-center text-zinc-500">No contact submissions yet.</div>
              ) : (
                data.contacts?.map((item: any) => (
                  <div key={item.id} className={`p-4 sm:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ${item.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-400" />
                            <span className="font-semibold text-zinc-900 dark:text-white">{item.name}</span>
                          </div>
                          {item.status === 'new' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium rounded-full">New</span>
                          )}
                          <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-full">{item.service}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                          <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <Mail className="w-3.5 h-3.5" />{item.email}
                          </a>
                          <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <Phone className="w-3.5 h-3.5" />{item.phone}
                          </a>
                        </div>
                        {item.message && (
                          <div className="flex items-start gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-400" />
                            <p className="line-clamp-2">{item.message}</p>
                          </div>
                        )}
                        {item.createdAt && (
                          <p className="text-xs text-zinc-400">{new Date(item.createdAt.toDate()).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleContactStatus(item.id, item.status)}
                          title={item.status === 'new' ? 'Mark as Read' : 'Mark as New'}
                          className={`p-2 rounded-lg text-xs font-medium transition-colors border ${item.status === 'new' ? 'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'}`}
                        >
                          {item.status === 'new' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete("contacts", item.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== STATS TAB - with inline editing ===== */}
          {activeTab === "stats" && (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.stats?.length === 0 ? (
                <div className="px-6 py-12 text-center text-zinc-500">No stats. Click "Add" to create one.</div>
              ) : (
                data.stats?.map((item: any) => (
                  <div key={item.id} className="p-4 sm:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    {editingStatId === item.id ? (
                      // Edit Mode
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Label</label>
                            <input
                              type="text"
                              value={editStatData.label}
                              onChange={e => setEditStatData({ ...editStatData, label: e.target.value })}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Target Number</label>
                            <input
                              type="text"
                              value={editStatData.target}
                              onChange={e => setEditStatData({ ...editStatData, target: e.target.value })}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Suffix (e.g. +, %)</label>
                            <input
                              type="text"
                              value={editStatData.suffix}
                              onChange={e => setEditStatData({ ...editStatData, suffix: e.target.value })}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditStat(item.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button
                            onClick={() => setEditingStatId(null)}
                            className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center shrink-0">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-none">{item.target}{item.suffix}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{item.label}</p>
                            <p className="text-sm text-zinc-500">Order: {item.order ?? 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditStat(item)}
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("stats", item.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== ALL OTHER TABS (table view) ===== */}
          {!["contacts", "stats"].includes(activeTab) && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">Media/Icon</th>
                    <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">Details</th>
                    <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hidden md:table-cell">Content/Extra</th>
                    <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {data[activeTab]?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No entries found.</td>
                    </tr>
                  ) : (
                    data[activeTab]?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                        <td className="px-4 sm:px-6 py-4 align-top w-20">
                          {item.thumbnailUrl || item.coverImage ? (
                            <div className="w-14 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.thumbnailUrl || item.coverImage} alt="Thumbnail" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 align-top">
                          <div className="font-medium text-zinc-900 dark:text-white text-sm">
                            {item.title || item.name || item.label || item.email || "Untitled"}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1 space-y-0.5">
                            {activeTab === "subscribers" && item.subscribedAt && <p>{new Date(item.subscribedAt.toDate()).toLocaleDateString()}</p>}
                            {activeTab === "courseLeads" && item.courseTitle && <p>Course: {item.courseTitle}</p>}
                            {activeTab === "courseLeads" && item.phone && <p>📞 {item.phone}</p>}
                            {activeTab === "careers" && <p>{item.location} • {item.type}</p>}
                            {activeTab === "blogs" && <p>By {item.author}</p>}
                            {item.role && <p>{item.role}</p>}
                            {item.duration && <p>{item.duration}</p>}
                            {item.category && <p>{item.category}</p>}
                            {item.target && !item.label && <p>Target: {item.target}{item.suffix || ''}</p>}
                          </div>
                          {/* Syllabus PDF link for courses */}
                          {activeTab === "courses" && item.syllabusUrl && (
                            <a
                              href={item.syllabusUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Syllabus PDF
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 align-top max-w-xs hidden md:table-cell">
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3">
                            {item.description || item.message || item.text || item.excerpt || (item.content ? "Rich Text Content" : null) || "—"}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 align-top whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {activeTab === "testimonials" && (
                              <button
                                onClick={() => handleToggleStatus(item.id, item.status)}
                                title={item.status === 'approved' ? 'Approved' : 'Pending'}
                                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                {item.status === 'approved'
                                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  : <Clock className="w-4 h-4 text-amber-500" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(activeTab, item.id)}
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== ADD NEW ENTRY MODAL ===== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
                <h3 className="text-lg font-bold capitalize">Add New {tabs.find(t => t.id === activeTab)?.label.replace(/📩\s/, '').slice(0, -1)}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-grow">
                <form id="add-form" onSubmit={handleSubmit} className="space-y-4">

                  {/* Common Title */}
                  {["courses", "projects", "services", "blogs", "careers"].includes(activeTab) && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                      <input type="text" required value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                    </div>
                  )}

                  {/* Common Description */}
                  {["courses", "projects", "services"].includes(activeTab) && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                      <textarea required rows={3} value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none text-sm" />
                    </div>
                  )}

                  {/* Image URL for Courses & Projects */}
                  {(activeTab === "courses" || activeTab === "projects") && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Image URL</label>
                      <input type="url" value={formData.thumbnailUrl || ""} onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                        placeholder="https://..." />
                    </div>
                  )}

                  {/* ===== COURSES SPECIFIC ===== */}
                  {activeTab === "courses" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration</label>
                          <input type="text" required value={formData.duration || ""} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                            placeholder="e.g. 3 months" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Level</label>
                          <select required value={formData.level || ""} onChange={e => setFormData({ ...formData, level: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm">
                            <option value="">Select Level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>

                      {/* PDF Syllabus Upload */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" /> Syllabus PDF (Optional)
                        </label>
                        <div
                          onClick={() => pdfInputRef.current?.click()}
                          className="w-full px-4 py-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-colors text-center"
                        >
                          {pdfFile ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                              <FileText className="w-5 h-5" />
                              <span className="truncate max-w-[200px]">{pdfFile.name}</span>
                              <button type="button" onClick={e => { e.stopPropagation(); setPdfFile(null); }} className="text-red-500 hover:text-red-600">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-zinc-500">
                              <FileText className="w-6 h-6 mx-auto mb-1 text-zinc-400" />
                              Click to upload PDF syllabus
                            </div>
                          )}
                        </div>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={e => setPdfFile(e.target.files?.[0] || null)}
                        />
                        {pdfUploading && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-500">
                              <span>Uploading PDF...</span><span>{pdfUploadProgress}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pdfUploadProgress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ===== BLOGS ===== */}
                  {activeTab === "blogs" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cover Image URL</label>
                        <input type="url" value={formData.coverImage || ""} onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Author</label>
                          <input type="text" required value={formData.author || ""} onChange={e => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Excerpt</label>
                          <input type="text" required value={formData.excerpt || ""} onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                            placeholder="Short summary" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Content (HTML or Plain text)</label>
                        <textarea required rows={6} value={formData.content || ""} onChange={e => setFormData({ ...formData, content: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-mono text-sm" />
                      </div>
                    </>
                  )}

                  {/* ===== CAREERS ===== */}
                  {activeTab === "careers" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
                          <input type="text" value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                            placeholder="e.g. Kathmandu, Remote" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                          <select value={formData.type || "Full-time"} onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm">
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Department</label>
                        <input type="text" value={formData.department || ""} onChange={e => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                          placeholder="e.g. Engineering, Marketing" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Apply Link (Optional)</label>
                        <input type="url" value={formData.applyLink || ""} onChange={e => setFormData({ ...formData, applyLink: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                          placeholder="mailto: or Google Form link" />
                      </div>
                    </>
                  )}

                  {/* ===== PROJECTS ===== */}
                  {activeTab === "projects" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                          <input type="text" value={formData.category || ""} onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Live Link</label>
                          <input type="url" value={formData.link || ""} onChange={e => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                        </div>
                      </div>
                      <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Case Study</h4>
                        {["problem", "solution", "results"].map(field => (
                          <div key={field} className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">The {field}</label>
                            <textarea rows={2} value={formData[field] || ""} onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none text-sm" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ===== SERVICES ===== */}
                  {activeTab === "services" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Icon Name (Lucide)</label>
                      <input type="text" required value={formData.icon || ""} onChange={e => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                        placeholder="e.g. Globe, Code, Smartphone" />
                    </div>
                  )}

                  {/* ===== STATS ===== */}
                  {activeTab === "stats" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Label (e.g. Happy Clients)</label>
                        <input type="text" required value={formData.label || ""} onChange={e => setFormData({ ...formData, label: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Number</label>
                          <input type="text" required value={formData.target || ""} onChange={e => setFormData({ ...formData, target: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                            placeholder="e.g. 50 or 24/7" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Suffix (e.g. +, %)</label>
                          <input type="text" value={formData.suffix || ""} onChange={e => setFormData({ ...formData, suffix: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="isString" checked={formData.isString || false} onChange={e => setFormData({ ...formData, isString: e.target.checked })}
                          className="w-4 h-4 rounded accent-blue-600" />
                        <label htmlFor="isString" className="text-sm text-zinc-700 dark:text-zinc-300">
                          Is a text value (e.g. "24/7") — disables counter animation
                        </label>
                      </div>
                    </>
                  )}
                </form>
              </div>

              <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-800/50">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" form="add-form" disabled={isSubmitting || pdfUploading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors">
                  {(isSubmitting || pdfUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {pdfUploading ? `Uploading... ${pdfUploadProgress}%` : "Save Entry"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
