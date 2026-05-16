import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";


export interface CommunityGroup {
  id?: string;
  name: string;
  description: string;
  category: "caste" | "region" | "profession" | "interest" | "religion";
  coverImage?: string;
  createdBy: string;
  admins: string[];
  memberCount: number;
  isPrivate: boolean;
  rules?: string[];
  tags: string[];
  createdAt: any;
}


export interface GroupPost {
  id?: string;
  groupId: string;
  authorId: string;
  authorName: string;
  content: string;
  type: "discussion" | "announcement" | "success_story" | "event";
  likes: number;
  commentCount: number;
  createdAt: any;
}


export interface GroupMembership {
  userId: string;
  groupId: string;
  role: "member" | "moderator" | "admin";
  joinedAt: any;
}


// ─── Group CRUD ──────────────────────────────────────────────────────────────


export async function createGroup(data: Omit<CommunityGroup, "id" | "memberCount" | "createdAt">): Promise<string> {
  const groupsRef = collection(db, "community_groups");
  const docRef = await addDoc(groupsRef, {
    ...data,
    memberCount: 1,
    createdAt: serverTimestamp(),
  });
  // Add creator as member
  await joinGroup(data.createdBy, docRef.id, "admin");
  return docRef.id;
}


export async function getGroup(groupId: string): Promise<CommunityGroup | null> {
  const ref = doc(db, "community_groups", groupId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as CommunityGroup;
}


export async function getGroups(category?: string, limitNum = 20): Promise<CommunityGroup[]> {
  const groupsRef = collection(db, "community_groups");
  let q;
  if (category) {
    q = query(groupsRef, where("category", "==", category), orderBy("memberCount", "desc"), limit(limitNum));
  } else {
    q = query(groupsRef, orderBy("memberCount", "desc"), limit(limitNum));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityGroup));
}


export async function searchGroups(searchTerm: string): Promise<CommunityGroup[]> {
  const groupsRef = collection(db, "community_groups");
  const q = query(groupsRef, where("tags", "array-contains", searchTerm.toLowerCase()), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityGroup));
}


// ─── Membership ──────────────────────────────────────────────────────────────


export async function joinGroup(userId: string, groupId: string, role: GroupMembership["role"] = "member"): Promise<void> {
  const memberRef = doc(db, "community_groups", groupId, "members", userId);
  await setDoc(memberRef, { userId, groupId, role, joinedAt: serverTimestamp() });
  const groupRef = doc(db, "community_groups", groupId);
  await updateDoc(groupRef, { memberCount: increment(1) });
}


export async function leaveGroup(userId: string, groupId: string): Promise<void> {
  const memberRef = doc(db, "community_groups", groupId, "members", userId);
  await deleteDoc(memberRef);
  const groupRef = doc(db, "community_groups", groupId);
  await updateDoc(groupRef, { memberCount: increment(-1) });
}


export async function isMember(userId: string, groupId: string): Promise<boolean> {
  const memberRef = doc(db, "community_groups", groupId, "members", userId);
  const snap = await getDoc(memberRef);
  return snap.exists();
}


export async function getUserGroups(userId: string): Promise<string[]> {
  const groups: string[] = [];
  const groupsSnap = await getDocs(collection(db, "community_groups"));
  for (const groupDoc of groupsSnap.docs) {
    const memberRef = doc(db, "community_groups", groupDoc.id, "members", userId);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) groups.push(groupDoc.id);
  }
  return groups;
}


// ─── Posts ───────────────────────────────────────────────────────────────────


export async function createPost(data: Omit<GroupPost, "id" | "likes" | "commentCount" | "createdAt">): Promise<string> {
  const postsRef = collection(db, "community_groups", data.groupId, "posts");
  const docRef = await addDoc(postsRef, {
    ...data,
    likes: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}


export async function getGroupPosts(groupId: string, limitNum = 20): Promise<GroupPost[]> {
  const postsRef = collection(db, "community_groups", groupId, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GroupPost));
}


export async function likePost(groupId: string, postId: string): Promise<void> {
  const postRef = doc(db, "community_groups", groupId, "posts", postId);
  await updateDoc(postRef, { likes: increment(1) });
}

