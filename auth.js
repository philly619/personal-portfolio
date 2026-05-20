// Authentication System

// Mock database for users (In production, use a real backend)
let users = JSON.parse(localStorage.getItem('portfolio_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ============ SIGNUP FORM HANDLER ============
if (document.getElementById('signupForm')) {
  document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('errorMessage');

    // Validation
    if (!fullname || !email || !password) {
      showError(errorDiv, 'All fields are required');
      return;
    }

    if (password.length < 6) {
      showError(errorDiv, 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showError(errorDiv, 'Passwords do not match');
      return;
    }

    if (users.some(user => user.email === email)) {
      showError(errorDiv, 'Email already registered');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      fullname: fullname,
      email: email,
      password: btoa(password), // Simple encoding (use proper hashing in production)
      createdAt: new Date().toISOString(),
      bio: '',
      jobs: [],
      cvs: []
    };

    users.push(newUser);
    localStorage.setItem('portfolio_users', JSON.stringify(users));
    
    showSuccess(errorDiv, 'Account created successfully! Redirecting to login...');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
}

// ============ LOGIN FORM HANDLER ============
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const errorDiv = document.getElementById('errorMessage');

    // Find user
    const user = users.find(u => u.email === email && u.password === btoa(password));

    if (!user) {
      showError(errorDiv, 'Invalid email or password');
      return;
    }

    // Login successful
    currentUser = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      bio: user.bio,
      jobs: user.jobs || [],
      cvs: user.cvs || []
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    if (remember) {
      localStorage.setItem('rememberMe', 'true');
    }

    showSuccess(errorDiv, 'Login successful! Redirecting...');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });
}

// ============ AUTO-FILL REMEMBERED CREDENTIALS ============
if (document.getElementById('loginForm') && localStorage.getItem('rememberMe')) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user) {
    document.getElementById('email').value = user.email;
    document.getElementById('remember').checked = true;
  }
}

// ============ LOGOUT FUNCTION ============
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('rememberMe');
  window.location.href = 'login.html';
}

// ============ CHECK AUTHENTICATION ============
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!user) {
    // Redirect to login if not authenticated
    if (window.location.pathname.includes('dashboard')) {
      window.location.href = 'login.html';
    }
    return null;
  }

  return user;
}

// ============ HELPER FUNCTIONS ============
function showError(element, message) {
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => {
    element.classList.remove('show');
  }, 4000);
}

function showSuccess(element, message) {
  element.textContent = message;
  element.style.backgroundColor = '#efe';
  element.style.color = '#3c3';
  element.style.borderColor = '#3c3';
  element.classList.add('show');
}

// ============ ON PAGE LOAD ============
document.addEventListener('DOMContentLoaded', function() {
  // Initialize users from localStorage if not exists
  if (localStorage.getItem('portfolio_users') === null) {
    localStorage.setItem('portfolio_users', JSON.stringify(users));
  }

  // Set logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});