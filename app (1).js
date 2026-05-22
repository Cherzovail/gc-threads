import { initializeDefaultData, getCurrentUser } from './storage.js';
import { showPage, showAppPage } from './utils.js';
import { initLogin } from './auth/login.js';
import { initRegister } from './auth/register.js';
import { initUsernameSetup } from './auth/username.js';

import { initNavigation } from './navigation.js';
import { initDashboard } from './pages/dashboard.js';
import { initConcerns } from './pages/concerns.js';
import { initPostPage, likePost, dislikePost, refreshFeeds } from './post.js';
import { initCalendar, changeMonth } from './pages/calendar.js';
import { initProfile, refreshProfile } from './pages/profile.js';
import { initNotifications } from './notification.js';
import { state } from './state.js';

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { auth } from './firebase.js';


function restoreSession() {
  // NOTE: this app still stores app-profile data in localStorage.
  // Firebase auth just gates access; localStorage should contain mapped user.
  const user = getCurrentUser();
  if (!user) return false;

  state.currentUser = user;
  state.currentUsername = user.username || user.email.split('@')[0];
  showPage('mainApp');
  showAppPage('homePage');
  refreshFeeds();
  refreshProfile();
  return true;
}


function initializeApp() {
  initializeDefaultData();

  // Auth init functions are safe to call because they are guarded
  // in the auth modules (they check DOM elements and/or auth state).
  // This keeps login flow working if app is loaded after auth.
  initLogin();
  initRegister();
  initUsernameSetup();

  initNavigation();

  initDashboard();
  initConcerns();
  initPostPage();
  initCalendar();
  initProfile();
  initNotifications();


  document.getElementById('prevMonthBtn')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonthBtn')?.addEventListener('click', () => changeMonth(1));

  // No-op guards: elements are optional so app should not crash if absent.

  document.getElementById('prevMonthFullBtn')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonthFullBtn')?.addEventListener('click', () => changeMonth(1));
  document.getElementById('viewFullCalendarBtn')?.addEventListener('click', () => showAppPage('fullCalendarPage'));
  document.getElementById('closeFullCalendarBtn')?.addEventListener('click', () => showAppPage('calendarPage'));

  window.likePost = likePost;
  window.dislikePost = dislikePost;

  onAuthStateChanged(auth, () => {
    // If local user mapping exists, restore. Otherwise redirect.
    const restored = restoreSession();
    if (!restored) window.location.href = 'index.html';
  });
}

initializeApp();

export { refreshFeeds, refreshProfile };
