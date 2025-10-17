// VoidSEO Configuration
// Configuration will be loaded from environment variables

const VOIDSEO_CONFIG = {
    // Supabase Configuration (loaded dynamically)
    SUPABASE_URL: window.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: window.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here',
    
    // App Configuration
    APP_NAME: 'VoidSEO',
    APP_VERSION: '1.0.0',
    
    // Feature Flags
    FEATURES: {
        DEMO_MODE: true,           // Set to false for production
        ANALYTICS_ENABLED: false,  // Enable when ready
        NEWSLETTER_ENABLED: true,
        COMMUNITY_ENABLED: true
    },
    
    // Free Tier Limits
    FREE_TIER_LIMITS: {
        COMMUNITY_POSTS_PER_WEEK: 3,
        DEMO_APPS_ONLY: true,
        TEMPLATE_DOWNLOADS: false,
        PRIVATE_DISCORD: false
    },
    
    // Builder Tier Features (for future reference)
    BUILDER_TIER_FEATURES: {
        LIVE_DATA_ACCESS: true,
        UNLIMITED_COMMUNITY_POSTS: true,
        TEMPLATE_DOWNLOADS: true,
        PRIVATE_DISCORD: true,
        PRIORITY_SUPPORT: true,
        LAB_SUBMISSIONS: true
    }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.VOIDSEO_CONFIG = VOIDSEO_CONFIG;
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VOIDSEO_CONFIG;
}
