
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
  // Get error message for Firebase auth errors
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'default': 'An unexpected error occurred. Please try again.'
        };
        
        return errorMessages[errorCode] || errorMessages.default;
    },

    // Smooth scroll to section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            // Close mobile menu if open
            if (elements.navMenu) elements.navMenu.classList.remove('active');
            if (elements.hamburger) elements.hamburger.classList.remove('active');
        }
    }
};

// Form Validation
const validation = {
    // Validate single field
    validateField(field, rules = {}) {
        if (!field) return false;
        
        const value = field.value.trim();
        const fieldName = field.id || field.name;
        const errorElement = field.closest('.input-group')?.querySelector('.field-error');
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${rules.label || fieldName} is required`;
        }
        
        // Email validation
        if (value && rules.email && !utils.validateEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        // Phone validation
        if (value && rules.phone && !utils.validatePhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
        
        // Min length validation
        if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `Minimum ${rules.minLength} characters required`;
        }
        
        // Update UI
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
        
        const inputField = field.closest('.input-field');
        if (inputField) {
            inputField.classList.toggle('error', !isValid);
        }
        
        return isValid;
    },

    // Validate entire form
    validateForm(form, rules) {
        if (!form || !rules) return false;
        
        let isValid = true;
        
        Object.keys(rules).forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (field) {
                const fieldValid = this.validateField(field, rules[fieldId]);
                if (!fieldValid) isValid = false;
            }
        });
        
        return isValid;
    }
};
// Authentication Functions
const authFunctions = {
    // Initialize auth state listener
    initAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            isAdmin = user && ADMIN_EMAILS.includes(user.email);
            this.updateUI();
        });
    },

    // Update UI based on auth state
    updateUI() {
        if (elements.authBtn) {
            if (currentUser) {
                elements.authBtn.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span>${currentUser.displayName || 'Dashboard'}</span>
                `;
            } else {
                elements.authBtn.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span>Login</span>
                `;
            }
        }

        // Show/hide admin panel tab
        if (elements.adminPanelTab) {
            elements.adminPanelTab.style.display = isAdmin ? 'flex' : 'none';
        }
    },

    // Login user
    async login(email, password) {
        try {
            utils.showLoading();
            await auth.signInWithEmailAndPassword(email, password);
            utils.closeModal(elements.authModal);
            utils.showToast('Successfully logged in!', 'success');
        } catch (error) {
            utils.showToast(utils.getErrorMessage(error.code), 'error');
        } finally {
            utils.hideLoading();
        }
    },

    // Register user
    async register(name, email, password) {
        try {
            utils.showLoading();
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update profile with display name
            await result.user.updateProfile({
                displayName: name
            });

            // Save user data to database
            await database.ref(`users/${result.user.uid}`).set({
                name: name,
                email: email,
                createdAt: Date.now()
            });

            utils.closeModal(elements.authModal);
            utils.showToast('Account created successfully!', 'success');
        } catch (error) {
            utils.showToast(utils.getErrorMessage(error.code), 'error');
        } finally {
            utils.hideLoading();
        }
    },

    // Logout user
    async logout() {
        try {
            await auth.signOut();
            utils.closeModal(elements.dashboardModal);
            utils.showToast('Successfully logged out!', 'info');
        } catch (error) {
            utils.showToast('Error logging out. Please try again.', 'error');
        }
    },

    // Switch between login and register forms
    switchForm(showRegister = true) {
        if (elements.loginForm && elements.registerForm) {
            if (showRegister) {
                elements.loginForm.classList.remove('active');
                elements.registerForm.classList.add('active');
                document.querySelector('#authTitle').textContent = 'Create Account';
            } else {
                elements.registerForm.classList.remove('active');
                elements.loginForm.classList.add('active');
                document.querySelector('#authTitle').textContent = 'Welcome Back';
            }
        }
    }
};


