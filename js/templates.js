// VoidSEO Templates Page Enhancements
// Adds interactive elements and improved UX to the templates page

document.addEventListener('DOMContentLoaded', function() {
    
    // Template form handling
    const templateForm = document.querySelector('.template-form');
    if (templateForm) {
        templateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = '⏳ Subscribing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Success state
                submitBtn.textContent = '✅ Subscribed!';
                submitBtn.style.background = '#2ecc71';
                
                // Store email for demo
                localStorage.setItem('voidseo_template_subscriber', email);
                
                // Reset after delay
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 2000);
                
                // Track subscription
                console.log('Template subscription:', email);
                
            }, 1500);
        });
    }
    
    // Template card hover effects
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const phaseLetters = this.querySelectorAll('.phase-letter');
            phaseLetters.forEach(letter => {
                letter.style.transform = 'scale(1.1)';
                letter.style.transition = 'transform 0.3s ease';
            });
        });
        
        card.addEventListener('mouseleave', function() {
            const phaseLetters = this.querySelectorAll('.phase-letter');
            phaseLetters.forEach(letter => {
                letter.style.transform = 'scale(1)';
            });
        });
    });
    
    // Timeline step animation on scroll
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target.querySelector('.timeline-circle');
                const content = entry.target.querySelector('.timeline-content');
                
                if (circle && content) {
                    circle.style.animation = 'bounceIn 0.6s ease-out';
                    content.style.animation = 'fadeInUp 0.8s ease-out 0.2s both';
                }
            }
        });
    }, observerOptions);
    
    const timelineSteps = document.querySelectorAll('.timeline-step');
    timelineSteps.forEach(step => {
        timelineObserver.observe(step);
    });
    
    // Download tracking
    const downloadLinks = document.querySelectorAll('a[download], a[href*=".zip"], a[href*=".md"]');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const fileName = this.getAttribute('href').split('/').pop();
            const linkText = this.textContent.trim();
            
            // Track download
            console.log('Template download:', {
                file: fileName,
                button: linkText,
                timestamp: new Date().toISOString()
            });
            
            // Visual feedback
            const originalText = this.innerHTML;
            this.innerHTML = '⬇️ Downloading...';
            
            setTimeout(() => {
                this.innerHTML = '✅ Downloaded!';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 1500);
            }, 500);
        });
    });
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Example card interaction
    const exampleCards = document.querySelectorAll('.example-card');
    exampleCards.forEach(card => {
        card.addEventListener('click', function() {
            const impactText = this.querySelector('.example-impact');
            if (impactText) {
                impactText.style.background = 'rgba(0, 255, 153, 0.2)';
                impactText.style.transform = 'scale(1.02)';
                impactText.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    impactText.style.background = 'rgba(0, 255, 153, 0.1)';
                    impactText.style.transform = 'scale(1)';
                }, 1000);
            }
        });
    });
    
    // Progress tracking for template usage
    function trackTemplateProgress() {
        const visited = JSON.parse(localStorage.getItem('voidseo_templates_visited') || '[]');
        const currentTemplate = window.location.pathname.split('/').pop();
        
        if (currentTemplate && !visited.includes(currentTemplate)) {
            visited.push(currentTemplate);
            localStorage.setItem('voidseo_templates_visited', JSON.stringify(visited));
            
            // Show progress indicator
            if (visited.length > 1) {
                showProgressNotification(visited.length);
            }
        }
    }
    
    function showProgressNotification(count) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--void-accent);
                color: var(--void-black);
                padding: 15px 20px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 1000;
                animation: slideInRight 0.5s ease-out;
            ">
                🎯 Progress: ${count}/4 templates explored!
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Initialize progress tracking
    trackTemplateProgress();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeInUp {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
        }
        
        @keyframes slideOutRight {
            0% { transform: translateX(0); }
            100% { transform: translateX(100%); }
        }
        
        .template-card:hover {
            transform: translateY(-5px);
            transition: transform 0.3s ease;
        }
        
        .example-card {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .example-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 255, 153, 0.15);
        }
    `;
    
    document.head.appendChild(style);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        trackTemplateProgress,
        showProgressNotification
    };
}
