// VoidSEO App Protection System
// Ensures apps are only accessible to authenticated users

// Configuration
const APP_URLS = {
    'paa-explorer': 'https://paa-explorer.netlify.app/paa-explorer/',
    'ai-detector': 'https://app.voidseo.dev/ai-detector',
    // Add more apps here as they're created
};

// Initialize app protection
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Initializing app protection...');
    
    // Wait for auth system to initialize
    setTimeout(() => {
        setupAppProtection();
    }, 1000);
});

// Setup protection for app links
function setupAppProtection() {
    // Find all app launch buttons
    const appButtons = document.querySelectorAll('a[href*="paa-explorer.netlify.app"], a[href*="app.voidseo.dev"], a[href*="Launch"], a[href*="Try demo"]');
    
    appButtons.forEach(button => {
        // Skip if already protected
        if (button.hasAttribute('data-protected')) return;
        
        // Mark as protected
        button.setAttribute('data-protected', 'true');
        
        // Store original href
        const originalHref = button.href;
        button.setAttribute('data-original-href', originalHref);
        
        // Replace click handler
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            console.log('🔒 App access attempt:', originalHref);
            
            // Check authentication
            const isAuthenticated = await checkAuthentication();
            
            if (isAuthenticated) {
                console.log('✅ User authenticated, allowing app access');
                
                // Show loading state
                showAppLoading(button);
                
                // Open app in new tab
                setTimeout(() => {
                    window.open(originalHref, '_blank');
                    hideAppLoading(button);
                }, 1000);
                
            } else {
                console.log('❌ User not authenticated, redirecting to signup');
                handleUnauthenticatedAccess(button);
            }
        });
    });
    
    console.log(`🔒 Protected ${appButtons.length} app buttons`);
}

// Check if user is authenticated
async function checkAuthentication() {
    // Check if VoidSEOAuth is available
    if (window.VoidSEOAuth && window.VoidSEOAuth.isAuthenticated) {
        try {
            return await window.VoidSEOAuth.isAuthenticated();
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }
    
    // Fallback: check for demo mode (development)
    const currentPath = window.location.pathname;
    if (currentPath.includes('/dashboard/')) {
        return true; // Assume authenticated if on dashboard
    }
    
    return false;
}

// Handle unauthenticated access attempt
function handleUnauthenticatedAccess(button) {
    // Create modal overlay
    const modal = createAuthModal();
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Setup modal close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    [closeBtn, overlay].forEach(el => {
        if (el) {
            el.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
        }
    });
}

// Create authentication modal
function createAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">×</button>
            <div class="modal-header">
                <h2>🔒 Apps Access Required</h2>
                <p>Create a free account to access VoidSEO apps</p>
            </div>
            
            <div class="modal-body">
                <div class="auth-benefits">
                    <h3>What you get with a free account:</h3>
                    <ul>
                        <li>✅ <strong>PAA Explorer</strong> - Real Google PAA scraping & clustering</li>
                        <li>✅ <strong>AI Overview Detector</strong> - Check which queries trigger AI</li>
                        <li>✅ <strong>Demo data access</strong> - Test all features</li>
                        <li>✅ <strong>VOID Loop framework</strong> - Complete methodology</li>
                        <li>✅ <strong>Community access</strong> - Join SEO builders</li>
                    </ul>
                </div>
                
                <div class="auth-limits">
                    <p><strong>Free tier limits:</strong> 3 analyses/day, demo data only</p>
                    <p><em>Upgrade anytime for unlimited access + real data</em></p>
                </div>
            </div>
            
            <div class="modal-actions">
                <a href="/signup/" class="btn btn-primary btn-full">
                    🚀 Create Free Account
                </a>
                <a href="/login/" class="btn btn-secondary btn-full">
                    🔐 Already have an account? Login
                </a>
            </div>
            
            <div class="modal-footer">
                <p>No credit card required • 2-minute setup • Cancel anytime</p>
            </div>
        </div>
    `;
    
    return modal;
}

// Show loading state on app button
function showAppLoading(button) {
    button.style.position = 'relative';
    button.style.pointerEvents = 'none';
    
    const loader = document.createElement('span');
    loader.className = 'app-loader';
    loader.innerHTML = '🚀 Launching...';
    loader.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 255, 153, 0.9);
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
        font-weight: bold;
    `;
    
    button.appendChild(loader);
}

// Hide loading state
function hideAppLoading(button) {
    const loader = button.querySelector('.app-loader');
    if (loader) {
        loader.remove();
    }
    button.style.pointerEvents = 'auto';
}

// Add CSS styles
const styles = `
<style>
.auth-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.auth-modal.show {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    max-width: 500px;
    margin: 50px auto;
    background: #111;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 2rem;
    max-height: 90vh;
    overflow-y: auto;
    transform: translateY(-20px);
    transition: transform 0.3s ease;
}

.auth-modal.show .modal-content {
    transform: translateY(0);
}

.modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #888;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    line-height: 1;
}

.modal-close:hover {
    color: #fff;
}

.modal-header {
    text-align: center;
    margin-bottom: 2rem;
}

.modal-header h2 {
    color: #00ff99;
    margin-bottom: 0.5rem;
}

.modal-header p {
    color: #888;
}

.auth-benefits {
    margin-bottom: 1.5rem;
}

.auth-benefits h3 {
    color: #fff;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.auth-benefits ul {
    list-style: none;
    padding: 0;
}

.auth-benefits li {
    padding: 0.5rem 0;
    color: #ccc;
    border-bottom: 1px solid #333;
}

.auth-benefits li:last-child {
    border-bottom: none;
}

.auth-limits {
    background: #222;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border-left: 4px solid #00ff99;
}

.auth-limits p {
    margin: 0.5rem 0;
    color: #ccc;
    font-size: 0.9rem;
}

.modal-actions {
    margin-bottom: 1.5rem;
}

.btn-full {
    width: 100%;
    margin-bottom: 1rem;
    text-align: center;
}

.modal-footer {
    text-align: center;
}

.modal-footer p {
    color: #888;
    font-size: 0.85rem;
    margin: 0;
}

@media (max-width: 768px) {
    .modal-content {
        margin: 20px;
        padding: 1.5rem;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', styles);
