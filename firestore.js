// Firebase Firestore CDN helpers
// Uses the same Firebase project initialized in ../Back/firebase.js

import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { app } from './firebase.js';

export const db = getFirestore(app);

