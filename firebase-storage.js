// Firebase Storage CDN helpers

import { getStorage } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';
import { app } from './firebase.js';

export const storage = getStorage(app);

