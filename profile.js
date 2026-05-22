import { state } from '../state.js';
import { clearSession, persistCurrentUser } from '../storage.js';
import { showError, hideError, validateUsername, updateUserDisplay, getCategoryClass } from '../utils.js';
import { listAllPosts } from '../firestore-posts.js';
import { createUserIfMissing, updateUserProfile } from './firestore-users.js';

function buildHistoryCardHTML(post) {
  return `
    <div class="post-header">
      <div class="post-avatar">${post.authorName?.charAt(0).toUpperCase() || 'G'}</div>
      <div class="post-info">
        <div class="post-author">${post.authorName || 'Anonymous'}</div>
        <div class="post-meta">
          <span class="category-badge ${getCategoryClass ? getCategoryClass(post.category) : ''}">${post.category}</span>
          <span class="post-time">${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
    <div class="post-content-text">
      <h4>${post.title}</h4>
      <p>${post.content}</p>
      ${post.location ? `<div class="post-location">📍 ${post.location}</div>` : ''}
      ${post.attachmentUrl ? `<div class="post-attachment">📎 <a href="${post.attachmentUrl}" target="_blank" rel="noopener">View attachment</a></div>` : ''}
    </div>
    <div class="profile-post-actions">
      <button class="action-btn danger" type="button" onclick="deleteUserPost('${post.id}')">Delete</button>
    </div>`;
}

async function renderUserPostHistory() {
  if (!state.currentUser) return;
  const container = document.getElementById('userPostsHistory');
  if (!container) return;

  try {
    const allPosts = await listAllPosts();
    const posts = allPosts.filter(post => post.authorEmail === state.currentUser.email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = '';
    if (posts.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#64748b;">No posts yet. Create one from the Create Post button.</div>';
      return;
    }

    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = buildHistoryCardHTML(post);
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#d32f2f;">Error loading posts. Please refresh.</div>';
  }
}

export async function refreshProfile() {
  if (!state.currentUser) return;
  try {
    const allPosts = await listAllPosts();
    const userPostsCount = allPosts.filter(post => post.authorEmail === state.currentUser.email).length;
    document.getElementById('userPostsCount').textContent = String(userPostsCount);
    document.getElementById('userLikesCount').textContent = String(state.currentUser.likesGiven || 0);
    updateUserDisplay();
    await renderUserPostHistory();
  } catch (err) {
    console.error('Error refreshing profile:', err);
  }
}

export function initProfile() {
  const logoutBtn = document.getElementById('logoutBtn');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const closeEditModal = document.getElementById('closeEditModal');
  const editProfileModal = document.getElementById('editProfileModal');
  const editProfileForm = document.getElementById('editProfileForm');
  const editUsernameInput = document.getElementById('editUsernameInput');

  logoutBtn?.addEventListener('click', async () => {
    try {
      // Clear local app session
      clearSession();
      state.currentUser = null;
      state.currentUsername = null;

      // Sign out of Firebase (so onAuthStateChanged redirects correctly)
      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js');
      const { auth } = await import('./firebase.js');
      await signOut(auth);
    } catch (_) {
      // If Firebase sign-out fails, still redirect.
    }
    window.location.href = 'index.html';
  });

  editProfileBtn?.addEventListener('click', () => {
    if (state.currentUser) {
      editUsernameInput.value = state.currentUser.username || '';
      editProfileModal?.classList.add('active');
      editProfileModal?.style.setProperty('display', 'flex');
    }
  });

  closeEditModal?.addEventListener('click', () => {
    editProfileModal?.classList.remove('active');
    editProfileModal?.style.removeProperty('display');
  });

  editProfileModal?.addEventListener('click', (event) => {
    if (event.target === editProfileModal) {
      editProfileModal?.classList.remove('active');
      editProfileModal?.style.removeProperty('display');
    }
  });

  editProfileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    hideError('editProfileError');
    const username = editUsernameInput?.value.trim() || '';
    const validation = validateUsername(username);
    if (!validation.valid) {
      showError('editProfileError', validation.message);
      return;
    }

    if (state.currentUser) {
      state.currentUser.username = username;
      state.currentUsername = username || state.currentUser.email.split('@')[0];
      persistCurrentUser(state.currentUser);

      // Persist to Firestore (users/{uid})
      (async () => {
        try {
          await createUserIfMissing(state.currentUser);
          await updateUserProfile(state.currentUser.uid, {
            username: state.currentUser.username,
            email: state.currentUser.email
          });
        } catch (err) {
          console.error('Firestore profile update failed:', err);
        }
      })();

      refreshProfile();
    }

    editProfileModal?.classList.remove('active');
    editProfileModal?.style.removeProperty('display');
  });
}
