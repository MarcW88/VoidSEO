// VoidSEO Waitlist Functionality
// Handles waitlist modal, form submission, and progress tracking

let currentWaitlistCount = 117;

function openWaitlistModal(plan) {
    const modal = document.getElementById('waitlistModal');
    const planInfo = document.getElementById('modal-plan-info');
    const positionNumber = document.getElementById('position-number');
    const userPosition = document.getElementById('user-position');
    
    // Update modal content based on plan
    const planMessages = {
        builder: "Get exclusive early access to Builder plan + 50% off launch pricing",
        studio: "Join the Studio waitlist for founder pricing + exclusive features"
    };
    
    if (planInfo) planInfo.textContent = planMessages[plan] || planMessages.builder;
    if (positionNumber) positionNumber.textContent = currentWaitlistCount + 1;
    if (userPosition) userPosition.textContent = currentWaitlistCount + 1;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Store selected plan
    modal.setAttribute('data-plan', plan);
}

function closeWaitlistModal() {
    const modal = document.getElementById('waitlistModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('waitlistForm');
    const successMessage = document.getElementById('success-message');
    
    if (form) form.style.display = 'block';
    if (successMessage) successMessage.style.display = 'none';
    
    // Reset form fields
    const formElement = document.getElementById('waitlistForm');
    if (formElement) formElement.reset();
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('waitlistModal');
    if (event.target === modal) {
        closeWaitlistModal();
    }
});

// Handle waitlist form submission
document.addEventListener('DOMContentLoaded', function() {
    const waitlistForm = document.getElementById('waitlistForm');
    
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(waitlistForm);
            const email = formData.get('email');
            const name = formData.get('name');
            const useCase = formData.get('use-case');
            const plan = document.getElementById('waitlistModal').getAttribute('data-plan');
            
            // Submit to waitlist
            submitToWaitlist({
                email: email,
                name: name,
                useCase: useCase,
                plan: plan,
                timestamp: new Date().toISOString()
            });
        });
    }
});

function submitToWaitlist(data) {
    // Show loading state
    const submitBtn = document.querySelector('#waitlistForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Joining waitlist...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Update waitlist count
        currentWaitlistCount++;
        updateWaitlistProgress();
        
        // Store in localStorage (for demo purposes)
        const waitlistData = JSON.parse(localStorage.getItem('voidseo_waitlist') || '[]');
        waitlistData.push({
            ...data,
            position: currentWaitlistCount,
            id: Date.now()
        });
        localStorage.setItem('voidseo_waitlist', JSON.stringify(waitlistData));
        
        // Show success message
        showWaitlistSuccess(currentWaitlistCount);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Send to analytics
        trackWaitlistSignup(data);
        
        // TODO: Replace with real API call
        // await fetch('/api/waitlist', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        
    }, 1500);
}

function showWaitlistSuccess(position) {
    const form = document.getElementById('waitlistForm');
    const successMessage = document.getElementById('success-message');
    const finalPosition = document.getElementById('final-position');
    
    if (form) form.style.display = 'none';
    if (successMessage) successMessage.style.display = 'block';
    if (finalPosition) finalPosition.textContent = position;
}

function updateWaitlistProgress() {
    const currentCountElements = document.querySelectorAll('.current-count');
    const progressFill = document.querySelector('.progress-fill');
    const userPositionElements = document.querySelectorAll('#user-position');
    
    currentCountElements.forEach(el => {
        el.textContent = currentWaitlistCount;
    });
    
    userPositionElements.forEach(el => {
        el.textContent = currentWaitlistCount + 1;
    });
    
    if (progressFill) {
        const percentage = Math.min((currentWaitlistCount / 500) * 100, 100);
        progressFill.style.width = percentage + '%';
    }
}

function trackWaitlistSignup(data) {
    // Analytics tracking
    console.log('Waitlist signup:', data);
    
    // TODO: Replace with real analytics
    // Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'waitlist_signup', {
    //         'plan': data.plan,
    //         'use_case': data.useCase
    //     });
    // }
    
    // Facebook Pixel
    // if (typeof fbq !== 'undefined') {
    //     fbq('track', 'Lead', {
    //         content_name: 'VoidSEO Waitlist',
    //         content_category: data.plan
    //     });
    // }
}

// Initialize waitlist count from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const waitlistData = JSON.parse(localStorage.getItem('voidseo_waitlist') || '[]');
    if (waitlistData.length > 0) {
        currentWaitlistCount = Math.max(117, 117 + waitlistData.length);
        updateWaitlistProgress();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        closeWaitlistModal();
    }
});
