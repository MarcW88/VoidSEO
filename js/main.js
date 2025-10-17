// VoidSEO - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for anchor links
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

    // Sticky navigation active state
    const stickyNav = document.querySelector('.sticky-nav');
    if (stickyNav) {
        const navLinks = stickyNav.querySelectorAll('a');
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // VOID Loop cycle animation
    const cycleSteps = document.querySelectorAll('.cycle-step');
    if (cycleSteps.length > 0) {
        let currentStep = 0;
        
        function animateCycle() {
            cycleSteps.forEach((step, index) => {
                const letter = step.querySelector('.cycle-letter');
                if (index === currentStep) {
                    letter.style.background = 'var(--void-accent)';
                    letter.style.color = 'var(--void-black)';
                    letter.style.transform = 'scale(1.1)';
                } else {
                    letter.style.background = 'transparent';
                    letter.style.color = 'var(--void-accent)';
                    letter.style.transform = 'scale(1)';
                }
            });
            
            currentStep = (currentStep + 1) % cycleSteps.length;
        }
        
        // Start animation
        setInterval(animateCycle, 2000);
    }

    // Fade in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.card, .section').forEach(el => {
        observer.observe(el);
    });

    // Terminal-like typing effect for hero
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
    // Copy to clipboard functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-copy');
            try {
                await navigator.clipboard.writeText(text);
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    });

    // Glitch effect on hover
    document.querySelectorAll('.glitch').forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.setAttribute('data-text', element.textContent);
        });
    });

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`VoidSEO loaded in ${loadTime}ms`);
        });
    }

    // Dark mode toggle (if needed)
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('light-mode') ? 'false' : 'true');
        });

        // Load saved preference
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'false') {
            document.body.classList.add('light-mode');
        }
    }

    // Console easter egg
    console.log(`
    ╔══════════════════════════════════════╗
    ║            VoidSEO v1.0              ║
    ║        The VOID Loop Framework       ║
    ║                                      ║
    ║  Build smarter. Dive deeper.         ║
    ║                                      ║
    ║  → Vision → Objective →              ║
    ║  → Implementation → Deep Dive →      ║
    ║                                      ║
    ║  Interested in the code?             ║
    ║  Check out our GitHub repo!          ║
    ╚══════════════════════════════════════╝
    `);
});

// Utility functions
const VoidSEO = {
    // Smooth scroll to element
    scrollTo: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Show notification
    notify: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Format code blocks
    formatCode: () => {
        document.querySelectorAll('pre code').forEach(block => {
            // Add line numbers
            const lines = block.textContent.split('\n');
            const numberedLines = lines.map((line, index) => 
                `<span class="line-number">${index + 1}</span>${line}`
            ).join('\n');
            block.innerHTML = numberedLines;
        });
    },

    // Initialize tooltips
    initTooltips: () => {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = e.target.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                
                setTimeout(() => tooltip.classList.add('show'), 100);
            });
            
            element.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.classList.remove('show');
                    setTimeout(() => document.body.removeChild(tooltip), 200);
                }
            });
        });
    }
};

// Initialize additional features
document.addEventListener('DOMContentLoaded', () => {
    VoidSEO.formatCode();
    VoidSEO.initTooltips();
});
