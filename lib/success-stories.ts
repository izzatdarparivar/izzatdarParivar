import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  where
} from "firebase/firestore";

export interface SuccessStory {
  id?: string;
  coupleNames: string;
  weddingDate: string;
  story: string;
  imageUrl: string;
  location: string;
  createdAt: any;
  isApproved: boolean;
}

/**
 * Add a new success story (usually by admin)
 */
export async function addSuccessStory(story: Omit<SuccessStory, "id" | "createdAt" | "isApproved">) {
  return await addDoc(collection(db, "success_stories"), {
    ...story,
    isApproved: true, // Default to true since admins add these
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch latest approved success stories for the landing page
 */
export async function getRecentSuccessStories(count: number = 3) {
  const q = query(
    collection(db, "success_stories"),
    where("isApproved", "==", true),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SuccessStory));
}
