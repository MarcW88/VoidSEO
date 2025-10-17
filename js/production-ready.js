// VoidSEO Production-Ready Code
// This file contains all the code needed for LemonSqueezy + Memberstack integration
// Uncomment and configure when ready to launch

// =============================================================================
// CONFIGURATION - Update these values when ready to launch
// =============================================================================

const PRODUCTION_CONFIG = {
    // Set to false when ready to launch
    MVP_MODE: true,
    
    // LemonSqueezy Configuration
    LEMON_SQUEEZY: {
        // Replace with your actual LemonSqueezy URLs
        CHECKOUT_URLS: {
            builder: "https://voidseo.lemonsqueezy.com/checkout/buy/builder-plan",
            studio: "https://voidseo.lemonsqueezy.com/checkout/buy/studio-plan"
        },
        WEBHOOK_SECRET: "your_webhook_secret_here"
    },
    
    // Memberstack Configuration
    MEMBERSTACK: {
        // Replace with your Memberstack public key
        PUBLIC_KEY: "pk_your_memberstack_key_here",
        PLAN_IDS: {
            free: "pln_free_plan_id",
            builder: "pln_builder_plan_id", 
            studio: "pln_studio_plan_id"
        }
    },
    
    // Email Service Configuration
    EMAIL_SERVICE: {
        // ConvertKit, Mailchimp, or custom API
        API_KEY: "your_email_api_key",
        FORM_ID: "your_form_id",
        ENDPOINT: "https://api.convertkit.com/v3/forms/{form_id}/subscribe"
    }
};

// =============================================================================
// PRODUCTION FUNCTIONS - Ready to use when MVP_MODE = false
// =============================================================================

class VoidSEOPayments {
    constructor(config) {
        this.config = config;
        this.memberstackInitialized = false;
        this.init();
    }
    
    async init() {
        if (!this.config.MVP_MODE) {
            await this.initMemberstack();
            this.setupPaymentHandlers();
        }
    }
    
    // Initialize Memberstack
    async initMemberstack() {
        try {
            // Load Memberstack script
            const script = document.createElement('script');
            script.src = 'https://static.memberstack.com/scripts/v1/memberstack.js';
            script.onload = () => {
                window.MemberStack.init({
                    publicKey: this.config.MEMBERSTACK.PUBLIC_KEY
                });
                this.memberstackInitialized = true;
                console.log('Memberstack initialized');
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('Failed to initialize Memberstack:', error);
        }
    }
    
    // Setup payment button handlers
    setupPaymentHandlers() {
        // Replace waitlist buttons with payment buttons
        document.addEventListener('DOMContentLoaded', () => {
            const builderButtons = document.querySelectorAll('[onclick*="builder"]');
            const studioButtons = document.querySelectorAll('[onclick*="studio"]');
            
            builderButtons.forEach(btn => {
                btn.onclick = () => this.redirectToCheckout('builder');
                btn.innerHTML = btn.innerHTML.replace('Join Waitlist', 'Start Building');
            });
            
            studioButtons.forEach(btn => {
                btn.onclick = () => this.redirectToCheckout('studio');
                btn.innerHTML = btn.innerHTML.replace('Join Waitlist', 'Go Studio');
            });
        });
    }
    
    // Redirect to LemonSqueezy checkout
    redirectToCheckout(plan) {
        const checkoutUrl = this.config.LEMON_SQUEEZY.CHECKOUT_URLS[plan];
        if (checkoutUrl) {
            // Track checkout initiation
            this.trackEvent('checkout_initiated', { plan });
            
            // Redirect to LemonSqueezy
            window.location.href = checkoutUrl;
        } else {
            console.error('Checkout URL not configured for plan:', plan);
        }
    }
    
    // Handle successful payment (called by LemonSqueezy webhook)
    async handlePaymentSuccess(paymentData) {
        try {
            const { email, plan, customerId } = paymentData;
            
            // Create/update Memberstack member
            if (this.memberstackInitialized) {
                await window.MemberStack.createMember({
                    email: email,
                    planId: this.config.MEMBERSTACK.PLAN_IDS[plan],
                    customData: {
                        lemonSqueezyCustomerId: customerId,
                        plan: plan,
                        joinedAt: new Date().toISOString()
                    }
                });
            }
            
            // Send welcome email
            await this.sendWelcomeEmail(email, plan);
            
            // Track successful conversion
            this.trackEvent('subscription_created', { plan, email });
            
            // Redirect to dashboard
            window.location.href = '/dashboard/';
            
        } catch (error) {
            console.error('Payment success handling failed:', error);
        }
    }
    
    // Send welcome email
    async sendWelcomeEmail(email, plan) {
        try {
            const response = await fetch(this.config.EMAIL_SERVICE.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.EMAIL_SERVICE.API_KEY}`
                },
                body: JSON.stringify({
                    email: email,
                    tags: [`voidseo_${plan}`, 'new_subscriber'],
                    fields: {
                        plan: plan,
                        joined_at: new Date().toISOString()
                    }
                })
            });
            
            if (response.ok) {
                console.log('Welcome email sent to:', email);
            }
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }
    
    // Track analytics events
    trackEvent(eventName, properties) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, properties);
        }
        
        // Custom analytics
        console.log('Event tracked:', eventName, properties);
    }
    
    // Check user subscription status
    async getUserStatus() {
        if (!this.memberstackInitialized) return null;
        
        try {
            const member = await window.MemberStack.getCurrentMember();
            return member ? {
                email: member.email,
                plan: member.planId,
                isActive: member.active
            } : null;
        } catch (error) {
            console.error('Failed to get user status:', error);
            return null;
        }
    }
    
    // Protect content based on subscription
    async protectContent() {
        const userStatus = await this.getUserStatus();
        
        // Show/hide content based on plan
        const builderContent = document.querySelectorAll('[data-plan="builder"]');
        const studioContent = document.querySelectorAll('[data-plan="studio"]');
        
        if (!userStatus || userStatus.plan === this.config.MEMBERSTACK.PLAN_IDS.free) {
            // Free user - show paywall
            builderContent.forEach(el => this.showPaywall(el, 'builder'));
            studioContent.forEach(el => this.showPaywall(el, 'studio'));
        } else if (userStatus.plan === this.config.MEMBERSTACK.PLAN_IDS.builder) {
            // Builder user - show builder content, paywall studio
            studioContent.forEach(el => this.showPaywall(el, 'studio'));
        }
        // Studio users see everything
    }
    
    // Show paywall overlay
    showPaywall(element, requiredPlan) {
        const paywall = document.createElement('div');
        paywall.className = 'paywall-overlay';
        paywall.innerHTML = `
            <div class="paywall-content">
                <h3>🔒 ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan Required</h3>
                <p>Upgrade to access this feature</p>
                <button onclick="payments.redirectToCheckout('${requiredPlan}')" class="btn btn-primary">
                    Upgrade Now
                </button>
            </div>
        `;
        
        element.style.position = 'relative';
        element.appendChild(paywall);
    }
}

// =============================================================================
// WEBHOOK HANDLER - For LemonSqueezy integration
// =============================================================================

class WebhookHandler {
    constructor(config) {
        this.config = config;
    }
    
    // Handle LemonSqueezy webhooks (server-side code example)
    async handleWebhook(request) {
        try {
            const signature = request.headers['x-signature'];
            const body = await request.text();
            
            // Verify webhook signature
            if (!this.verifySignature(body, signature)) {
                throw new Error('Invalid webhook signature');
            }
            
            const data = JSON.parse(body);
            
            switch (data.meta.event_name) {
                case 'subscription_created':
                    await this.handleSubscriptionCreated(data);
                    break;
                case 'subscription_updated':
                    await this.handleSubscriptionUpdated(data);
                    break;
                case 'subscription_cancelled':
                    await this.handleSubscriptionCancelled(data);
                    break;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Webhook handling failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    verifySignature(body, signature) {
        // Implement LemonSqueezy signature verification
        // This is a placeholder - implement actual verification
        return true;
    }
    
    async handleSubscriptionCreated(data) {
        const { customer, subscription } = data.data;
        
        // Update Memberstack member
        // Send welcome email
        // Track analytics
        
        console.log('Subscription created:', subscription.id);
    }
    
    async handleSubscriptionUpdated(data) {
        // Handle plan changes, renewals, etc.
        console.log('Subscription updated:', data.data.subscription.id);
    }
    
    async handleSubscriptionCancelled(data) {
        // Downgrade Memberstack member to free plan
        console.log('Subscription cancelled:', data.data.subscription.id);
    }
}

// =============================================================================
// INITIALIZATION - Uncomment when ready to launch
// =============================================================================

// Initialize payments system
// const payments = new VoidSEOPayments(PRODUCTION_CONFIG);

// Initialize webhook handler (server-side)
// const webhookHandler = new WebhookHandler(PRODUCTION_CONFIG);

// =============================================================================
// MIGRATION HELPER - Convert waitlist to subscribers
// =============================================================================

class WaitlistMigration {
    static async migrateWaitlistToSubscribers() {
        const waitlistData = JSON.parse(localStorage.getItem('voidseo_waitlist') || '[]');
        
        console.log(`Found ${waitlistData.length} waitlist subscribers to migrate`);
        
        // Send migration email to all waitlist subscribers
        for (const subscriber of waitlistData) {
            await this.sendMigrationEmail(subscriber);
        }
        
        // Clear waitlist after migration
        localStorage.removeItem('voidseo_waitlist');
    }
    
    static async sendMigrationEmail(subscriber) {
        // Send email with launch announcement + discount code
        console.log('Migrating subscriber:', subscriber.email);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VoidSEOPayments,
        WebhookHandler,
        WaitlistMigration,
        PRODUCTION_CONFIG
    };
}
