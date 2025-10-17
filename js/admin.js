// VoidSEO Admin Dashboard JavaScript
// Handles admin functionality and user management

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

// Sample data for demo purposes
const DEMO_USERS = [
    {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        tier: 'free',
        signupDate: '2024-10-15',
        lastActive: '2024-10-17',
        newsletter: true,
        status: 'active'
    },
    {
        id: 2,
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        tier: 'free',
        signupDate: '2024-10-14',
        lastActive: '2024-10-16',
        newsletter: true,
        status: 'active'
    },
    {
        id: 3,
        name: 'Alex Rodriguez',
        email: 'alex.r@startup.io',
        tier: 'free',
        signupDate: '2024-10-13',
        lastActive: '2024-10-17',
        newsletter: false,
        status: 'active'
    },
    {
        id: 4,
        name: 'Emma Wilson',
        email: 'emma@freelancer.com',
        tier: 'free',
        signupDate: '2024-10-12',
        lastActive: '2024-10-15',
        newsletter: true,
        status: 'inactive'
    },
    {
        id: 5,
        name: 'David Kim',
        email: 'david.kim@agency.com',
        tier: 'free',
        signupDate: '2024-10-11',
        lastActive: '2024-10-17',
        newsletter: true,
        status: 'active'
    }
];

let currentPage = 1;
const usersPerPage = 10;
let filteredUsers = [...DEMO_USERS];

function initializeAdminDashboard() {
    setupEventListeners();
    loadDashboardData();
    renderUsersTable();
    updateMetrics();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            updateMetrics();
        }
    }, 30000);
}

function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // User search
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterUsers, 300));
    }
    
    // User filter
    const filterSelect = document.getElementById('user-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterUsers);
    }
    
    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage(-1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage(1));
    }
}

function loadDashboardData() {
    // In a real implementation, this would fetch from your backend
    // For demo, we'll simulate data loading
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        updateMetrics();
        renderUsersTable();
    }, 1000);
}

function updateMetrics() {
    // Simulate real-time metrics updates
    const metrics = {
        totalUsers: DEMO_USERS.length + Math.floor(Math.random() * 50) + 100,
        dailySignups: Math.floor(Math.random() * 15) + 3,
        activeUsers: Math.floor(DEMO_USERS.length * 0.7) + Math.floor(Math.random() * 20),
        newsletterSubs: Math.floor(DEMO_USERS.filter(u => u.newsletter).length * 1.2) + Math.floor(Math.random() * 30)
    };
    
    // Update metric displays with animation
    animateMetricUpdate('total-users', metrics.totalUsers);
    animateMetricUpdate('daily-signups', metrics.dailySignups);
    animateMetricUpdate('active-users', metrics.activeUsers);
    animateMetricUpdate('newsletter-subs', metrics.newsletterSubs);
}

function animateMetricUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const increment = (newValue - currentValue) / 20;
    let current = currentValue;
    
    const animation = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
            current = newValue;
            clearInterval(animation);
        }
        element.textContent = Math.round(current);
    }, 50);
}

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
    
    updatePagination();
}

function createUserRow(user) {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--void-gray)';
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    const getTimeSince = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };
    
    row.innerHTML = `
        <td style="padding: 1rem; color: var(--void-white);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 32px; height: 32px; background: var(--void-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--void-black);">
                    ${user.name.charAt(0)}
                </div>
                <span>${user.name}</span>
            </div>
        </td>
        <td style="padding: 1rem; color: var(--void-light-gray); font-family: var(--font-mono);">${user.email}</td>
        <td style="padding: 1rem; text-align: center;">
            <span style="background: var(--void-accent); color: var(--void-black); padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                Free ▌
            </span>
        </td>
        <td style="padding: 1rem; text-align: center; color: var(--void-light-gray); font-family: var(--font-mono);">${formatDate(user.signupDate)}</td>
        <td style="padding: 1rem; text-align: center; color: var(--void-light-gray); font-family: var(--font-mono);">${getTimeSince(user.lastActive)}</td>
        <td style="padding: 1rem; text-align: center;">
            ${user.newsletter ? 
                '<span style="color: var(--void-accent);">✅ Yes</span>' : 
                '<span style="color: var(--void-light-gray);">❌ No</span>'
            }
        </td>
        <td style="padding: 1rem; text-align: center;">
            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                <button class="btn-small" onclick="viewUser(${user.id})" style="background: var(--void-blue); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">View</button>
                <button class="btn-small" onclick="editUser(${user.id})" style="background: var(--void-accent); color: var(--void-black); border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Edit</button>
            </div>
        </td>
    `;
    
    return row;
}

function filterUsers() {
    const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
    const filterType = document.getElementById('user-filter')?.value || 'all';
    
    filteredUsers = DEMO_USERS.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                             user.email.toLowerCase().includes(searchTerm);
        
        let matchesFilter = true;
        switch (filterType) {
            case 'active':
                matchesFilter = user.status === 'active';
                break;
            case 'inactive':
                matchesFilter = user.status === 'inactive';
                break;
            case 'newsletter':
                matchesFilter = user.newsletter === true;
                break;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    currentPage = 1;
    renderUsersTable();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderUsersTable();
    }
}

function refreshDashboard() {
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.textContent = '🔄 Refreshing...';
        refreshBtn.disabled = true;
    }
    
    // Simulate refresh
    setTimeout(() => {
        updateMetrics();
        renderUsersTable();
        
        if (refreshBtn) {
            refreshBtn.textContent = '🔄 Refresh';
            refreshBtn.disabled = false;
        }
        
        showToast('Dashboard refreshed successfully!', 'success');
    }, 1500);
}

function exportData() {
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.textContent = '📊 Exporting...';
        exportBtn.disabled = true;
    }
    
    // Simulate export
    setTimeout(() => {
        // Create CSV data
        const csvData = generateCSV();
        downloadCSV(csvData, 'voidseo-users-export.csv');
        
        if (exportBtn) {
            exportBtn.textContent = '📊 Export';
            exportBtn.disabled = false;
        }
        
        showToast('Data exported successfully!', 'success');
    }, 1000);
}

function generateCSV() {
    const headers = ['Name', 'Email', 'Tier', 'Signup Date', 'Last Active', 'Newsletter', 'Status'];
    const rows = DEMO_USERS.map(user => [
        user.name,
        user.email,
        user.tier,
        user.signupDate,
        user.lastActive,
        user.newsletter ? 'Yes' : 'No',
        user.status
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function viewUser(userId) {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
        showUserModal(user, 'view');
    }
}

function editUser(userId) {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
        showUserModal(user, 'edit');
    }
}

function showUserModal(user, mode) {
    const modal = document.createElement('div');
    modal.className = 'user-modal-overlay';
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
    
    const isEditable = mode === 'edit';
    
    modal.innerHTML = `
        <div class="user-modal" style="background: var(--void-dark); border: 2px solid var(--void-accent); border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--void-gray);">
                <h3 style="margin: 0; color: var(--void-accent);">${isEditable ? 'Edit' : 'View'} User</h3>
                <button class="modal-close" style="background: none; border: none; color: var(--void-light-gray); font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-content" style="padding: 20px;">
                <div class="user-details">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--void-white);">Name</label>
                        <input type="text" value="${user.name}" ${isEditable ? '' : 'readonly'} 
                               style="width: 100%; padding: 8px 12px; background: var(--void-black); border: 1px solid var(--void-gray); border-radius: 4px; color: var(--void-white);">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--void-white);">Email</label>
                        <input type="email" value="${user.email}" ${isEditable ? '' : 'readonly'}
                               style="width: 100%; padding: 8px 12px; background: var(--void-black); border: 1px solid var(--void-gray); border-radius: 4px; color: var(--void-white);">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--void-white);">Tier</label>
                        <select ${isEditable ? '' : 'disabled'}
                                style="width: 100%; padding: 8px 12px; background: var(--void-black); border: 1px solid var(--void-gray); border-radius: 4px; color: var(--void-white);">
                            <option value="free" ${user.tier === 'free' ? 'selected' : ''}>Free</option>
                            <option value="builder" ${user.tier === 'builder' ? 'selected' : ''}>Builder</option>
                            <option value="studio" ${user.tier === 'studio' ? 'selected' : ''}>Studio</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" ${user.newsletter ? 'checked' : ''} ${isEditable ? '' : 'disabled'}>
                            <span style="color: var(--void-white);">Newsletter Subscription</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--void-white);">Status</label>
                        <select ${isEditable ? '' : 'disabled'}
                                style="width: 100%; padding: 8px 12px; background: var(--void-black); border: 1px solid var(--void-gray); border-radius: 4px; color: var(--void-white);">
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                        </select>
                    </div>
                </div>
                ${isEditable ? `
                    <div class="modal-actions" style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button class="btn btn-primary save-user" style="flex: 1;">Save Changes</button>
                        <button class="btn btn-secondary modal-close" style="flex: 1;">Cancel</button>
                    </div>
                ` : `
                    <div class="modal-actions" style="margin-top: 2rem;">
                        <button class="btn btn-secondary modal-close" style="width: 100%;">Close</button>
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup close functionality
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    // Setup save functionality
    const saveBtn = modal.querySelector('.save-user');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            showToast('User updated successfully!', 'success');
            document.body.removeChild(modal);
            renderUsersTable();
        });
    }
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function showLoadingState() {
    // Add loading indicators to metric cards
    const metricNumbers = document.querySelectorAll('.metric-number');
    metricNumbers.forEach(el => {
        el.style.opacity = '0.5';
        el.textContent = '...';
    });
}

function hideLoadingState() {
    const metricNumbers = document.querySelectorAll('.metric-number');
    metricNumbers.forEach(el => {
        el.style.opacity = '1';
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    const bgColor = type === 'success' ? 'var(--void-accent)' : 
                   type === 'error' ? 'var(--void-red)' : 'var(--void-blue)';
    const textColor = type === 'success' ? 'var(--void-black)' : 'var(--void-white)';
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
