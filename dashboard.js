import { state } from '../state.js';
import { loadHomePosts, createPostCard } from './post.js';

export function initDashboard() {
  const searchInput = document.getElementById('searchInput');
  const container = document.getElementById('homePageContent');

  if (!searchInput || !container) return;

  // Category pills filter is for Concerns page, but user asked:
  // "for the search posts, make a filter button for the all the categories".
  // We implement category filter for the Freedom Feed (Home) search.
  const categoryPills = document.querySelectorAll('#categoryPills .pill');
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#categoryPills .pill').forEach(item => item.classList.remove('active'));
      pill.classList.add('active');

      // Re-run search with current term (or full feed if empty)
      searchInput.dispatchEvent(new Event('input'));
    });
  });

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase();
    const activePill = document.querySelector('#categoryPills .pill.active');
    const selectedCategory = activePill?.dataset?.category || 'All';

    // If no search term, just load the home posts (sorted/trending).
    // Then apply category filter client-side.
    const basePosts = term ? state.allHomePosts : state.allHomePosts;

    let filtered = basePosts;

    // Apply category filter first (All means no filter)
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Apply text search if term exists
    if (term) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term) ||
        post.authorName.toLowerCase().includes(term)
      );
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">No posts match your search.</div>';
      return;
    }

    filtered.forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = createPostCard(post);
      container.appendChild(card);
    });
  });

}
