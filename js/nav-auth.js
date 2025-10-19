// Navigation Authentication Script
// Handles uniform navigation across all pages

function initializeNavAuth() {
    // Show auth buttons immediately (don't wait for DOMContentLoaded)
    function showAuthButtons() {
        const authSignup = document.getElementById('auth-signup');
        const authLogin = document.getElementById('auth-login');
        const userMenu = document.getElementById('user-menu');
        
        if (authSignup) authSignup.style.display = 'block';
        if (authLogin) authLogin.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
    
    // Show buttons immediately if elements exist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showAuthButtons);
    } else {
        showAuthButtons();
    }
    
    document.addEventListener('DOMContentLoaded', async function() {
        const authSignup = document.getElementById('auth-signup');
        const authLogin = document.getElementById('auth-login');
        const userMenu = document.getElementById('user-menu');
        const userEmail = document.getElementById('user-email');
        const navLogout = document.getElementById('nav-logout');
        
        // Ensure auth buttons are visible by default
        showAuthButtons();
        
        // Load config
        const SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL;
        const SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (SUPABASE_URL && SUPABASE_ANON_KEY && typeof window.supabase !== 'undefined') {
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session && session.user) {
                    // User is authenticated - show user menu, hide auth buttons
                    if (authSignup) authSignup.style.display = 'none';
                    if (authLogin) authLogin.style.display = 'none';
                    if (userMenu) userMenu.style.display = 'block';
                    if (userEmail) userEmail.textContent = session.user.email;
                    
                    // Update dashboard user name if present
                    const userName = document.getElementById('user-name');
                    if (userName) {
                        userName.textContent = session.user.user_metadata?.name || session.user.email.split('@')[0];
                    }
                    
                    console.log('✅ User authenticated in nav:', session.user.email);
                } else {
                    // User not authenticated - ensure auth links are visible
                    showAuthButtons();
                    console.log('❌ User not authenticated in nav');
                }
            } catch (error) {
                console.error('Nav auth check failed:', error);
                // On error, ensure auth links are visible
                showAuthButtons();
            }
            
            // Handle logout
            if (navLogout) {
                navLogout.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        await supabase.auth.signOut();
                        // Determine home path based on current location
                        const currentPath = window.location.pathname;
                        let homePath = '/';
                        
                        if (currentPath.includes('/apps/')) {
                            homePath = '../../';
                        } else if (currentPath.includes('/dashboard/') || currentPath.includes('/admin/')) {
                            homePath = '../';
                        }
                        
                        window.location.href = homePath;
                    } catch (error) {
                        console.error('Logout failed:', error);
                        window.location.href = '/';
                    }
                });
            }
        } else {
            // No Supabase config - ensure auth links are visible
            showAuthButtons();
        }
    });
}

// Auto-initialize
initializeNavAuth();
