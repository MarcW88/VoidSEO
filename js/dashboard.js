// VoidSEO Dashboard JavaScript
// Handles dashboard functionality for Free Tier users

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    // Check authentication
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
        return; // Auth system will handle redirect
    }
    
    // Initialize dashboard components
    setupUserInterface();
    setupInteractiveElements();
    loadDashboardData();
}

async function checkAuthentication() {
    // If VoidSEOAuth is available, use it
    if (window.VoidSEOAuth) {
        return await window.VoidSEOAuth.requireAuth();
    }
    
    // Demo mode - always authenticated on dashboard
    return true;
}

function setupUserInterface() {
    // Setup subscription management
    const manageSubscriptionBtn = document.getElementById('manage-subscription');
    if (manageSubscriptionBtn) {
        manageSubscriptionBtn.addEventListener('click', handleSubscriptionManagement);
    }
    
    // Setup app demo interactions
    setupAppDemos();
    
    // Setup community interactions
    setupCommunityFeatures();
    
    // Setup upgrade prompts
    setupUpgradePrompts();
}

function setupInteractiveElements() {
    // Animate stats on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStatNumber(entry.target);
                }
            });
        });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    // Setup tooltips for locked features
    setupTooltips();
    
    // Setup smooth scrolling for internal links
    setupSmoothScrolling();
}

function setupAppDemos() {
    // Add demo data refresh functionality
    const appCards = document.querySelectorAll('.app-card.demo');
    
    appCards.forEach(card => {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-outline btn-sm';
        refreshBtn.textContent = '🔄 Refresh Demo Data';
        refreshBtn.style.marginTop = '10px';
        
        refreshBtn.addEventListener('click', () => {
            refreshDemoData(card);
        });
        
        const actionsContainer = card.querySelector('.app-actions');
        if (actionsContainer) {
            actionsContainer.appendChild(refreshBtn);
        }
    });
}

function refreshDemoData(appCard) {
    const dataRows = appCard.querySelectorAll('.data-row strong');
    
    // Animate refresh
    dataRows.forEach(row => {
        row.style.opacity = '0.5';
        row.textContent = '...';
    });
    
    // Simulate data loading
    setTimeout(() => {
        dataRows.forEach((row, index) => {
            let newValue;
            
            // Generate realistic demo data based on the app
            if (appCard.querySelector('h3').textContent.includes('PAA Explorer')) {
                const values = ['156', '1,847', '34'];
                newValue = values[index] || Math.floor(Math.random() * 1000);
            } else if (appCard.querySelector('h3').textContent.includes('AI Overview')) {
                const values = ['203', '127', '-8.7%'];
                newValue = values[index] || Math.floor(Math.random() * 200);
            }
            
            row.textContent = newValue;
            row.style.opacity = '1';
            
            // Add a subtle flash effect
            row.style.background = 'var(--void-accent)';
            row.style.color = 'var(--void-black)';
            row.style.padding = '2px 6px';
            row.style.borderRadius = '3px';
            
            setTimeout(() => {
                row.style.background = 'transparent';
                row.style.color = 'var(--void-accent)';
                row.style.padding = '0';
            }, 1000);
        });
    }, 1500);
}

function setupCommunityFeatures() {
    // Add interaction to discussion items
    const discussionItems = document.querySelectorAll('.discussion-item');
    
    discussionItems.forEach(item => {
        item.addEventListener('click', () => {
            // Simulate opening discussion
            const title = item.querySelector('h5').textContent;
            showMessage(`Opening discussion: "${title}"`, 'info');
            
            // In a real implementation, this would navigate to the discussion
            setTimeout(() => {
                window.location.href = '/community/';
            }, 1000);
        });
        
        // Add hover effect
        item.style.cursor = 'pointer';
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(5px)';
            item.style.transition = 'transform 0.2s ease';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });
}

function setupUpgradePrompts() {
    // Track upgrade button clicks
    const upgradeButtons = document.querySelectorAll('a[href*="upgrade"]');
    
    upgradeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Track the upgrade intent
            trackUpgradeIntent(btn.textContent);
            
            // For now, show a coming soon message
            e.preventDefault();
            showUpgradeModal();
        });
    });
}

function showUpgradeModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal-overlay';
    modal.innerHTML = `
        <div class="upgrade-modal">
            <div class="upgrade-modal-header">
                <h3>🚀 Builder Tier Coming Soon</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="upgrade-modal-content">
                <p>We're putting the finishing touches on the Builder tier!</p>
                <p>Join our waitlist to get notified when it launches with <strong>50% off</strong> for early adopters.</p>
                
                <div class="upgrade-benefits-preview">
                    <div class="benefit-preview">⚡ Live data in all apps</div>
                    <div class="benefit-preview">📄 Download all templates</div>
                    <div class="benefit-preview">🔬 Submit to private lab</div>
                    <div class="benefit-preview">💬 Unlimited community access</div>
                </div>
                
                <div class="upgrade-modal-actions">
                    <button class="btn btn-primary" onclick="joinWaitlist()">Join Waitlist</button>
                    <button class="btn btn-secondary modal-close">Maybe Later</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 10, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    document.body.appendChild(modal);
    
    // Setup close functionality
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function joinWaitlist() {
    // Redirect to waitlist signup
    window.location.href = '/pricing/';
}

function setupTooltips() {
    // Add tooltips to locked features
    const lockedElements = document.querySelectorAll('.locked-overlay, .learn-card.locked');
    
    lockedElements.forEach(element => {
        element.title = 'Available in Builder Tier - Upgrade to unlock';
        
        element.addEventListener('mouseenter', (e) => {
            showTooltip(e.target, 'Available in Builder Tier ▌');
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--void-dark);
        color: var(--void-white);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.8rem;
        border: 1px solid var(--void-accent);
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    
    // Remove tooltip after delay
    setTimeout(() => {
        if (tooltip.parentNode) {
            document.body.removeChild(tooltip);
        }
    }, 3000);
    
    // Remove on mouse leave
    element.addEventListener('mouseleave', () => {
        if (tooltip.parentNode) {
            document.body.removeChild(tooltip);
        }
    }, { once: true });
}

function setupSmoothScrolling() {
    // Smooth scroll for anchor links within the dashboard
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function animateStatNumber(element) {
    const finalValue = element.textContent;
    const isInfinity = finalValue === '∞';
    
    if (isInfinity) {
        // Special animation for infinity symbol
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.5s ease';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 500);
        return;
    }
    
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
    if (isNaN(numericValue)) return;
    
    let currentValue = 0;
    const increment = Math.ceil(numericValue / 30);
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
            currentValue = numericValue;
            clearInterval(timer);
        }
        
        // Preserve any non-numeric characters
        const suffix = finalValue.replace(/[\d,]/g, '');
        element.textContent = currentValue.toLocaleString() + suffix;
    }, 50);
}

function loadDashboardData() {
    // Simulate loading recent activity
    setTimeout(() => {
        updateRecentActivity();
    }, 1000);
    
    // Update community stats periodically
    setInterval(() => {
        updateCommunityStats();
    }, 30000); // Every 30 seconds
}

function updateRecentActivity() {
    // Add a subtle indicator that data is fresh
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        const header = section.querySelector('.section-header h2');
        if (header) {
            const indicator = document.createElement('span');
            indicator.textContent = '●';
            indicator.style.cssText = `
                color: var(--void-accent);
                margin-left: 8px;
                font-size: 0.6rem;
                animation: pulse 2s infinite;
            `;
            header.appendChild(indicator);
            
            // Remove indicator after a few seconds
            setTimeout(() => {
                if (indicator.parentNode) {
                    header.removeChild(indicator);
                }
            }, 5000);
        }
    });
}

function updateCommunityStats() {
    const statNumbers = document.querySelectorAll('.community-stat .stat-number');
    
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent);
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newValue = Math.max(0, currentValue + variation);
        
        if (newValue !== currentValue) {
            stat.textContent = newValue;
            stat.style.color = variation > 0 ? 'var(--void-accent)' : 'var(--void-white)';
            
            setTimeout(() => {
                stat.style.color = 'var(--void-accent)';
            }, 1000);
        }
    });
}

function handleSubscriptionManagement() {
    showMessage('Newsletter preferences updated!', 'success');
    
    // In a real implementation, this would open a preferences modal
    // For now, just show a confirmation
    const button = document.getElementById('manage-subscription');
    const originalText = button.textContent;
    button.textContent = '✓ Updated';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

function trackUpgradeIntent(buttonText) {
    // Track upgrade button clicks for analytics
    console.log('Upgrade intent tracked:', buttonText);
    
    // In a real implementation, send to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'upgrade_intent', {
            'button_text': buttonText,
            'page': window.location.pathname
        });
    }
}

function showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `dashboard-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--void-dark);
        color: var(--void-white);
        padding: 12px 20px;
        border-radius: 6px;
        border-left: 4px solid var(--void-accent);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    if (type === 'error') {
        toast.style.borderLeftColor = 'var(--void-red)';
    } else if (type === 'success') {
        toast.style.borderLeftColor = 'var(--void-accent)';
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add CSS for modal and animations
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .upgrade-modal {
        background: var(--void-dark);
        border: 2px solid var(--void-accent);
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .upgrade-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--void-gray);
    }
    
    .upgrade-modal-header h3 {
        margin: 0;
        color: var(--void-accent);
    }
    
    .modal-close {
        background: none;
        border: none;
        color: var(--void-light-gray);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-close:hover {
        color: var(--void-white);
    }
    
    .upgrade-modal-content {
        padding: 20px;
    }
    
    .upgrade-benefits-preview {
        margin: 20px 0;
        display: grid;
        gap: 10px;
    }
    
    .benefit-preview {
        background: rgba(0, 255, 153, 0.1);
        padding: 10px;
        border-radius: 6px;
        border-left: 3px solid var(--void-accent);
        font-size: 0.9rem;
    }
    
    .upgrade-modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    
    .upgrade-modal-actions .btn {
        flex: 1;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;

document.head.appendChild(dashboardStyles);
