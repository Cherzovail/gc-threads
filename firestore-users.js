// Firebase Firestore CDN helpers for user profiles
// Uses the same Firebase project initialized in ../Back/firebase.js

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

import { db } from './firestore.js';

const USERS_COL = 'users';

function toAppUserBase(appUser) {
  return {
    uid: appUser.uid,
    email: appUser.email,
    username: appUser.username || '',
    likesGiven: Number(appUser.likesGiven ?? 0),
    createdAt: appUser.createdAt || null
  };
}

export async function getUserByUid(uid) {
  if (!uid) return null;
  const ref = doc(db, USERS_COL, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

// Ensures the user doc exists, and sets base fields if missing.
export async function createUserIfMissing(appUser) {
  if (!appUser?.uid) return;

  const ref = doc(db, USERS_COL, appUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const base = toAppUserBase(appUser);
  await setDoc(ref, {
    ...base,
    updatedAt: serverTimestamp()
  });
}

export async function updateUserProfile(uid, fields) {
  if (!uid) return;
  const ref = doc(db, USERS_COL, uid);
  await setDoc(ref, {
    ...fields,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

