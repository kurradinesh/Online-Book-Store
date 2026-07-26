/**
 * AUTHENTICATION SUBSYSTEM ENGINE
 * User Session Management, Role-Based Access Control (RBAC), and Persistence
 */

// Retrieve registered user array from persistent local storage
function getUsers() {
  const users = localStorage.getItem('booknook_users');
  return users ? JSON.parse(users) : [];
}

// Persist user array to storage
function saveUsers(users) {
  localStorage.setItem('booknook_users', JSON.stringify(users));
}

// User Registration Handler
function registerUser(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'User with this email already exists.' };
  }
  
  users.push({ name, email, password, isAdmin: false });
  saveUsers(users);
  return { success: true, message: 'Registration successful. You can now log in.' };
}

// Login Handler with Administrator Intercept
function loginUser(email, password) {
  // Master Administrator Hardcoded Credentials for Prototype Testing
  if (email === "admin@booknook.com" && password === "admin123") {
    const admin = { name: "System Admin", email, isAdmin: true };
    localStorage.setItem('currentUser', JSON.stringify(admin));
    return { success: true, user: admin };
  }
  
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const logged = { name: user.name, email, isAdmin: false };
    localStorage.setItem('currentUser', JSON.stringify(logged));
    return { success: true, user: logged };
  }
  
  return { success: false, message: 'Invalid email or password.' };
}

// Get the currently active user session
function getCurrentUser() {
  const cu = localStorage.getItem('currentUser');
  return cu ? JSON.parse(cu) : null;
}

// Route Security Helper: Returns true if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Route Security Helper: Returns true if the active session has Admin privileges
function isAdminLoggedIn() {
  const user = getCurrentUser();
  return user && user.isAdmin === true;
}

// Global Logout Controller
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  localStorage.removeItem('booknook_cart'); // Clear cart on logout for security

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'));
  }

  // Route logic: Redirect to home or login page based on current location
  if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('cart.html')) {
    window.location.href = 'index.html';
  } else {
    window.location.reload();
  }
}

// Expose Auth functions to Global Scope for cross-module integration
window.getUsers = getUsers;
window.saveUsers = saveUsers;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.isAdminLoggedIn = isAdminLoggedIn;
window.logout = logout;

// Security Guard: Immediately protect admin routes if someone tries to access directly
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('admin.html') && !isAdminLoggedIn()) {
    showToast('Unauthorized access detected.', 'error');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
  }
});