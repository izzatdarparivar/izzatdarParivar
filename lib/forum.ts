import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  deleteDoc,
  startAfter,
} from "firebase/firestore";


export interface ForumCategory {
  id?: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  lastActivity: any;
}


export interface ForumThread {
  id?: string;
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  createdAt: any;
  lastReplyAt: any;
}


export interface ForumReply {
  id?: string;
  threadId: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: number;
  createdAt: any;
}


// ─── Categories ──────────────────────────────────────────────────────────────


export async function getCategories(): Promise<ForumCategory[]> {
  const ref = collection(db, "forum_categories");
  const q = query(ref, orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumCategory));
}


// ─── Threads ─────────────────────────────────────────────────────────────────


export async function createThread(
  data: Omit<ForumThread, "id" | "replyCount" | "viewCount" | "isPinned" | "isLocked" | "createdAt" | "lastReplyAt">
): Promise<string> {
  const threadsRef = collection(db, "forum_threads");
  const docRef = await addDoc(threadsRef, {
    ...data,
    replyCount: 0,
    viewCount: 0,
    isPinned: false,
    isLocked: false,
    createdAt: serverTimestamp(),
    lastReplyAt: serverTimestamp(),
  });
  // Increment category thread count
  const catRef = doc(db, "forum_categories", data.categoryId);
  await updateDoc(catRef, {
    threadCount: increment(1),
    lastActivity: serverTimestamp(),
  });
  return docRef.id;
}


export async function getThreads(
  categoryId: string,
  limitNum = 20,
  cursor?: any
): Promise<ForumThread[]> {
  const threadsRef = collection(db, "forum_threads");
  let q = query(
    threadsRef,
    where("categoryId", "==", categoryId),
    orderBy("isPinned", "desc"),
    orderBy("lastReplyAt", "desc"),
    limit(limitNum)
  );
  if (cursor) {
    q = query(
      threadsRef,
      where("categoryId", "==", categoryId),
      orderBy("isPinned", "desc"),
      orderBy("lastReplyAt", "desc"),
      startAfter(cursor),
      limit(limitNum)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumThread));
}


export async function getThread(threadId: string): Promise<ForumThread | null> {
  const ref = doc(db, "forum_threads", threadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  // Increment view count
  await updateDoc(ref, { viewCount: increment(1) });
  return { id: snap.id, ...snap.data() } as ForumThread;
}


// ─── Replies ─────────────────────────────────────────────────────────────────


export async function createReply(
  data: Omit<ForumReply, "id" | "likes" | "createdAt">
): Promise<string> {
  const repliesRef = collection(db, "forum_threads", data.threadId, "replies");
  const docRef = await addDoc(repliesRef, {
    ...data,
    likes: 0,
    createdAt: serverTimestamp(),
  });
  // Update thread
  const threadRef = doc(db, "forum_threads", data.threadId);
  await updateDoc(threadRef, {
    replyCount: increment(1),
    lastReplyAt: serverTimestamp(),
  });
  return docRef.id;
}


export async function getReplies(threadId: string, limitNum = 50): Promise<ForumReply[]> {
  const repliesRef = collection(db, "forum_threads", threadId, "replies");
  const q = query(repliesRef, orderBy("createdAt", "asc"), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumReply));
}


export async function likeReply(threadId: string, replyId: string): Promise<void> {
  const ref = doc(db, "forum_threads", threadId, "replies", replyId);
  await updateDoc(ref, { likes: increment(1) });
}


export async function deleteThread(threadId: string, categoryId: string): Promise<void> {
  const ref = doc(db, "forum_threads", threadId);
  await deleteDoc(ref);
  const catRef = doc(db, "forum_categories", categoryId);
  await updateDoc(catRef, { threadCount: increment(-1) });
}

