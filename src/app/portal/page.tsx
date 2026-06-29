"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, getDocs, onSnapshot, setDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  LogOut, CheckCircle2, Clock, X, ExternalLink, Calendar, 
  Send, AlertCircle, Award, Trophy, Bell, BookOpen, LinkIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user, dbUser, logout, loading: authLoading } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [allApprovedSubmissions, setAllApprovedSubmissions] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Submit modal state
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [taskAnswer, setTaskAnswer] = useState("");

  // Live Class state
  const [classSessions, setClassSessions] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [meetLink, setMeetLink] = useState("");

  useEffect(() => {
    if (!user) return;

    // 1. Fetch tasks
    const tasksQuery = query(collection(db, "tasks"));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort tasks by deadline
      data.sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      setTasks(data);
    });

    // 2. Fetch my submissions
    const submissionsQuery = query(collection(db, "submissions"));
    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter my submissions
      const mine = docs.filter((s: any) => s.studentUid === user.uid);
      setMySubmissions(mine);

      // Filter all approved submissions for leaderboard calculation
      const approvedOnly = docs.filter((s: any) => s.status === "approved");
      setAllApprovedSubmissions(approvedOnly);
      
      setLoading(false);
    });

    // 3. Fetch users for leaderboard names lookup
    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(data);
    });

    // 4. Fetch class sessions
    const sessionsQuery = query(collection(db, "classSessions"));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by earliest upcoming
      data.sort((a: any, b: any) => {
        const timeA = new Date(`${a.date}T${a.startTime}`).getTime();
        const timeB = new Date(`${b.date}T${b.startTime}`).getTime();
        return timeA - timeB;
      });
      setClassSessions(data);
    });

    // 5. Fetch my attendance
    const attendanceQuery = query(collection(db, "attendance"));
    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyAttendance(docs.filter((a: any) => a.studentUid === user.uid));
    });

    // 6. Fetch liveClass settings
    const settingsQuery = query(collection(db, "settings"));
    const unsubscribeSettings = onSnapshot(settingsQuery, (snapshot) => {
      const liveClassDoc = snapshot.docs.find(d => d.id === "liveClass");
      if (liveClassDoc) {
        setMeetLink(liveClassDoc.data().meetLink || "");
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeSubmissions();
      unsubscribeUsers();
      unsubscribeSessions();
      unsubscribeAttendance();
      unsubscribeSettings();
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-950 via-[#030914] to-black text-white">
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

  // Leaderboard Calculation
  const completionsPerStudent = allApprovedSubmissions.reduce((acc: any, sub: any) => {
    acc[sub.studentUid] = (acc[sub.studentUid] || 0) + 1;
    return acc;
  }, {});

  const leaderboard = Object.keys(completionsPerStudent)
    .map(uid => {
      const student = allUsers.find(u => u.uid === uid);
      return {
        uid,
        name: student?.displayName || "Student",
        email: student?.email || "",
        completions: completionsPerStudent[uid],
      };
    })
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 5); // top 5

  // Stats
  const totalTasksCount = tasks.length;
  const completedTasksCount = mySubmissions.filter(s => s.status === "approved").length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;
  
  // New Grades Notifications
  const unreadGrades = mySubmissions.filter(s => s.viewedByStudent === false);

  // Active Session Logic
  const now = new Date();
  const activeSession = classSessions.find((session: any) => {
    if (!session.date || !session.startTime) return false;
    const sessionTime = new Date(`${session.date}T${session.startTime}`);
    const sessionEndTime = new Date(sessionTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours after start
    return sessionEndTime > now; 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-950 via-[#030914] to-black text-white pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-secondary-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-400 to-orange-600 text-white flex items-center justify-center font-bold text-xl">
              {dbUser?.displayName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {dbUser?.displayName}!</h1>
              <p className="text-gray-400 text-sm">{dbUser?.email} • Student Account</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Unread Grade Alerts */}
        {unreadGrades.length > 0 && (
          <div className="bg-secondary-500/20 border border-secondary-500/30 text-secondary-300 px-6 py-4 rounded-2xl flex items-start gap-3.5 shadow-[0_0_15px_rgba(247,148,29,0.05)]">
            <Bell className="w-5 h-5 flex-shrink-0 mt-0.5 animate-bounce text-secondary-500" />
            <div>
              <h4 className="font-bold text-white text-sm">Instructor Graded Your Submission!</h4>
              <p className="text-xs text-gray-300 mt-1">
                Please check the task details below for grades, revisions required, or feedback from your instructor.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Tasks</div>
              <div className="text-2xl font-bold mt-0.5">{totalTasksCount}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Tasks Completed</div>
              <div className="text-2xl font-bold mt-0.5">{completedTasksCount}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pending Review</div>
              <div className="text-2xl font-bold mt-0.5">{pendingTasksCount}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Completion Streak</div>
              <div className="text-2xl font-bold mt-0.5">{completedTasksCount * 10} pts</div>
            </div>
          </div>
        </div>

        {/* Active Live Class Banner */}
        {activeSession && (
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 border border-blue-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Now / Upcoming</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{activeSession.title}</h2>
              <div className="flex gap-4 mt-2 text-sm text-blue-200">
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
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-400">
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
                      className={`bg-white/5 border rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all ${
                        isUnread ? "border-secondary-500/50 bg-secondary-500/5 shadow-[0_0_15px_rgba(247,148,29,0.05)]" : "border-white/10"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
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
                          
                          <p className="text-gray-300 text-sm font-light leading-relaxed whitespace-pre-line">{task.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2">
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
                            <div className="mt-4 bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
                              {(submission.answer || submission.note) && (
                                <div className="text-xs text-gray-300">
                                  <span className="font-semibold text-gray-500">Your Response: </span>
                                  {submission.answer || submission.note}
                                </div>
                              )}
                              {submission.feedback && (
                                <div className="text-xs text-amber-500 mt-2 border-t border-white/5 pt-2 font-medium">
                                  <span className="text-gray-500 font-semibold block sm:inline">Instructor Feedback: </span>
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
                              className="px-5 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
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

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
              {leaderboard.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Completions list will appear here once assignments are approved.
                </div>
              ) : (
                leaderboard.map((item, index) => {
                  const rankColors = [
                    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    "bg-gray-300/20 text-gray-300 border-gray-300/30",
                    "bg-amber-600/20 text-amber-500 border-amber-600/30",
                  ];
                  const defaultRank = "bg-white/5 text-gray-400 border-white/5";
                  
                  return (
                    <div key={item.uid} className="flex items-center justify-between p-3.5 bg-black/30 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${rankColors[index] || defaultRank}`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-200">{item.name}</div>
                          <div className="text-[10px] text-gray-500">{item.email.split("@")[0]}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-secondary-500">{item.completions} tasks</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Completed</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Attendance History */}
            <div className="space-y-6 pt-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                <span>Attendance History</span>
              </h2>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
                {classSessions.filter(s => s !== activeSession).length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No past sessions found.
                  </div>
                ) : (
                  classSessions.filter(s => s !== activeSession).map(session => {
                    const attended = myAttendance.find(a => a.sessionId === session.id);
                    return (
                      <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-black/30 border border-white/5 rounded-xl gap-3">
                        <div>
                          <div className="font-semibold text-sm text-gray-200">{session.title}</div>
                          <div className="text-[10px] text-gray-500">{session.date} • {session.startTime}</div>
                        </div>
                        <div className="shrink-0">
                          {attended ? (
                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Present
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
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
              className="bg-zinc-950 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col text-white"
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

              <div className="p-5">
                <form id="submission-form" onSubmit={handleSubmitWork} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Did you finish your task?</label>
                    <textarea
                      rows={4}
                      required
                      value={taskAnswer}
                      onChange={e => setTaskAnswer(e.target.value)}
                      placeholder="Write your answer or share your opinion about completing this task..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-secondary-500 outline-none text-white text-sm resize-none"
                    />
                    <p className="text-[10px] text-gray-500">
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
