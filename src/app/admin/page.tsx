"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  Trash2, CheckCircle, Clock, AlertCircle, Plus, X, Image as ImageIcon,
  Loader2, Lock, Pencil, Save, FileText, ExternalLink, Phone, Mail, User, MessageSquare, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { syncLeaderboardEntry } from "@/lib/portal";

const ADMIN_PIN = "5993";

export default function AdminPage() {
  const { dbUser } = useAuth();
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
    users: [],
    tasks: [],
    submissions: [],
    announcements: [],
    resources: [],
    leaderboard: [],
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

  // Student Portal Admin State
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilterStatus, setStudentFilterStatus] = useState("all");
  const [submissionFilterTask, setSubmissionFilterTask] = useState("all");
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradingStatus, setGradingStatus] = useState<"approved" | "needs_revision">("approved");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [attendanceViewSession, setAttendanceViewSession] = useState<any | null>(null);

  // Settings Tab State
  const [meetLink, setMeetLink] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (data.settings) {
      const liveClassDoc = data.settings.find((s: any) => s.id === "liveClass");
      if (liveClassDoc && liveClassDoc.meetLink) {
        setMeetLink(liveClassDoc.meetLink);
      }
    }
  }, [data.settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetLink) return;
    try {
      new URL(meetLink);
    } catch (_) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "liveClass"), {
        meetLink,
        updatedAt: serverTimestamp(),
        updatedBy: dbUser?.uid || "admin",
      }, { merge: true });
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const collections = [
        "testimonials", "services", "courses", "projects", "stats", "blogs", "careers", 
        "subscribers", "courseLeads", "contacts", "users", "tasks", "submissions", "settings", "classSessions", "attendance",
        "announcements", "resources", "leaderboard"
      ];
      const unsubscribes = collections.map(colName => {
        const q = query(collection(db, colName));
        return onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (colName === "stats") {
            docs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          } else {
            docs.sort((a: any, b: any) => {
              const aTime = a.createdAt?.toMillis 
                ? a.createdAt.toMillis() 
                : (a.subscribedAt?.toMillis 
                  ? a.subscribedAt.toMillis() 
                  : (a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0));
              const bTime = b.createdAt?.toMillis 
                ? b.createdAt.toMillis() 
                : (b.subscribedAt?.toMillis 
                  ? b.subscribedAt.toMillis() 
                  : (b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0));
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

  const refreshLeaderboard = async (studentUid: string, displayName: string) => {
    try {
      await syncLeaderboardEntry(studentUid, displayName);
    } catch (err) {
      console.error("Leaderboard sync failed:", err);
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

  // --- PORTAL ACTIONS ---
  const handleStudentStatus = async (uid: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "users", uid), { status: newStatus });
      toast.success(`Student status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update student status");
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await updateDoc(doc(db, "submissions", gradingSubmission.id), {
        status: gradingStatus,
        feedback: gradingFeedback,
        viewedByStudent: false,
      });
      toast.success(gradingStatus === "approved" ? "Task marked as completed!" : "Sent back for revision.");
      if (gradingStatus === "approved") {
        await refreshLeaderboard(gradingSubmission.studentUid, gradingSubmission.studentName);
      }
      setGradingSubmission(null);
      setGradingFeedback("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to grade submission");
    }
  };

  const handleSubmissionStatus = async (
    sub: { id: string; studentUid: string; studentName: string },
    newStatus: "approved" | "needs_revision",
    feedback = ""
  ) => {
    try {
      await updateDoc(doc(db, "submissions", sub.id), {
        status: newStatus,
        feedback,
        viewedByStudent: false,
      });
      if (newStatus === "approved") {
        await refreshLeaderboard(sub.studentUid, sub.studentName);
      }
      toast.success(newStatus === "approved" ? "Task marked as completed!" : "Sent back for revision.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update submission");
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

      if (activeTab === "announcements" || activeTab === "resources") {
        payload.active = payload.active !== false;
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
  if (dbUser && dbUser.role === "student") {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] bg-zinc-950 text-white flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          <h1 className="text-xl font-bold">Unauthorized Access</h1>
          <p className="text-sm text-gray-400">
            Student accounts are not permitted to access the administrator panel.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6">
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
    { id: "users", label: "🎓 Portal: Students" },
    { id: "tasks", label: "📋 Portal: Tasks" },
    { id: "submissions", label: "📝 Portal: Submissions" },
    { id: "announcements", label: "📢 Portal: Announcements" },
    { id: "resources", label: "📚 Portal: Resources" },
    { id: "classSessions", label: "🗓️ Portal: Live Classes" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  const readOnlyTabs = ["testimonials", "subscribers", "courseLeads", "contacts", "users", "submissions", "settings"];
  const newContactCount = data.contacts?.filter((c: any) => c.status === "new").length || 0;

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-zinc-50 dark:bg-zinc-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Tabs - horizontally scrollable on mobile */}
        <div className="relative w-full max-w-full">
          <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar border-b border-zinc-200 dark:border-zinc-800 scroll-pl-4">
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

          {/* ===== STUDENTS TAB ===== */}
          {activeTab === "users" && (
            <div className="p-6 space-y-6">
              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-fade-in">
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full sm:max-w-xs px-4 py-2.5 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={studentFilterStatus}
                    onChange={e => setStudentFilterStatus(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Students List */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                {(() => {
                  const filteredStudents = (data.users || [])
                    .filter((u: any) => u.role === "student")
                    .filter((u: any) => {
                      const matchesSearch = (u.displayName || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (u.email || "").toLowerCase().includes(studentSearch.toLowerCase());
                      const matchesStatus = studentFilterStatus === "all" || u.status === studentFilterStatus;
                      return matchesSearch && matchesStatus;
                    });

                  if (filteredStudents.length === 0) {
                    return <div className="px-6 py-12 text-center text-zinc-500">No students matching the criteria.</div>;
                  }

                  return filteredStudents.map((student: any) => (
                    <div key={student.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {student.displayName?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            {student.displayName}
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{student.email}</p>
                          {(student.socialHandle) && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                              {student.socialPlatform || "social"}: @{student.socialHandle.replace(/^@/, "")}
                            </p>
                          )}
                          <p className="text-xs text-zinc-400 mt-1">Joined: {student.createdAt ? new Date(student.createdAt.toDate()).toLocaleDateString() : "Pending"}</p>
                          {student.status === "approved" && (() => {
                            const studentJoinDate = student.createdAt?.toMillis ? student.createdAt.toMillis() : 0;
                            const pastSessions = (data.classSessions || []).filter((s: any) => {
                              const sessionTime = new Date(`${s.date}T${s.startTime}`).getTime();
                              return sessionTime < Date.now() && sessionTime >= studentJoinDate;
                            });
                            const attendedCount = pastSessions.filter((s: any) => 
                              data.attendance?.some((a: any) => a.sessionId === s.id && a.studentUid === student.id)
                            ).length;
                            const percentage = pastSessions.length > 0 ? Math.round((attendedCount / pastSessions.length) * 100) : 0;
                            
                            return (
                              <p className="text-xs font-medium mt-1 text-blue-600 dark:text-blue-400">
                                Attendance: {percentage}% ({attendedCount}/{pastSessions.length} sessions)
                              </p>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          student.status === "approved" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : student.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}>
                          {student.status || "pending"}
                        </span>

                        {/* Status update buttons */}
                        <div className="flex gap-1.5">
                          {student.status !== "approved" && (
                            <button
                              onClick={() => handleStudentStatus(student.id, "approved")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {student.status !== "rejected" && (
                            <button
                              onClick={() => handleStudentStatus(student.id, "rejected")}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete("users", student.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* ===== SUBMISSIONS TAB ===== */}
          {activeTab === "submissions" && (
            <div className="p-6 space-y-6 animate-fade-in">
              {/* Task Dropdown Selector & Filter */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 shrink-0">Filter by Task:</label>
                  <select
                    value={submissionFilterTask}
                    onChange={e => setSubmissionFilterTask(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2.5 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Tasks</option>
                    {(data.tasks || []).map((t: any) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submissions List */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                {(() => {
                  const filteredSubmissions = (data.submissions || [])
                    .filter((s: any) => submissionFilterTask === "all" || s.taskId === submissionFilterTask);

                  if (filteredSubmissions.length === 0) {
                    return <div className="px-6 py-12 text-center text-zinc-500">No submissions found.</div>;
                  }

                  return filteredSubmissions.map((sub: any) => {
                    const associatedTask = (data.tasks || []).find((t: any) => t.id === sub.taskId);
                    const studentUser = (data.users || []).find((u: any) => u.uid === sub.studentUid);
                    const socialHandle = sub.socialHandle || studentUser?.socialHandle;
                    const socialPlatform = sub.socialPlatform || studentUser?.socialPlatform;
                    
                    return (
                      <div key={sub.id} className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-zinc-950 dark:text-white text-base">{sub.studentName}</span>
                            <span className="text-zinc-400">•</span>
                            <span className="text-zinc-500 text-sm">{sub.studentEmail}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              Task: {associatedTask ? associatedTask.title : "Unknown Task"}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                              <span>Submitted: {sub.submittedAt ? new Date(sub.submittedAt.toDate()).toLocaleString() : "Unknown"}</span>
                            </div>
                          </div>

                          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 space-y-2 max-w-2xl">
                            <div className="text-sm text-zinc-600 dark:text-zinc-300">
                              <span className="font-semibold text-zinc-500 dark:text-zinc-400">Did you finish your task? — </span>
                              {sub.answer || sub.note || sub.link || "No response provided"}
                            </div>
                            {(sub.socialHandle || socialHandle) && (
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                Social: @{String(socialHandle).replace(/^@/, "")}
                                {socialPlatform && ` (${socialPlatform})`}
                              </div>
                            )}
                            {sub.feedback && (
                              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 border-t border-zinc-100 dark:border-zinc-800 pt-1">
                                <span className="font-semibold">Instructor Feedback: </span>
                                {sub.feedback}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 shrink-0">
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            sub.status === "approved" 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : sub.status === "needs_revision"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                          }`}>
                            {sub.status === "approved"
                              ? "Completed"
                              : sub.status === "needs_revision"
                                ? "Needs Revision"
                                : "Pending Review"}
                          </span>

                          <div className="flex flex-wrap gap-2 justify-end">
                            {sub.status !== "approved" && (
                              <button
                                onClick={() => handleSubmissionStatus(sub, "approved")}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {sub.status !== "needs_revision" && sub.status !== "approved" && (
                              <button
                                onClick={() => handleSubmissionStatus(sub, "needs_revision")}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                              >
                                Needs Revision
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setGradingSubmission(sub);
                                setGradingStatus(sub.status === "needs_revision" ? "needs_revision" : "approved");
                                setGradingFeedback(sub.feedback || "");
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                              Add Feedback
                            </button>
                            <button
                              onClick={() => handleDelete("submissions", sub.id)}
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ===== ANNOUNCEMENTS TAB ===== */}
          {activeTab === "announcements" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                {(!data.announcements || data.announcements.length === 0) ? (
                  <div className="px-6 py-12 text-center text-zinc-500">No announcements yet. Click &quot;Add New Entry&quot; to create one.</div>
                ) : (
                  data.announcements.map((item: any) => (
                    <div key={item.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/10">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-zinc-950 dark:text-white">{item.title}</h3>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${item.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                            {item.active !== false ? "Active" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-line">{item.message}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => updateDoc(doc(db, "announcements", item.id), { active: item.active === false })}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium rounded-lg"
                        >
                          {item.active !== false ? "Hide" : "Show"}
                        </button>
                        <button onClick={() => handleDelete("announcements", item.id)} className="p-2 text-zinc-400 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== RESOURCES TAB ===== */}
          {activeTab === "resources" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                {(!data.resources || data.resources.length === 0) ? (
                  <div className="px-6 py-12 text-center text-zinc-500">No resources yet. Click &quot;Add New Entry&quot; to add study links or PDFs.</div>
                ) : (
                  data.resources.map((item: any) => (
                    <div key={item.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/10">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-zinc-950 dark:text-white">{item.title}</h3>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-blue-100 text-blue-700">{item.type || "link"}</span>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                          {item.url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <button onClick={() => handleDelete("resources", item.id)} className="p-2 text-zinc-400 hover:text-red-600 rounded-lg shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {activeTab === "settings" && (
            <div className="p-6 space-y-8 animate-fade-in">
              <div className="max-w-2xl">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Live Class Settings</h3>
                <p className="text-sm text-zinc-500 mb-6">Manage the recurring Google Meet link for student live classes.</p>
                
                <form onSubmit={handleSaveSettings} className="space-y-4 bg-zinc-50 dark:bg-zinc-800/40 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">Google Meet URL</label>
                    <input
                      type="url"
                      required
                      value={meetLink}
                      onChange={(e) => setMeetLink(e.target.value)}
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      className="w-full px-4 py-2.5 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <p className="text-xs text-zinc-500 mt-1">This link will be displayed to all approved students in their portal.</p>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSavingSettings}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-70"
                  >
                    {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Settings
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===== CLASS SESSIONS TAB ===== */}
          {activeTab === "classSessions" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                {(!data.classSessions || data.classSessions.length === 0) ? (
                  <div className="px-6 py-12 text-center text-zinc-500">No class sessions scheduled yet. Click "Add New Entry" to create one.</div>
                ) : (
                  data.classSessions.map((session: any) => {
                    const sessionAttendance = (data.attendance || []).filter((a: any) => a.sessionId === session.id);
                    return (
                      <div key={session.id} className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold text-zinc-950 dark:text-white text-base">{session.title}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-zinc-500">
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {session.date}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {session.startTime}</span>
                            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {sessionAttendance.length} Checked In</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setAttendanceViewSession(session)}
                            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            View Attendance
                          </button>
                          <button
                            onClick={() => handleDelete("classSessions", session.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ===== ALL OTHER TABS (table view) ===== */}
          {!["contacts", "stats", "users", "submissions", "settings", "classSessions", "announcements", "resources"].includes(activeTab) && (
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
                            {activeTab === "tasks" && item.deadline && <p>📅 Deadline: {item.deadline}</p>}
                            {activeTab === "tasks" && item.referenceLink && (
                              <a href={item.referenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                <ExternalLink className="w-3 h-3" /> Reference Link
                              </a>
                            )}
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
                  {["courses", "projects", "services", "blogs", "careers", "tasks", "announcements", "resources"].includes(activeTab) && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                      <input type="text" required value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                    </div>
                  )}

                  {/* Common Description */}
                  {["courses", "projects", "services", "tasks", "announcements"].includes(activeTab) && (
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

                  {/* ===== PORTAL ANNOUNCEMENTS ===== */}
                  {activeTab === "announcements" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Message</label>
                      <textarea required rows={4} value={formData.message || ""} onChange={e => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none text-sm"
                        placeholder="Class is cancelled tomorrow / New task posted..." />
                    </div>
                  )}

                  {/* ===== PORTAL RESOURCES ===== */}
                  {activeTab === "resources" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resource URL</label>
                        <input type="url" required value={formData.url || ""} onChange={e => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://drive.google.com/... or PDF link"
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                        <select value={formData.type || "link"} onChange={e => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm">
                          <option value="link">Link</option>
                          <option value="pdf">PDF</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* ===== PORTAL TASKS ===== */}
                  {activeTab === "tasks" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reference Link (Optional URL)</label>
                        <input type="url" value={formData.referenceLink || ""} onChange={e => setFormData({ ...formData, referenceLink: e.target.value })}
                          placeholder="e.g. Google Drive folder or brief PDF link"
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Deadline</label>
                        <input type="date" required value={formData.deadline || ""} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                      </div>
                    </>
                  )}

                  {/* ===== CLASS SESSIONS ===== */}
                  {activeTab === "classSessions" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Session Title</label>
                        <input type="text" required value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Week 1 - React Basics"
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date (YYYY-MM-DD)</label>
                          <input type="date" required value={formData.date || ""} onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Time (24h)</label>
                          <input type="time" required value={formData.startTime || ""} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                        </div>
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

      {/* ===== GRADING MODAL ===== */}
      <AnimatePresence>
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
                <h3 className="text-lg font-bold">Review Student Submission</h3>
                <button onClick={() => setGradingSubmission(null)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Student</label>
                  <p className="font-semibold text-sm text-zinc-950 dark:text-white">{gradingSubmission.studentName}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Did you finish your task?</label>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {gradingSubmission.answer || gradingSubmission.note || gradingSubmission.link || "No response provided"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">Review this on social media, then approve to mark the task as completed.</p>
                </div>

                <form id="grade-form" onSubmit={handleGradeSubmission} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Review Status</label>
                    <select
                      value={gradingStatus}
                      onChange={e => setGradingStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                    >
                      <option value="approved">Approved — Mark task completed</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Feedback / Notes</label>
                    <textarea
                      rows={3}
                      value={gradingFeedback}
                      onChange={e => setGradingFeedback(e.target.value)}
                      placeholder="Excellent work! / Please fix the layout on mobile..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-800/50">
                <button type="button" onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" form="grade-form"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                  {gradingStatus === "approved" ? "Approve & Save" : "Save Feedback"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== ATTENDANCE VIEW MODAL ===== */}
      <AnimatePresence>
        {attendanceViewSession && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
                <div>
                  <h3 className="text-lg font-bold">{attendanceViewSession.title} - Roster</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Self-Reported Attendance
                  </p>
                </div>
                <button onClick={() => setAttendanceViewSession(null)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-grow p-0">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.users?.filter((u: any) => u.role === "student" && u.status === "approved").length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 text-sm">No approved students found.</div>
                  ) : (
                    data.users?.filter((u: any) => u.role === "student" && u.status === "approved").map((student: any) => {
                      const record = data.attendance?.find((a: any) => a.sessionId === attendanceViewSession.id && a.studentUid === student.id);
                      
                      return (
                        <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                          <div>
                            <div className="font-medium text-sm text-zinc-900 dark:text-white">{student.displayName}</div>
                            <div className="text-xs text-zinc-500">{student.email}</div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {record ? (
                              <div className="text-right">
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1 justify-end">
                                  <CheckCircle className="w-3.5 h-3.5" /> Checked In
                                </span>
                                <div className="text-[10px] text-zinc-400 mt-1">
                                  {record.method === "admin_override" ? "Manual Override" : "Self-Reported"} 
                                  {record.joinedAt ? ` at ${new Date(record.joinedAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ""}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-xs font-semibold rounded-full flex items-center gap-1">
                                  <X className="w-3.5 h-3.5" /> Did Not Check In
                                </span>
                                <button
                                  onClick={async () => {
                                    try {
                                      const recordId = `${attendanceViewSession.id}_${student.id}`;
                                      await setDoc(doc(db, "attendance", recordId), {
                                        sessionId: attendanceViewSession.id,
                                        studentUid: student.id,
                                        joinedAt: serverTimestamp(),
                                        method: "admin_override"
                                      });
                                      setAttendanceViewSession({
                                        ...attendanceViewSession,
                                        _updated: Date.now(),
                                      });
                                    } catch (e) {
                                      console.error("Failed to mark present.");
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Mark Present Manually
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
