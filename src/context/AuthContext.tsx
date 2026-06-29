"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface DbUser {
  uid: string;
  displayName: string;
  email: string;
  role: "student" | "admin";
  status: "pending" | "approved" | "rejected";
  photoURL?: string;
  socialHandle?: string;
  socialPlatform?: string;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Pick<DbUser, "displayName" | "socialHandle" | "socialPlatform">) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let unsubscribeDb: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Set up real-time listener for user document in firestore
        const userRef = doc(db, "users", currentUser.uid);
        
        unsubscribeDb = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as DbUser;
            setDbUser(data);
          } else {
            // First time login - create new user document
            const newUserData: DbUser = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || "Student",
              email: currentUser.email || "",
              role: "student",
              status: "pending",
              photoURL: currentUser.photoURL || "",
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserData);
            setDbUser(newUserData);
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore user error:", err);
          setLoading(false);
        });
      } else {
        setDbUser(null);
        if (unsubscribeDb) {
          unsubscribeDb();
          unsubscribeDb = null;
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
  }, []);

  // Handle route protection client-side
  useEffect(() => {
    if (loading) return;

    const isPortalRoute = pathname.startsWith("/portal");
    const isLoginRoute = pathname === "/portal/login";
    const isPendingRoute = pathname === "/portal/pending";

    if (isPortalRoute) {
      if (!user) {
        if (!isLoginRoute) {
          router.push("/portal/login");
        }
      } else if (dbUser) {
        if (dbUser.status === "pending" || dbUser.status === "rejected") {
          if (!isPendingRoute) {
            router.push("/portal/pending");
          }
        } else if (dbUser.status === "approved") {
          if (isLoginRoute || isPendingRoute) {
            router.push("/portal");
          }
        }
      }
    }
  }, [user, dbUser, loading, pathname, router]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Auth popup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/portal/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const updateProfile = async (data: Pick<DbUser, "displayName" | "socialHandle" | "socialPlatform">) => {
    if (!user) throw new Error("Not signed in");
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, data);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
