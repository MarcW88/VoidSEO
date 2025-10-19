// Auth Fallback Script - Ensures auth buttons are always visible
// This script runs immediately to show auth buttons as fallback

(function() {
    'use strict';
    
    function ensureAuthButtonsVisible() {
        const authSignup = document.getElementById('auth-signup');
        const authLogin = document.getElementById('auth-login');
        const userMenu = document.getElementById('user-menu');
        
        if (authSignup) {
            authSignup.style.display = 'block';
            console.log('✅ Fallback: Auth signup button made visible');
        }
        if (authLogin) {
            authLogin.style.display = 'block';
            console.log('✅ Fallback: Auth login button made visible');
        }
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
    
    // Run immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureAuthButtonsVisible);
    } else {
        ensureAuthButtonsVisible();
    }
    
    // Also run after a short delay as additional fallback
    setTimeout(ensureAuthButtonsVisible, 100);
})();
