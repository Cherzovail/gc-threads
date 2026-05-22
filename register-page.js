import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { auth } from './firebase.js';
import { initRegister } from './auth/register.js';
import { persistCurrentUser } from './storage.js';
import { state } from './state.js';

const showLoginBtn = document.getElementById('showLoginBtn');
showLoginBtn?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

function mapFirebaseUserToAppUser(fbUser) {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    username: fbUser.displayName || '',
    likesGiven: 0,
    createdAt: fbUser.metadata?.creationTime || new Date().toISOString()
  };
}

onAuthStateChanged(auth, (fbUser) => {
  if (fbUser) {
    const appUser = mapFirebaseUserToAppUser(fbUser);
    state.currentUser = appUser;
    state.currentUsername = fbUser.email?.split('@')[0] || '';
    persistCurrentUser(appUser);
    // New users must finish username setup
    window.location.href = 'username.html';
    return;
  }

  initRegister();
});




