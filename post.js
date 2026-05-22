import { state } from './state.js';
import { createNotification } from './notification.js';
import { listAllPosts, createPost } from './firestore-posts.js';
import { uploadAttachment } from './firebase-storage-upload.js';
import { getActiveConcernCategory, setActiveConcernCategory } from './post-filters.js';

export { getActiveConcernCategory, setActiveConcernCategory };

function createPostCard(post) {
  const liked = state.currentUser ? post.likedBy?.includes(state.currentUser.email) : false;
  const disliked = state.currentUser ? post.dislikedBy?.includes(state.currentUser.email) : false;

  const attachmentHTML = post.attachmentUrl
    ? `<div class="post-attachment">📎 <a href="${post.attachmentUrl}" target="_blank" rel="noopener">Open attachment</a></div>`
    : '';

  // Keep same UI style as before, but use attachmentUrl instead of attachmentName.
  return `
    <div class="post-card-inner">
      <div class="post-header">
        <div class="post-avatar">${post.authorName?.charAt(0).toUpperCase() || 'G'}</div>
        <div class="post-info">
          <div class="post-author">${post.authorName || 'Anonymous'}</div>
          <div class="post-meta">
            <span class="category-badge">${post.category}</span>
            <span class="post-time">${new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div class="post-content">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-text">${post.content}</p>
        ${post.location ? `<div class="post-location">📍 ${post.location}</div>` : ''}
        ${attachmentHTML}
      </div>

      <div class="post-actions">
        <button class="action-btn like ${liked ? 'active' : ''}" type="button" onclick="window.likePost('${post.id}')">
          👍 <span>${post.likes || 0}</span>
        </button>
        <button class="action-btn dislike ${disliked ? 'active' : ''}" type="button" onclick="window.dislikePost('${post.id}')">
          👎 <span>${post.dislikes || 0}</span>
        </button>
      </div>
    </div>
  `;
}

async function renderPosts(containerId, filterFn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const all = await listAllPosts();
  const filtered = all.filter(filterFn);

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">No concerns found.</div>';
    return;
  }

  // Concerns page sorts by createdAt asc/desc earlier; keep consistent.
  filtered
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = createPostCard(post);
      container.appendChild(card);
    });
}

export async function loadHomePosts() {
  const container = document.getElementById('homePageContent');
  if (!container) return;

  const all = await listAllPosts();
  const home = all
    .slice()
    .sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = '';
  home.forEach(post => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = createPostCard(post);
    container.appendChild(card);
  });
}

export async function loadConcerns(category = 'All') {
  setActiveConcernCategory(category);

  const containerId = 'concernsPageContent';
  const categoryLabel = category && category !== 'All' ? category : null;

  const container = document.getElementById(containerId);
  if (!container) return;

  const all = await listAllPosts();
  let filtered = all.filter(p => !p.resolved);
  if (categoryLabel) filtered = filtered.filter(p => p.category === categoryLabel);

  const concernsCountEl = document.getElementById('concernsCount');
  if (concernsCountEl) concernsCountEl.textContent = `${filtered.length} Total Concerns`;

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">No concerns found.</div>';
    return;
  }

  filtered
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = createPostCard(post);
      container.appendChild(card);
    });
}

export async function refreshFeeds() {
  await loadHomePosts();
  await loadConcerns(getActiveConcernCategory());
}

export function initPostPage() {
  const form = document.getElementById('postForm');
  const closeBtn = document.getElementById('closePostBtn');
  const submitBtn = document.getElementById('submitPostBtn');
  const errorEl = document.getElementById('postError');
  const categoryEl = document.getElementById('postCategory');
  const titleEl = document.getElementById('postTitle');
  const contentEl = document.getElementById('postContent');
  const locationEl = document.getElementById('postLocation');
  const attachmentEl = document.getElementById('postAttachment');
  const attachmentLabel = document.getElementById('postAttachmentLabel');

  // Upload Modal Elements
  const uploadModal = document.getElementById('uploadModal');
  const uploadCategory = document.getElementById('uploadCategory');
  const uploadFile = document.getElementById('uploadFile');
  const uploadFileLabel = document.getElementById('uploadFileLabel');
  const closeUploadModal = document.getElementById('closeUploadModal');
  const cancelUploadBtn = document.getElementById('cancelUploadBtn');
  const confirmUploadBtn = document.getElementById('confirmUploadBtn');
  const uploadError = document.getElementById('uploadError');
  const modalOverlay = document.getElementById('modalOverlay');

  // Store the file and category when modal is used
  let selectedFile = null;
  let selectedCategory = '';

  // Hide the actual file input and show modal instead
  if (attachmentEl) {
    attachmentEl.style.display = 'none';
  }

  // Open modal when clicking the attachment label area
  if (attachmentLabel && uploadModal) {
    attachmentLabel.style.cursor = 'pointer';
    attachmentLabel.addEventListener('click', () => {
      uploadModal.classList.remove('hidden');
      uploadCategory.value = '';
      uploadFile.value = '';
      uploadFileLabel.textContent = 'No file selected';
      uploadError.classList.add('hidden');
      selectedFile = null;
      selectedCategory = '';
    });
  }

  // Handle file selection in modal
  if (uploadFile && uploadFileLabel) {
    uploadFile.addEventListener('change', () => {
      uploadFileLabel.textContent = uploadFile.files && uploadFile.files[0]
        ? uploadFile.files[0].name
        : 'No file selected';
      selectedFile = uploadFile.files && uploadFile.files[0] ? uploadFile.files[0] : null;
    });
  }

  // Close modal functions
  const closeModal = () => {
    if (uploadModal) uploadModal.classList.add('hidden');
    selectedFile = null;
    selectedCategory = '';
  };

  if (closeUploadModal) closeUploadModal.addEventListener('click', closeModal);
  if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  // Confirm upload button
  if (confirmUploadBtn) {
    confirmUploadBtn.addEventListener('click', () => {
      if (uploadError) uploadError.classList.add('hidden');

      selectedCategory = uploadCategory?.value || '';
      if (!selectedCategory) {
        if (uploadError) {
          uploadError.textContent = 'Please select a category.';
          uploadError.classList.remove('hidden');
        }
        return;
      }

      if (!selectedFile) {
        if (uploadError) {
          uploadError.textContent = 'Please select a file.';
          uploadError.classList.remove('hidden');
        }
        return;
      }

      // Set form values and close modal
      if (categoryEl) categoryEl.value = selectedCategory;
      if (attachmentLabel) attachmentLabel.textContent = selectedFile.name;
      if (attachmentEl) attachmentEl.files = uploadFile.files;

      closeModal();
    });
  }

  const showErr = (msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  };
  const hideErr = () => {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  };

  closeBtn?.addEventListener('click', async () => {
    const { showAppPage } = await import('./utils.js');
    showAppPage('homePage');
  });

  submitBtn?.addEventListener('click', () => form?.requestSubmit());

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideErr();

    const user = state.currentUser;
    if (!user) return showErr('Please sign in first.');

    const category = categoryEl?.value;
    const title = titleEl?.value?.trim();
    const content = contentEl?.value?.trim();
    const location = locationEl?.value?.trim();
    const file = attachmentEl?.files?.[0] || null;

    if (!category) return showErr('Select a category.');
    if (!title) return showErr('Title is required.');
    if (!content) return showErr('Description is required.');

    try {
      let attachmentUrl = '';
      if (file) attachmentUrl = await uploadAttachment(file, user.uid);

      const attachmentName = file ? file.name : '';

      const postId = await createPost({
        category,
        title,
        content,
        location: location || '',
        attachmentUrl: attachmentUrl || '',
        authorName: user.username || user.email.split('@')[0],
        authorEmail: user.email,
        trending: category === 'Events',
        resolved: false,
        attachmentName
      });

      // reset form
      form.reset();
      if (attachmentLabel) attachmentLabel.textContent = 'No file selected';

      await refreshFeeds();

      const { showAppPage } = await import('./utils.js');
      showAppPage('homePage');

      // notification (still localStorage)
      createNotification('create', `${user.username || user.email.split('@')[0]} created a post: ${title}`, postId);
    } catch (err) {
      showErr(err?.message || 'Failed to create post.');
    }
  });
}

export async function likePost(postId) {
  // Existing like/dislike in your app previously updated localStorage.
  // Implementing Firestore atomic updates properly requires updateDoc/arrayUnion.
  // For now, we keep UI responsive by re-fetching after update using a simpler approach.
  // TODO: Convert to arrayUnion/transaction.
  const { updatePostLikes } = await import('./firestore-posts.js');

  const user = state.currentUser;
  if (!user) return;

  const all = await listAllPosts();
  const post = all.find(p => p.id === postId);
  if (!post) return;

  let likedBy = Array.isArray(post.likedBy) ? post.likedBy.slice() : [];
  let dislikedBy = Array.isArray(post.dislikedBy) ? post.dislikedBy.slice() : [];

  if (!likedBy.includes(user.email)) likedBy.push(user.email);
  dislikedBy = dislikedBy.filter(e => e !== user.email);

  await updatePostLikes(postId, {
    likedBy,
    dislikedBy,
    likes: likedBy.length,
    dislikes: dislikedBy.length
  });

  await refreshFeeds();
  createNotification('like', `${user.username || user.email.split('@')[0]} liked: ${post.title}`, postId);
}

export async function dislikePost(postId) {
  const { updatePostLikes } = await import('./firestore-posts.js');

  const user = state.currentUser;
  if (!user) return;

  const all = await listAllPosts();
  const post = all.find(p => p.id === postId);
  if (!post) return;

  let likedBy = Array.isArray(post.likedBy) ? post.likedBy.slice() : [];
  let dislikedBy = Array.isArray(post.dislikedBy) ? post.dislikedBy.slice() : [];

  if (!dislikedBy.includes(user.email)) dislikedBy.push(user.email);
  likedBy = likedBy.filter(e => e !== user.email);

  await updatePostLikes(postId, {
    likedBy,
    dislikedBy,
    likes: likedBy.length,
    dislikes: dislikedBy.length
  });

  await refreshFeeds();
  createNotification('dislike', `${user.username || user.email.split('@')[0]} disliked: ${post.title}`, postId);
}

