// Mobile Menu Functionality for VoidSEO
// Handles mobile navigation toggle and overlay

function initializeMobileMenu() {
    document.addEventListener('DOMContentLoaded', function() {
        setupMobileMenu();
    });
}

function setupMobileMenu() {
    // Create mobile overlay if it doesn't exist
    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
    }
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    
    if (!mobileMenuBtn || !navLinks || !mobileOverlay) {
        console.log('Mobile menu elements not found');
        return;
    }
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // Close menu when clicking overlay
    mobileOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });
    
    // Close menu when clicking on a link (except user menu)
    navLinks.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && !e.target.closest('.user-menu-container')) {
            closeMobileMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Close menu on window resize if screen becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    console.log('✅ Mobile menu initialized');
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    const isOpen = navLinks.classList.contains('active');
    
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    navLinks.classList.add('active');
    mobileOverlay.classList.add('active');
    mobileMenuBtn.innerHTML = '✕';
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
    
    console.log('📱 Mobile menu opened');
}

function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    navLinks.classList.remove('active');
    mobileOverlay.classList.remove('active');
    mobileMenuBtn.innerHTML = '☰';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    console.log('📱 Mobile menu closed');
}

// Auto-initialize
initializeMobileMenu();
