import { showError, hideError } from './utils.js';
import { orgAdminLogin, registerOrganization } from './auth/org-login.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { auth } from './firebase.js';

function showOrgAdminTab(tabName) {
  // Hide all forms
  document.querySelectorAll('.auth-tab-content').forEach(form => form.classList.add('hidden'));
  
  // Hide all error messages
  document.querySelectorAll('.error-message').forEach(err => err.classList.add('hidden'));

  // Deactivate all tabs
  document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));

  // Show selected form/tab
  if (tabName === 'org-login') {
    document.getElementById('orgLoginForm')?.classList.remove('hidden');
    document.querySelector('[data-tab="org-login"]')?.classList.add('active');
  } else if (tabName === 'admin-login') {
    document.getElementById('adminLoginForm')?.classList.remove('hidden');
    document.querySelector('[data-tab="admin-login"]')?.classList.add('active');
  } else if (tabName === 'org-register') {
    document.getElementById('orgRegisterForm')?.classList.remove('hidden');
  }
}

export function initOrgAdminAuth() {
  const orgLoginForm = document.getElementById('orgLoginForm');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const orgRegisterForm = document.getElementById('orgRegisterForm');
  const authTabBtns = document.querySelectorAll('.auth-tab-btn');
  const showOrgLoginBtn = document.getElementById('showOrgLoginBtn');
  const showOrgRegisterBtn = document.getElementById('showOrgRegisterBtn');

  // Tab switcher
  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      showOrgAdminTab(tabName);
    });
  });

  // Show/hide register form
  showOrgRegisterBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    showOrgAdminTab('org-register');
  });

  showOrgLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    showOrgAdminTab('org-login');
  });

  // Organization Login
  orgLoginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('orgLoginError');

    const email = document.getElementById('orgLoginEmail')?.value?.trim();
    const password = document.getElementById('orgLoginPassword')?.value?.trim();

    if (!email || !password) {
      showError('orgLoginError', 'Email and password are required.');
      return;
    }

    try {
      const orgUser = await orgAdminLogin(email, password);
      
      // Store org user in sessionStorage
      sessionStorage.setItem('gcthreads_org_user', JSON.stringify(orgUser));
      
      // Redirect to org dashboard
      window.location.href = 'org-dashboard.html';
    } catch (err) {
      showError('orgLoginError', err.message || 'Login failed. Please check your credentials.');
    }
  });

  // Organization Registration
  orgRegisterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('orgRegisterError');

    const name = document.getElementById('orgName')?.value?.trim();
    const email = document.getElementById('orgEmail')?.value?.trim();
    const adminEmail = document.getElementById('adminEmail')?.value?.trim();
    const adminPassword = document.getElementById('adminPassword')?.value?.trim();

    if (!name || !email || !adminEmail || !adminPassword) {
      showError('orgRegisterError', 'All fields are required.');
      return;
    }

    if (adminPassword.length < 6) {
      showError('orgRegisterError', 'Password must be at least 6 characters.');
      return;
    }

    try {
      const orgUser = await registerOrganization({
        name,
        email,
        adminEmail,
        adminPassword
      });

      // Show success
      document.getElementById('orgRegisterForm').style.display = 'none';
      const successMsg = document.createElement('div');
      successMsg.className = 'info-box';
      successMsg.style.color = '#065f46';
      successMsg.style.background = '#ecfdf5';
      successMsg.style.borderLeftColor = '#059669';
      successMsg.innerHTML = `
        <strong>Registration Successful!</strong><br>
        Your organization has been registered. 
        <a href="org-login.html" style="color: #059669; text-decoration: underline;">Click here to login</a>
      `;
      document.querySelector('.login-card').appendChild(successMsg);
    } catch (err) {
      showError('orgRegisterError', err.message || 'Registration failed. Please try again.');
    }
  });

  // Admin Login
  adminLoginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('adminLoginError');

    const email = document.getElementById('adminLoginEmail')?.value?.trim();
    const password = document.getElementById('adminLoginPassword')?.value?.trim();

    if (!email || !password) {
      showError('adminLoginError', 'Email and password are required.');
      return;
    }

    try {
      const adminUser = await orgAdminLogin(email, password);

      if (adminUser.userType !== 'admin') {
        showError('adminLoginError', 'Access denied. This account is not authorized as admin.');
        return;
      }
      
      // Store admin user in sessionStorage
      sessionStorage.setItem('gcthreads_admin_user', JSON.stringify(adminUser));
      
      // Redirect to admin dashboard
      window.location.href = 'admin-dashboard.html';
    } catch (err) {
      showError('adminLoginError', err.message || 'Login failed. Please check your credentials.');
    }
  });
}

// Check if already logged in
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    const orgUser = sessionStorage.getItem('gcthreads_org_user');
    const adminUser = sessionStorage.getItem('gcthreads_admin_user');

    if (orgUser) {
      window.location.href = 'org-dashboard.html';
    } else if (adminUser) {
      window.location.href = 'admin-dashboard.html';
    }
  }
});

initOrgAdminAuth();
