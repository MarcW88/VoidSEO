#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Pages publiques qui doivent avoir canonical + hreflang
const publicPages = [
    { file: 'docs/index.html', url: 'https://voidseo.dev/docs/' },
    { file: 'lab/index.html', url: 'https://voidseo.dev/lab/' },
    { file: 'community/index.html', url: 'https://voidseo.dev/community/' },
    { file: 'about/index.html', url: 'https://voidseo.dev/about/' },
    { file: 'roadmap/index.html', url: 'https://voidseo.dev/roadmap/' },
    { file: 'newsletter/index.html', url: 'https://voidseo.dev/newsletter/' }
];

// Pages privées qui doivent avoir noindex
const privatePages = [
    'dashboard/index.html',
    'upgrade/index.html',
    'templates/index.html',
    'discord/index.html'
];

function addSeoTags(filePath, url) {
    try {
        const fullPath = path.join(__dirname, '..', filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }
        
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if SEO tags already exist
        if (content.includes('rel="canonical"') || content.includes('noindex')) {
            console.log(`✅ SEO tags already exist: ${filePath}`);
            return;
        }
        
        // Find the position to insert SEO tags (after description meta tag)
        const descriptionRegex = /<meta name="description"[^>]*>/;
        const match = content.match(descriptionRegex);
        
        if (!match) {
            console.log(`⚠️  No description meta tag found: ${filePath}`);
            return;
        }
        
        const insertPosition = match.index + match[0].length;
        
        let seoTags;
        if (url) {
            // Public page - add canonical and hreflang
            seoTags = `
    
    <!-- SEO: Canonical and hreflang -->
    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="en-BE" href="${url}">
    <link rel="alternate" hreflang="x-default" href="${url}">`;
        } else {
            // Private page - add noindex
            seoTags = `
    
    <!-- SEO: Private page - prevent indexing -->
    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">`;
        }
        
        // Insert SEO tags
        const newContent = content.slice(0, insertPosition) + seoTags + content.slice(insertPosition);
        
        fs.writeFileSync(fullPath, newContent);
        console.log(`✅ Added SEO tags: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

console.log('🔍 Adding SEO tags to VoidSEO pages...\n');

// Add canonical + hreflang to public pages
console.log('📄 Processing public pages:');
publicPages.forEach(page => {
    addSeoTags(page.file, page.url);
});

console.log('\n🔒 Processing private pages:');
// Add noindex to private pages
privatePages.forEach(file => {
    addSeoTags(file, null);
});

console.log('\n🎉 SEO tags processing complete!');
console.log('\n📋 Summary:');
console.log('✅ Public pages: canonical + hreflang en-BE');
console.log('🚫 Private pages: noindex, nofollow');
console.log('🔍 Apps: noindex (already protected)');
console.log('🔐 Auth pages: noindex (already protected)');
console.log('📊 Dashboard: noindex (already protected)');
