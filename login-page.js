import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { auth } from './firebase.js';
import { initLogin } from './auth/login.js';
import { persistCurrentUser } from './storage.js';
import { state } from './state.js';

const showRegisterBtn = document.getElementById('showRegisterBtn');
showRegisterBtn?.addEventListener('click', () => {
  window.location.href = 'register.html';
});

function mapFirebaseUserToAppUser(fbUser) {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    username: fbUser.displayName || (fbUser.email?.split('@')[0] ?? ''),
    likesGiven: 0,
    createdAt: fbUser.metadata?.creationTime || new Date().toISOString()
  };
}

onAuthStateChanged(auth, (fbUser) => {
  // Only redirect if the user is already authenticated in Firebase.
  // Otherwise keep login page form active.
  if (fbUser) {
    const appUser = mapFirebaseUserToAppUser(fbUser);
    state.currentUser = appUser;
    state.currentUsername = appUser.username || appUser.email.split('@')[0];
    persistCurrentUser(appUser);
    window.location.href = 'app.html';
    return;
  }

  initLogin();
});



