
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyACKve5Ki2K4XyeS8gRSJDEQFeQ8qwCGiU",
  authDomain: "blitzmed-ambulance-1154.firebaseapp.com",
  databaseURL: "https://blitzmed-ambulance-1154-default-rtdb.firebaseio.com",
  projectId: "blitzmed-ambulance-1154",
  storageBucket: "blitzmed-ambulance-1154.firebasestorage.app",
  messagingSenderId: "89162718281",
  appId: "1:89162718281:web:c7c0f0d995ef0b77a6f398"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const database = firebase.database();


// Admin emails - users with these emails will have admin access
const ADMIN_EMAILS = ['admin@blitzmed.com', 'admin@example.com'];

// Global variables
let currentUser = null;
let isAdmin = false;
let currentBookingStep = 1;

// DOM Elements
const elements = {
    // Navigation
    navbar: document.getElementById('navbar'),
    hamburger: document.getElementById('hamburger'),
    navMenu: document.getElementById('navMenu'),
    authBtn: document.getElementById('authBtn'),
    
    // Modals
    authModal: document.getElementById('authModal'),
    bookingModal: document.getElementById('bookingModal'),
    dashboardModal: document.getElementById('dashboardModal'),
    loadingOverlay: document.getElementById('loadingOverlay'),
  // Auth forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginFormEl: document.getElementById('loginFormEl'),
    registerFormEl: document.getElementById('registerFormEl'),
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    
    // Booking form
    bookingForm: document.getElementById('bookingForm'),
    bookNowBtn: document.getElementById('bookNowBtn'),
    nextStepBtn: document.getElementById('nextStepBtn'),
    prevStepBtn: document.getElementById('prevStepBtn'),
    submitBookingBtn: document.getElementById('submitBookingBtn'),
   // Dashboard
    myBookingsTab: document.getElementById('myBookingsTab'),
    adminPanelTab: document.getElementById('adminPanelTab'),
    logoutBtn: document.getElementById('logoutBtn'),
    myBookings: document.getElementById('myBookings'),
    adminPanel: document.getElementById('adminPanel'),
    bookingsList: document.getElementById('bookingsList'),
    allBookingsList: document.getElementById('allBookingsList'),
    statusFilter: document.getElementById('statusFilter'),
    refreshDataBtn: document.getElementById('refreshDataBtn'),
    
    // Toast container
    toastContainer: document.getElementById('toastContainer')
    
}
// Utility Functions
const utils = {
    // Show loading overlay
    showLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.add('active');
        }
    },

    // Hide loading overlay
    hideLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.remove('active');
        }
    },

    // Open modal with animation
    openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // Close modal with animation
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
   // Create and show toast notification
    showToast(message, type = 'info', title = '') {
        if (!elements.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check',
            error: 'fas fa-times',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info'
        };
        
        const titleMap = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconMap[type] || iconMap.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title || titleMap[type] || titleMap.info}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    },
  // Format timestamp
    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
  // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone number
    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    },
