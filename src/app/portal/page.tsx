"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, setDoc, doc, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  LogOut, CheckCircle2, Clock, X, ExternalLink, Calendar, 
  Send, Award, Trophy, Bell, BookOpen, LinkIcon, Megaphone, FileText, User, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user, dbUser, logout, updateProfile, loading: authLoading } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [taskAnswer, setTaskAnswer] = useState("");

  const [classSessions, setClassSessions] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [meetLink, setMeetLink] = useState("");

  const [socialHandle, setSocialHandle] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("instagram");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setSocialHandle(dbUser.socialHandle || "");
      setSocialPlatform(dbUser.socialPlatform || "instagram");
    }
  }, [dbUser]);

  useEffect(() => {
    if (!user) return;

    let loadedCount = 0;
    const markLoaded = () => {
      loadedCount += 1;
      if (loadedCount >= 7) setLoading(false);
    };

    const unsubscribeTasks = onSnapshot(query(collection(db, "tasks")), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      setTasks(data);
      markLoaded();
    });

    const unsubscribeSubmissions = onSnapshot(
      query(collection(db, "submissions"), where("studentUid", "==", user.uid)),
      (snapshot) => {
        setMySubmissions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        markLoaded();
      }
    );

    const unsubscribeLeaderboard = onSnapshot(query(collection(db, "leaderboard")), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => (b.completions || 0) - (a.completions || 0));
      setLeaderboard(data.slice(0, 5));
      markLoaded();
    });

    const unsubscribeAnnouncements = onSnapshot(
      query(collection(db, "announcements"), where("active", "==", true)),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setAnnouncements(data);
        markLoaded();
      }
    );

    const unsubscribeResources = onSnapshot(
      query(collection(db, "resources"), where("active", "==", true)),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setResources(data);
        markLoaded();
      }
    );

    const unsubscribeSessions = onSnapshot(query(collection(db, "classSessions")), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => {
        const timeA = new Date(`${a.date}T${a.startTime}`).getTime();
        const timeB = new Date(`${b.date}T${b.startTime}`).getTime();
        return timeA - timeB;
      });
      setClassSessions(data);
      markLoaded();
    });

    const unsubscribeAttendance = onSnapshot(
      query(collection(db, "attendance"), where("studentUid", "==", user.uid)),
      (snapshot) => {
        setMyAttendance(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        markLoaded();
      }
    );

    const unsubscribeSettings = onSnapshot(doc(db, "settings", "liveClass"), (docSnap) => {
      setMeetLink(docSnap.exists() ? docSnap.data().meetLink || "" : "");
      markLoaded();
    });

    return () => {
      unsubscribeTasks();
      unsubscribeSubmissions();
      unsubscribeLeaderboard();
      unsubscribeAnnouncements();
      unsubscribeResources();
      unsubscribeSessions();
      unsubscribeAttendance();
      unsubscribeSettings();
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center portal-page">
        <Loader2 className="w-8 h-8 animate-spin text-secondary-500" />
      </div>
    );
  }

  // Handle Work Submission
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !user || !dbUser || !taskAnswer.trim()) return;


    setSubmittingWork(true);

    try {
      // Check if we already have a submission document for this student and task
      const existingSub = mySubmissions.find(s => s.taskId === activeTask.id);
      const submissionId = existingSub?.id || `${user.uid}_${activeTask.id}`;

      const payload = {
        taskId: activeTask.id,
        studentUid: user.uid,
        studentName: dbUser.displayName,
        studentEmail: dbUser.email,
        socialHandle: dbUser.socialHandle || "",
        socialPlatform: dbUser.socialPlatform || "",
        answer: taskAnswer.trim(),
        status: "submitted",
        feedback: "",
        submittedAt: serverTimestamp(),
        viewedByStudent: true,
      };

      await setDoc(doc(db, "submissions", submissionId), payload, { merge: true });
      toast.success("Submitted! Admin will review your response on social media.");
      
      setActiveTask(null);
      setTaskAnswer("");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit work. Please try again.");
    } finally {
      setSubmittingWork(false);
    }
  };

  // Mark status update as viewed by student (clears notification dot)
  const handleViewFeedback = async (sub: any) => {
    if (!sub.viewedByStudent) {
      try {
        await updateDoc(doc(db, "submissions", sub.id), { viewedByStudent: true });
      } catch (err) {
        console.error("Error updating viewedByStudent:", err);
      }
    }
  };

  // Live Class Join Logic
  const handleJoinClass = async (session: any) => {
    if (!meetLink) {
      toast.error("No live class link is currently configured.");
      return;
    }
    
    // Automatically log attendance
    if (user) {
      try {
        const recordId = `${session.id}_${user.uid}`;
        await setDoc(doc(db, "attendance", recordId), {
          sessionId: session.id,
          studentUid: user.uid,
          joinedAt: serverTimestamp(),
          method: "self_reported"
        });
        toast.success("Attendance recorded!");
      } catch (err) {
        console.error(err);
        toast.error("Joined class, but failed to record attendance.");
      }
    }

    window.open(meetLink, "_blank");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        displayName: dbUser?.displayName || "",
        socialHandle: socialHandle.trim(),
        socialPlatform,
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const totalTasksCount = tasks.length;
  const completedTasksCount = mySubmissions.filter(s => s.status === "approved").length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;
  
  // New Grades Notifications
  const unreadGrades = mySubmissions.filter(s => s.viewedByStudent === false);

  // Active/Today Session Calculation for History & Live Banner
  const now = new Date();
  const activeSession = classSessions.find((session: any) => {
    if (!session.date || !session.startTime) return false;
    const sessionTime = new Date(`${session.date}T${session.startTime}`);
    const sessionEndTime = new Date(sessionTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours after start
    return sessionEndTime > now; 
  });

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayString();

  // Fix 2: Prepend today's session in history if student joined it
  const todayAttendedSessions = classSessions.filter(session => {
    const isToday = session.date === todayStr;
    const attended = myAttendance.some((a: any) => a.sessionId === session.id);
    return isToday && attended;
  });

  const baseHistorySessions = classSessions.filter(s => s.id !== activeSession?.id);
  const filteredBaseHistory = baseHistorySessions.filter(s => !todayAttendedSessions.some(t => t.id === s.id));
  const displayHistorySessions = [...todayAttendedSessions, ...filteredBaseHistory];

  return (
    <div className="portal-page pb-12 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-secondary-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 portal-card rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-400 to-orange-600 text-white flex items-center justify-center font-bold text-xl">
              {dbUser?.displayName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {dbUser?.displayName}!</h1>
              <p className="text-zinc-500 dark:text-gray-400 text-sm">{dbUser?.email} • Student Account</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Unread Grade Alerts */}
        {unreadGrades.length > 0 && (
          <div className="bg-secondary-50/80 dark:bg-secondary-500/20 border border-secondary-200 dark:border-secondary-500/30 text-secondary-800 dark:text-secondary-300 px-6 py-4 rounded-2xl flex items-start gap-3.5 shadow-[0_0_15px_rgba(247,148,29,0.05)]">
            <Bell className="w-5 h-5 flex-shrink-0 mt-0.5 animate-bounce text-secondary-500" />
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Instructor Graded Your Submission!</h4>
              <p className="text-xs text-zinc-600 dark:text-gray-300 mt-1">
                Please check the task details below for grades, revisions required, or feedback from your instructor.
              </p>
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20 px-6 py-4 rounded-2xl flex items-start gap-3">
                <Megaphone className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-zinc-600 dark:text-gray-300 mt-1 whitespace-pre-line">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile / Social handle for admin review */}
        <div className="portal-card rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-secondary-500" /> Your Profile
          </h2>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Social Platform</label>
              <select
                value={socialPlatform}
                onChange={(e) => setSocialPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-secondary-500"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-gray-400">Social Media Username (for task verification)</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@yourusername"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-sm outline-none focus:border-secondary-500"
                />
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full sm:w-auto px-4 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-gray-500 font-medium">Admin uses this to verify your task posts on social media.</p>
            </div>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="portal-card p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Tasks</div>
              <div className="text-2xl font-bold mt-0.5">{totalTasksCount}</div>
            </div>
          </div>

          <div className="portal-card p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Tasks Completed</div>
              <div className="text-2xl font-bold mt-0.5">{completedTasksCount}</div>
            </div>
          </div>

          <div className="portal-card p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Pending Review</div>
              <div className="text-2xl font-bold mt-0.5">{pendingTasksCount}</div>
            </div>
          </div>

          <div className="portal-card p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Completion Streak</div>
              <div className="text-2xl font-bold mt-0.5">{completedTasksCount * 10} pts</div>
            </div>
          </div>
        </div>

        {/* Active Live Class Banner */}
        {activeSession && (
          <div className="bg-blue-50/80 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Live Now / Upcoming</span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{activeSession.title}</h2>
              <div className="flex gap-4 mt-2 text-sm text-blue-700 dark:text-blue-200">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {activeSession.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {activeSession.startTime}</span>
              </div>
            </div>
            <button
              onClick={() => handleJoinClass(activeSession)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <LinkIcon className="w-5 h-5" /> Join Live Class
            </button>
          </div>
        )}

        {/* Dashboard Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋 Task Assignment list</span>
            </h2>

            {tasks.length === 0 ? (
              <div className="portal-card rounded-2xl p-12 text-center text-zinc-500 dark:text-gray-400">
                No tasks assigned by admin yet.
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const submission = mySubmissions.find(s => s.taskId === task.id);
                  const isCompleted = submission?.status === "approved";
                  const isNeedsRevision = submission?.status === "needs_revision";
                  const isPendingReview = submission?.status === "submitted";
                  const isUnread = submission?.viewedByStudent === false;

                  return (
                    <div 
                      key={task.id} 
                      onClick={() => submission && handleViewFeedback(submission)}
                      className={`portal-card rounded-2xl p-6 transition-all ${
                        isUnread ? "border-secondary-500/50 bg-secondary-50/50 dark:bg-secondary-500/5 shadow-[0_0_15px_rgba(247,148,29,0.05)]" : "hover:border-zinc-300 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                              {task.title}
                              {isUnread && (
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary-500 animate-pulse" title="Unread Update" />
                              )}
                            </h3>
                            
                            {/* Status Badges */}
                            {isCompleted && (
                              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full uppercase">Completed</span>
                            )}
                            {isNeedsRevision && (
                              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full uppercase">Needs Revision</span>
                            )}
                            {isPendingReview && (
                              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full uppercase">Submitted</span>
                            )}
                            {!submission && (
                              <span className="px-2.5 py-0.5 bg-zinc-800 text-gray-400 border border-zinc-700 text-xs font-semibold rounded-full uppercase">Not Started</span>
                            )}
                          </div>
                          
                          <p className="text-zinc-700 dark:text-gray-300 text-sm font-light leading-relaxed whitespace-pre-line">{task.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-gray-400 pt-2">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-secondary-500" />
                              <span>Deadline: {task.deadline}</span>
                            </div>
                            {task.referenceLink && (
                              <a href={task.referenceLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                                <LinkIcon className="w-4 h-4" />
                                <span>Reference Docs</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {/* Submission Feedbacks */}
                          {submission && (
                            <div className="mt-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-xl p-4 space-y-2">
                              {(submission.answer || submission.note) && (
                                <div className="text-xs text-zinc-700 dark:text-gray-300">
                                  <span className="font-semibold text-zinc-500 dark:text-gray-500">Your Response: </span>
                                  {submission.answer || submission.note}
                                </div>
                              )}
                              {submission.feedback && (
                                <div className="text-xs text-amber-600 dark:text-amber-500 mt-2 border-t border-zinc-200 dark:border-white/5 pt-2 font-medium">
                                  <span className="text-zinc-500 dark:text-gray-500 font-semibold block sm:inline">Instructor Feedback: </span>
                                  {submission.feedback}
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Submission Actions */}
                        <div className="shrink-0 pt-1">
                          {(!submission || isNeedsRevision) && (
                            <button
                              onClick={() => {
                                setActiveTask(task);
                                setTaskAnswer(submission?.answer || submission?.note || "");
                              }}
                              className="w-full sm:w-auto px-5 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                            >
                              <Send className="w-4 h-4" />
                              <span>{isNeedsRevision ? "Resubmit Work" : "Submit Work"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leaderboard / Stream Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Leaderboard</span>
            </h2>

            <div className="portal-card rounded-2xl p-6 space-y-4">
              {leaderboard.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 dark:text-gray-400 text-sm">
                  Completions list will appear here once assignments are approved.
                </div>
              ) : (
                leaderboard.map((item, index) => {
                  const rankColors = [
                    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    "bg-gray-300/20 text-gray-300 border-gray-300/30",
                    "bg-amber-600/20 text-amber-500 border-amber-600/30",
                  ];
                  const defaultRank = "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-gray-400 border-zinc-200 dark:border-white/5";
                  
                  return (
                    <div key={item.uid || item.id} className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-black/30 border border-zinc-200/50 dark:border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${rankColors[index] || defaultRank}`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-zinc-800 dark:text-gray-200">{item.displayName || "Student"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-secondary-500">{item.completions} tasks</div>
                        <div className="text-[9px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Completed</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Study Resources */}
            {resources.length > 0 && (
              <div className="space-y-4 pt-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-6 h-6 text-emerald-500" />
                  <span>Study Resources</span>
                </h2>
                <div className="portal-card rounded-2xl p-6 space-y-3">
                  {resources.map((res) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-xl hover:border-zinc-300 dark:hover:border-white/20 transition-colors group"
                    >
                      <div>
                        <div className="font-semibold text-sm text-zinc-800 dark:text-gray-200 group-hover:text-zinc-950 dark:group-hover:text-white">{res.title}</div>
                        <div className="text-[10px] text-zinc-500 dark:text-gray-500 uppercase">{res.type || "link"}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400 dark:text-gray-500 group-hover:text-secondary-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance History */}
            <div className="space-y-6 pt-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                <span>Attendance History</span>
              </h2>

              <div className="portal-card rounded-2xl p-6 space-y-4">
                {displayHistorySessions.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 dark:text-gray-400 text-sm">
                    No past sessions found.
                  </div>
                ) : (
                  displayHistorySessions.map(session => {
                    const attended = myAttendance.find(a => a.sessionId === session.id);
                    const isToday = session.date === todayStr;
                    return (
                      <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-xl gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-sm text-zinc-800 dark:text-gray-200">{session.title}</div>
                            {isToday && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500">{session.date} • {session.startTime}</div>
                        </div>
                        <div className="shrink-0">
                          {attended ? (
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Present
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                              <X className="w-3 h-3" /> Absent
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col text-zinc-900 dark:text-white max-h-[90vh]"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-lg font-bold">Submit Task Completion</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{activeTask.title}</p>
                </div>
                <button onClick={() => setActiveTask(null)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto">
                <form id="submission-form" onSubmit={handleSubmitWork} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 dark:text-gray-300">Did you finish your task?</label>
                    <textarea
                      rows={4}
                      required
                      value={taskAnswer}
                      onChange={e => setTaskAnswer(e.target.value)}
                      placeholder="Write your answer or share your opinion about completing this task..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-secondary-500 outline-none text-zinc-900 dark:text-white text-sm resize-none"
                    />
                    <p className="text-[10px] text-zinc-500 dark:text-gray-500">
                      After you submit, admin will review your response on social media. Once approved, this task will be marked as completed.
                    </p>
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                <button type="button" onClick={() => setActiveTask(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="submission-form" 
                  disabled={submittingWork}
                  className="px-6 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all shadow-md cursor-pointer"
                >
                  {submittingWork ? "Submitting..." : "Submit Work"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Loader Icon fallback for nextjs build compatibility
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
