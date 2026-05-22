import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

import { db } from './firestore.js';

const POSTS_COL = 'posts';

function normalizeDoc(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    category: d.category ?? 'General',
    title: d.title ?? '',
    content: d.content ?? '',
    location: d.location ?? '',
    attachmentUrl: d.attachmentUrl ?? '',
    authorName: d.authorName ?? '',
    authorEmail: d.authorEmail ?? '',
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : (d.createdAt ?? new Date().toISOString()),
    likes: Number(d.likes ?? 0),
    dislikes: Number(d.dislikes ?? 0),
    likedBy: Array.isArray(d.likedBy) ? d.likedBy : [],
    dislikedBy: Array.isArray(d.dislikedBy) ? d.dislikedBy : [],
    trending: Boolean(d.trending ?? false),
    resolved: Boolean(d.resolved ?? false)
  };
}

export async function listAllPosts() {
  const snap = await getDocs(collection(db, POSTS_COL));
  return snap.docs.map(normalizeDoc);
}

export async function listPostsByAuthorEmail(email) {
  if (!email) return [];
  const q = query(collection(db, POSTS_COL), where('authorEmail', '==', email));
  const snap = await getDocs(q);
  return snap.docs.map(normalizeDoc);
}

export async function createPost(payload) {
  const doc = await addDoc(collection(db, POSTS_COL), {
    category: payload.category,
    title: payload.title,
    content: payload.content,
    location: payload.location || '',
    attachmentUrl: payload.attachmentUrl || '',
    authorName: payload.authorName,
    authorEmail: payload.authorEmail,
    createdAt: serverTimestamp(),
    likes: 0,
    dislikes: 0,
    likedBy: [],
    dislikedBy: [],
    trending: Boolean(payload.trending),
    resolved: Boolean(payload.resolved)
  });
  return doc.id;
}

export async function updatePostLikes(postId, { likedBy, dislikedBy, likes, dislikes }) {
  // avoid importing updateDoc to keep this module simple if not needed elsewhere.
  // We'll do dynamic import where necessary.
  const { updateDoc, doc, } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js');
  const ref = doc(db, POSTS_COL, postId);
  await updateDoc(ref, {
    likedBy,
    dislikedBy,
    likes,
    dislikes
  });
}

