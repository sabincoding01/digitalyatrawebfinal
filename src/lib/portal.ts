import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function syncLeaderboardEntry(
  studentUid: string,
  displayName: string
) {
  const approvedQuery = query(
    collection(db, "submissions"),
    where("studentUid", "==", studentUid),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(approvedQuery);

  await setDoc(
    doc(db, "leaderboard", studentUid),
    {
      uid: studentUid,
      displayName,
      completions: snapshot.size,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
