import { getCurrentUser, persistCurrentUser } from '../storage.js';
import { showError, hideError, validateUsername } from '../utils.js';
import { state } from '../state.js';
import { createUserIfMissing, updateUserProfile } from './firestore-users.js';

export function initUsernameSetup() {
  const form        = document.getElementById('usernameSetupForm');
  const input       = document.getElementById('usernameInput');
  const btnText     = document.getElementById('usernameButtonText');
  const skipBtn     = document.getElementById('skipUsernameBtn');

  if (!form) return;

  // Live button-text update
  input?.addEventListener('input', () => {
    const username = input.value.trim();
    if (username) {
      btnText.textContent = 'Continue with Username';
    } else {
      btnText.textContent = 'Continue without Username';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError('usernameError');
    const username = input?.value.trim() || '';
    saveAndContinue(username);
  });

  skipBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    // Explicit skip - proceed without username
    saveAndContinue('');
  });
}

async function saveAndContinue(username) {

  // Validate username if provided
  if (username) {
    const validation = validateUsername(username);
    if (!validation.valid) {
      showError('usernameError', validation.message);
      return;
    }
  }

  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Update user with username
  user.username = username || '';
  state.currentUser = user;
  state.currentUsername = username || user.email.split('@')[0];
  
  // Persist to localStorage
  persistCurrentUser(user);

  // Persist to Firestore (users/{uid})
  try {
    await createUserIfMissing(user);
    await updateUserProfile(user.uid, {
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error('Firestore user update failed:', err);
    // Keep redirect behavior even if Firestore fails
  }

  // Redirect to main app dashboard
  window.location.href = 'app.html';
}
