// VoidSEO Premium Interactions & Micro-animations
// Week 4: Final polish for startup pitch

class VoidInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupScrollReveal();
        this.setupCounterAnimations();
        this.setupTypingEffect();
        this.setupSmoothScrolling();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.setupLoadingStates();
        this.setupProgressBars();
    }
    
    // Scroll reveal animations
    setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Add scroll-reveal class to elements that should animate in
        const revealElements = document.querySelectorAll('.card, .testimonials .card, .metric-number');
        revealElements.forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });
    }
    
    // Counter animations for metrics
    setupCounterAnimations() {
        const counters = document.querySelectorAll('.metric-number, [data-counter]');
        
        const animateCounter = (element) => {
            const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target.toLocaleString();
                    if (element.textContent.includes('%')) {
                        element.textContent += '%';
                    }
                }
            };
            
            updateCounter();
        };
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        counters.forEach(counter => counterObserver.observe(counter));
    }
    
    // Typing effect for hero text
    setupTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-effect');
        
        typingElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--void-accent)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    // Remove cursor after typing is done
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 1000);
                }
            };
            
            // Start typing after a delay
            setTimeout(typeWriter, 500);
        });
    }
    
    // Smooth scrolling for anchor links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Subtle parallax effects
    setupParallaxEffects() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }
    
    // Enhanced hover effects
    setupHoverEffects() {
        // Card tilt effect
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                card.style.transform = 'translateY(-8px) rotateX(5deg)';
            });
            
            card.addEventListener('mouseleave', (e) => {
                card.style.transform = 'translateY(0) rotateX(0)';
            });
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        });
        
        // Button ripple effect
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    // Loading states for buttons
    setupLoadingStates() {
        const loadingButtons = document.querySelectorAll('[data-loading]');
        
        loadingButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.classList.contains('loading')) return;
                
                const originalText = this.textContent;
                this.classList.add('loading');
                this.textContent = 'Loading...';
                this.disabled = true;
                
                // Simulate loading (replace with actual async operation)
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = originalText;
                    this.disabled = false;
                }, 2000);
            });
        });
    }
    
    // Animated progress bars
    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        const animateProgress = (bar) => {
            const fill = bar.querySelector('.progress-fill');
            const targetWidth = fill.style.width || fill.dataset.width || '0%';
            
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, 100);
        };
        
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgress(entry.target);
                    progressObserver.unobserve(entry.target);
                }
            });
        });
        
        progressBars.forEach(bar => progressObserver.observe(bar));
    }
    
    // Add floating labels for form inputs
    setupFloatingLabels() {
        const inputs = document.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                input.addEventListener('focus', () => {
                    label.classList.add('floating');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        label.classList.remove('floating');
                    }
                });
                
                // Check if input has value on load
                if (input.value) {
                    label.classList.add('floating');
                }
            }
        });
    }
    
    // Add toast notifications
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Animate out
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Add page transition effects
    setupPageTransitions() {
        // Fade out on link click
        document.querySelectorAll('a:not([href^="#"]):not([target="_blank"])').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.hostname === window.location.hostname) {
                    e.preventDefault();
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        window.location = this.href;
                    }, 300);
                }
            });
        });
        
        // Fade in on page load
        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });
    }
}

// CSS for interactions
const interactionStyles = `
<style>
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.floating {
    transform: translateY(-20px);
    font-size: 0.8rem;
    color: var(--void-accent);
}

.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    background: var(--void-accent);
}

.toast-error {
    background: var(--void-red);
}

.toast-info {
    background: var(--void-blue);
}

body {
    transition: opacity 0.3s ease;
}
</style>
`;

// Initialize interactions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add interaction styles
    document.head.insertAdjacentHTML('beforeend', interactionStyles);
    
    // Initialize interactions
    window.voidInteractions = new VoidInteractions();
    
    console.log('🎨 VoidSEO Premium Interactions loaded');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoidInteractions;
}
