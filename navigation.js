import { showAppPage } from './utils.js';

export function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (!page) return;

      // Map bottom-nav tabs to actual section ids in Front/app.html
      // home -> homePage
      // concerns -> concernsPage
      // post -> postPage
      // calendar -> calendarPage
      // profile -> profilePage
      const nextPage =
        page === 'post' ? 'postPage' :
        page === 'calendar' ? 'calendarPage' :
        page === 'concerns' ? 'concernsPage' :
        page === 'profile' ? 'profilePage' :
        'homePage';

      showAppPage(nextPage);

    });
  });

  document.getElementById('homeLogoBtn')?.addEventListener('click', () => {
    showAppPage('homePage');
  });
}
