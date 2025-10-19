// Simple Analytics for VoidSEO MVP
// Tracks key user interactions for startup metrics

class VoidAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.startTime = Date.now();
        this.events = [];
        
        // Initialize tracking
        this.init();
    }
    
    init() {
        // Track page view
        this.track('page_view', {
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: Date.now()
        });
        
        // Track engagement
        this.trackEngagement();
        
        // Track CTA clicks
        this.trackCTAClicks();
        
        // Track time on page
        this.trackTimeOnPage();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getUserId() {
        let userId = localStorage.getItem('void_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('void_user_id', userId);
        }
        return userId;
    }
    
    track(event, data = {}) {
        const eventData = {
            event,
            session_id: this.sessionId,
            user_id: this.userId,
            timestamp: Date.now(),
            page: window.location.pathname,
            ...data
        };
        
        this.events.push(eventData);
        
        // Log to console for MVP (replace with real analytics later)
        console.log('📊 VoidSEO Analytics:', eventData);
        
        // Store in localStorage for MVP demo
        this.storeEvent(eventData);
    }
    
    storeEvent(eventData) {
        const events = JSON.parse(localStorage.getItem('void_analytics_events') || '[]');
        events.push(eventData);
        
        // Keep only last 100 events to avoid storage bloat
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('void_analytics_events', JSON.stringify(events));
    }
    
    trackEngagement() {
        let scrollDepth = 0;
        let maxScroll = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            scrollDepth = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollDepth > maxScroll) {
                maxScroll = scrollDepth;
                
                // Track milestone scrolls
                if (maxScroll >= 25 && maxScroll < 50) {
                    this.track('scroll_25');
                } else if (maxScroll >= 50 && maxScroll < 75) {
                    this.track('scroll_50');
                } else if (maxScroll >= 75 && maxScroll < 90) {
                    this.track('scroll_75');
                } else if (maxScroll >= 90) {
                    this.track('scroll_90');
                }
            }
        });
    }
    
    trackCTAClicks() {
        // Track all CTA button clicks
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if it's a CTA button
            if (target.classList.contains('btn') || target.closest('.btn')) {
                const button = target.classList.contains('btn') ? target : target.closest('.btn');
                const buttonText = button.textContent.trim();
                const buttonHref = button.href || button.getAttribute('onclick') || 'no-link';
                
                this.track('cta_click', {
                    button_text: buttonText,
                    button_href: buttonHref,
                    button_class: button.className
                });
            }
            
            // Track specific important links
            if (target.tagName === 'A') {
                const href = target.href;
                const text = target.textContent.trim();
                
                if (href.includes('signup') || href.includes('pricing') || href.includes('preview')) {
                    this.track('important_link_click', {
                        link_text: text,
                        link_href: href
                    });
                }
            }
        });
    }
    
    trackTimeOnPage() {
        // Track time spent on page
        let timeSpent = 0;
        const interval = setInterval(() => {
            timeSpent += 10; // Track every 10 seconds
            
            // Send milestone events
            if (timeSpent === 30) {
                this.track('time_30s');
            } else if (timeSpent === 60) {
                this.track('time_1m');
            } else if (timeSpent === 120) {
                this.track('time_2m');
            } else if (timeSpent === 300) {
                this.track('time_5m');
            }
        }, 10000);
        
        // Clear interval when page unloads
        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
            this.track('page_exit', {
                time_spent: timeSpent
            });
        });
    }
    
    // Method to get analytics summary (for demo purposes)
    getAnalyticsSummary() {
        const events = JSON.parse(localStorage.getItem('void_analytics_events') || '[]');
        const summary = {
            total_events: events.length,
            unique_sessions: [...new Set(events.map(e => e.session_id))].length,
            page_views: events.filter(e => e.event === 'page_view').length,
            cta_clicks: events.filter(e => e.event === 'cta_click').length,
            avg_time_on_page: this.calculateAvgTimeOnPage(events),
            top_pages: this.getTopPages(events),
            top_ctas: this.getTopCTAs(events)
        };
        
        return summary;
    }
    
    calculateAvgTimeOnPage(events) {
        const exitEvents = events.filter(e => e.event === 'page_exit');
        if (exitEvents.length === 0) return 0;
        
        const totalTime = exitEvents.reduce((sum, e) => sum + (e.time_spent || 0), 0);
        return Math.round(totalTime / exitEvents.length);
    }
    
    getTopPages(events) {
        const pageViews = events.filter(e => e.event === 'page_view');
        const pageCounts = {};
        
        pageViews.forEach(e => {
            pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
        });
        
        return Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([page, count]) => ({ page, count }));
    }
    
    getTopCTAs(events) {
        const ctaClicks = events.filter(e => e.event === 'cta_click');
        const ctaCounts = {};
        
        ctaClicks.forEach(e => {
            const key = e.button_text || 'Unknown';
            ctaCounts[key] = (ctaCounts[key] || 0) + 1;
        });
        
        return Object.entries(ctaCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([cta, count]) => ({ cta, count }));
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if not in development mode
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        window.voidAnalytics = new VoidAnalytics();
        
        // Add analytics summary to console for demo
        setTimeout(() => {
            console.log('📈 Analytics Summary:', window.voidAnalytics.getAnalyticsSummary());
        }, 5000);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoidAnalytics;
}
