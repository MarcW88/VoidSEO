// VoidSEO Authentication System
// Using Supabase for authentication and user management

// Supabase configuration - will be loaded from environment
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

// Initialize Supabase client
let supabase;

// Load configuration from meta tags (set by server)
function loadConfig() {
    const urlMeta = document.querySelector('meta[name="supabase-url"]');
    const keyMeta = document.querySelector('meta[name="supabase-anon-key"]');
    
    if (urlMeta && keyMeta) {
        SUPABASE_URL = urlMeta.content;
        SUPABASE_ANON_KEY = keyMeta.content;
        return true;
    }
    
    // Fallback: try to load from window object (if set by build process)
    if (window.NEXT_PUBLIC_SUPABASE_URL && window.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL;
        SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        return true;
    }
    
    return false;
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', function() {
    // Load configuration
    const configLoaded = loadConfig();
    
    // Initialize Supabase if config is available
    if (configLoaded && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        initializeAuth();
    } else {
        console.warn('Supabase configuration not found or library not loaded. Using demo mode.');
        initializeDemoMode();
    }
});

// Initialize authentication system
async function initializeAuth() {
    console.log('🔧 Testing Supabase connection...');
    console.log('📡 Supabase URL:', SUPABASE_URL);
    console.log('🔑 Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    try {
        // Test simple connection first
        console.log('🔧 Testing basic Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('*').limit(1);
        
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            console.error('Full error:', error);
            showMessage('❌ Database connection failed. Using demo mode.', 'error');
            initializeDemoMode();
            return;
        }
        console.log('✅ Supabase connection successful, profiles table accessible');
        
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            handleAuthenticatedUser(session.user);
        } else {
            handleUnauthenticatedUser();
        }
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                handleAuthenticatedUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                handleUnauthenticatedUser();
            }
        });
        
        // Setup form handlers
        setupFormHandlers();
        
    } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        showMessage('❌ Authentication failed. Using demo mode.', 'error');
        initializeDemoMode();
    }
}

// Demo mode for development/testing
function initializeDemoMode() {
    console.log('Running in demo mode - no actual authentication');
    
    // Check if we're on a protected page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/dashboard/')) {
        // Simulate logged in user for dashboard
        handleAuthenticatedUser({
            email: 'demo@voidseo.dev',
            user_metadata: { name: 'Demo User' }
        });
    }
    
    setupDemoFormHandlers();
}

// Handle authenticated user
function handleAuthenticatedUser(user) {
    const currentPath = window.location.pathname;
    
    console.log('🔐 User authenticated:', user.email, 'Current path:', currentPath);
    
    // Update UI elements
    updateUserInterface(user);
    
    // STOP REDIRECTIONS - Show permanent manual link
    if (currentPath.includes('/login/') || currentPath.includes('/signup/')) {
        console.log('✅ User authenticated - showing permanent dashboard link');
        
        // Create permanent success message that doesn't disappear
        const messageContainer = document.querySelector('.auth-form') || document.body;
        const existingMessage = document.getElementById('permanent-success-message');
        
        if (!existingMessage) {
            const permanentMessage = document.createElement('div');
            permanentMessage.id = 'permanent-success-message';
            permanentMessage.innerHTML = `
                <div style="background: rgba(0, 255, 153, 0.1); border: 2px solid #00ff99; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #00ff99; margin: 0 0 15px 0;">✅ Connexion Réussie !</h3>
                    <p style="color: #fff; margin: 0 0 15px 0;">Connecté en tant que: <strong>${user.email}</strong></p>
                    <a href="../dashboard/free.html" style="display: inline-block; background: #00ff99; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: all 0.3s;">
                        🚀 Accéder au Dashboard
                    </a>
                </div>
            `;
            messageContainer.insertBefore(permanentMessage, messageContainer.firstChild);
        }
    }
}

// Handle unauthenticated user
function handleUnauthenticatedUser() {
    const currentPath = window.location.pathname;
    
    console.log('❌ User NOT authenticated. Current path:', currentPath);
    
    // Show manual login link if on protected pages
    if (currentPath.includes('/dashboard/')) {
        console.log('❌ On protected page but not authenticated');
        showMessage(`❌ Non connecté. <br><a href="../login/" style="color: #ff6b6b; text-decoration: underline;">🔐 Se connecter</a>`, 'error');
        return;
    }
    
    // Update UI for guest user
    updateGuestInterface();
}

// Update UI for authenticated user
function updateUserInterface(user) {
    const userName = user.user_metadata?.name || user.email.split('@')[0];
    
    // Update user name displays
    const userNameElements = document.querySelectorAll('#user-name, #welcome-name, #dropdown-name');
    userNameElements.forEach(el => {
        if (el) el.textContent = userName;
    });
    
    // Setup user menu
    setupUserMenu();
}

// Update UI for guest user
function updateGuestInterface() {
    // Hide user-specific elements
    const userElements = document.querySelectorAll('.user-dropdown, #user-menu');
    userElements.forEach(el => {
        if (el) el.style.display = 'none';
    });
}

// Setup form handlers for real authentication
function setupFormHandlers() {
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Password reset form
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Password reset toggle
    const forgotPasswordLink = document.getElementById('forgot-password');
    const backToLoginBtn = document.getElementById('back-to-login');
    const loginFormContainer = document.querySelector('.auth-form-container');
    const resetFormContainer = document.getElementById('reset-form-container');
    
    if (forgotPasswordLink && resetFormContainer) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.style.display = 'none';
            resetFormContainer.style.display = 'block';
        });
    }
    
    if (backToLoginBtn && loginFormContainer) {
        backToLoginBtn.addEventListener('click', () => {
            resetFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
        });
    }
}

// Setup demo form handlers
function setupDemoFormHandlers() {
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showMessage('Account created successfully! Redirecting to confirmation...', 'success');
            setTimeout(() => {
                window.location.href = 'success.html';
            }, 1500);
        });
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showMessage('Login successful! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                const dashboardUrl = window.location.origin.includes('localhost') 
                    ? '../dashboard/free.html' 
                    : '/dashboard/free.html';
                window.location.href = dashboardUrl;
            }, 1500);
        });
    }
    
    // Setup other demo handlers
    setupUserMenu();
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    const newsletter = formData.get('newsletter');
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    newsletter_subscribed: newsletter === 'on',
                    tier: 'free'
                }
            }
        });
        
        if (error) throw error;
        
        showMessage('Account created successfully! Redirecting to confirmation...', 'success');
        
        // Redirect to success page
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 1500);
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        showMessage('Login successful! Redirecting...', 'success');
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Handle password reset
async function handlePasswordReset(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('reset-email');
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password/`
        });
        
        if (error) throw error;
        
        showMessage('Password reset email sent! Check your inbox.', 'success');
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Redirect to home page
        const homeUrl = window.location.origin.includes('localhost') 
            ? '../' 
            : '/';
        window.location.href = homeUrl;
        
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if logout fails
        window.location.href = '/';
    }
}

// Setup user menu functionality
function setupUserMenu() {
    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isVisible = userDropdown.style.display === 'block';
            userDropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });
    }
    
    // Setup logout button in dropdown
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (supabase) {
                await handleLogout(e);
            } else {
                // Demo mode logout
                const homeUrl = window.location.origin.includes('localhost') 
                    ? '../' 
                    : '/';
                window.location.href = homeUrl;
            }
        });
    }
}

// Utility functions
function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message ${type}`;
    messageEl.textContent = message;
    
    // Insert message at the top of the form container
    const formContainer = document.querySelector('.auth-form-container') || document.querySelector('.auth-container');
    if (formContainer) {
        formContainer.insertBefore(messageEl, formContainer.firstChild);
        
        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                messageEl.remove();
            }, 5000);
        }
    }
}

// Export functions for use in other scripts
window.VoidSEOAuth = {
    getCurrentUser: async () => {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    isAuthenticated: async () => {
        if (!supabase) return false;
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    },
    
    requireAuth: async () => {
        const isAuth = await window.VoidSEOAuth.isAuthenticated();
        if (!isAuth) {
            const loginUrl = window.location.origin.includes('localhost') 
                ? '../login/' 
                : '/login/';
            window.location.href = loginUrl;
            return false;
        }
        return true;
    }
};
