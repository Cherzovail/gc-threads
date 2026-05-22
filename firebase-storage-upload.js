import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';

import { storage } from './firebase-storage.js';

export async function uploadAttachment(file, uid) {
  if (!file) return '';

  const safeUid = uid || 'anon';
  const path = `attachments/${safeUid}/${Date.now()}-${file.name}`;

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

