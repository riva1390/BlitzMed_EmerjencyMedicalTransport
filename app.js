
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
// Booking Functions
const bookingFunctions = {
    // Initialize booking modal
    initBookingModal() {
        this.updateBookingStep(1);
    },

    // Update booking step
    updateBookingStep(step) {
        currentBookingStep = step;
        
        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.toggle('active', stepNumber === step);
            stepEl.classList.toggle('completed', stepNumber < step);
        });

        // Show/hide steps
        document.querySelectorAll('.booking-step').forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.toggle('active', stepNumber === step);
        });

        // Update buttons
        if (elements.prevStepBtn) {
            elements.prevStepBtn.style.display = step > 1 ? 'flex' : 'none';
        }
        if (elements.nextStepBtn) {
            elements.nextStepBtn.style.display = step < 4 ? 'flex' : 'none';
        }
        if (elements.submitBookingBtn) {
            elements.submitBookingBtn.style.display = step === 4 ? 'flex' : 'none';
        }

        // Update summary on step 4
        if (step === 4) {
            this.updateBookingSummary();
        }
    },

    // Validate current step
    validateCurrentStep() {
        const currentStepEl = document.querySelector(`.booking-step[data-step="${currentBookingStep}"]`);
        if (!currentStepEl) return false;

        const requiredFields = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                const inputField = field.closest('.input-field');
                if (inputField) {
                    inputField.classList.add('error');
                }
                const errorElement = field.closest('.input-group')?.querySelector('.field-error');
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                }
            }
        });

        // Validate radio buttons
        const radioGroups = currentStepEl.querySelectorAll('input[type="radio"]');
        const radioGroupNames = [...new Set([...radioGroups].map(r => r.name))];
        
        radioGroupNames.forEach(name => {
            const selectedRadio = currentStepEl.querySelector(`input[name="${name}"]:checked`);
            if (!selectedRadio) {
                isValid = false;
                utils.showToast('Please make a selection', 'warning');
            }
        });

        return isValid;
    },

    // Go to next step
    nextStep() {
        if (this.validateCurrentStep() && currentBookingStep < 4) {
            this.updateBookingStep(currentBookingStep + 1);
        }
    },

    // Go to previous step
    prevStep() {
        if (currentBookingStep > 1) {
            this.updateBookingStep(currentBookingStep - 1);
        }
    },
  // Update booking summary
    updateBookingSummary() {
        const form = elements.bookingForm;
        if (!form) return;

        const summaryElements = {
            summaryPatient: document.getElementById('summaryPatient'),
            summaryContact: document.getElementById('summaryContact'),
            summaryEmergencyContact: document.getElementById('summaryEmergencyContact'),
            summaryPickup: document.getElementById('summaryPickup'),
            summaryDestination: document.getElementById('summaryDestination'),
            summaryService: document.getElementById('summaryService'),
            summaryUrgency: document.getElementById('summaryUrgency')
        };

        // Update summary values
        if (summaryElements.summaryPatient) {
            summaryElements.summaryPatient.textContent = form.patientName?.value || 'N/A';
        }
        if (summaryElements.summaryContact) {
            summaryElements.summaryContact.textContent = form.contactNumber?.value || 'N/A';
        }
        if (summaryElements.summaryEmergencyContact) {
            const emergencyName = form.emergencyContactName?.value || '';
            const emergencyPhone = form.emergencyContactPhone?.value || '';
            const contactInfo = emergencyName && emergencyPhone ? `${emergencyName} (${emergencyPhone})` : 'Not provided';
            summaryElements.summaryEmergencyContact.textContent = contactInfo;
        }
        if (summaryElements.summaryPickup) {
            summaryElements.summaryPickup.textContent = form.pickupLocation?.value || 'N/A';
        }
        if (summaryElements.summaryDestination) {
            summaryElements.summaryDestination.textContent = form.destination?.value || 'N/A';
        }
        if (summaryElements.summaryService) {
            const selectedService = form.querySelector('input[name="serviceType"]:checked');
            summaryElements.summaryService.textContent = selectedService?.value || 'N/A';
        }
        if (summaryElements.summaryUrgency) {
            const selectedUrgency = form.querySelector('input[name="urgencyLevel"]:checked');
            summaryElements.summaryUrgency.textContent = selectedUrgency?.value || 'N/A';
        }
    },
  // Submit booking
    async submitBooking() {
        if (!currentUser) {
            utils.showToast('Please login to book an ambulance', 'warning');
            return;
        }

        const form = elements.bookingForm;
        if (!form) return;

        try {
            utils.showLoading();

            const bookingData = {
                patientName: form.patientName?.value || '',
                contactNumber: form.contactNumber?.value || '',
                pickupLocation: form.pickupLocation?.value || '',
                destination: form.destination?.value || '',
                serviceType: form.querySelector('input[name="serviceType"]:checked')?.value || '',
                urgencyLevel: form.querySelector('input[name="urgencyLevel"]:checked')?.value || '',
                medicalNotes: form.medicalNotes?.value || '',
                userId: currentUser.uid,
                userEmail: currentUser.email,
                status: 'pending',
                createdAt: Date.now()
            };

            // Save to database
            const bookingRef = database.ref('bookings').push();
            await bookingRef.set(bookingData);

            utils.closeModal(elements.bookingModal);
            utils.showToast('Booking submitted successfully! You will receive confirmation shortly.', 'success');
            
            // Reset form
            form.reset();
            this.updateBookingStep(1);

        } catch (error) {
            console.error('Booking submission error:', error);
            utils.showToast('Failed to submit booking. Please try again.', 'error');
        } finally {
            utils.hideLoading();
        }
    }
};
// Dashboard Functions
const dashboardFunctions = {
    // Load user bookings
    async loadUserBookings() {
        if (!currentUser || !elements.bookingsList) return;

        try {
            const snapshot = await database.ref('bookings')
                .orderByChild('userId')
                .equalTo(currentUser.uid)
                .once('value');

            const bookings = [];
            snapshot.forEach(childSnapshot => {
                bookings.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            this.displayBookings(bookings, elements.bookingsList);
        } catch (error) {
            console.error('Error loading user bookings:', error);
            utils.showToast('Failed to load bookings', 'error');
        }
    },

    // Load all bookings (admin only)
    async loadAllBookings() {
        if (!isAdmin || !elements.allBookingsList) return;

        try {
            const snapshot = await database.ref('bookings').once('value');
            const bookings = [];
            
            snapshot.forEach(childSnapshot => {
                bookings.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Apply status filter
            const statusFilter = elements.statusFilter?.value;
            const filteredBookings = statusFilter 
                ? bookings.filter(booking => booking.status === statusFilter)
                : bookings;

            this.displayBookings(filteredBookings, elements.allBookingsList, true);
        } catch (error) {
            console.error('Error loading all bookings:', error);
            utils.showToast('Failed to load bookings', 'error');
        }
    },
 // Display bookings in list
    displayBookings(bookings, container, isAdmin = false) {
        if (!container) return;

        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="no-bookings">
                    <i class="fas fa-calendar-times"></i>
                    <h4>No bookings found</h4>
                    <p>${isAdmin ? 'No bookings match the current filter.' : 'You haven\'t made any ambulance bookings yet.'}</p>
                </div>
            `;
            return;
        }

        // Sort bookings by creation date (newest first)
        bookings.sort((a, b) => b.createdAt - a.createdAt);

        container.innerHTML = bookings.map(booking => `
            <div class="booking-item">
                <div class="booking-header">
                    <div class="booking-info">
                        <h4>${booking.patientName}</h4>
                        <p>Booking ID: ${booking.id}</p>
                    </div>
                    <span class="booking-status ${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <div class="detail-item">
                        <span class="detail-label">Contact</span>
                        <span class="detail-value">${booking.contactNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">From</span>
                        <span class="detail-value">${booking.pickupLocation}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">To</span>
                        <span class="detail-value">${booking.destination}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Service</span>
                        <span class="detail-value">${booking.serviceType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Urgency</span>
                        <span class="detail-value">${booking.urgencyLevel}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">${utils.formatDate(booking.createdAt)}</span>
                    </div>
                    ${isAdmin ? `
                        <div class="detail-item">
                            <span class="detail-label">User</span>
                            <span class="detail-value">${booking.userEmail}</span>
                        </div>
                    ` : ''}
                </div>
                ${isAdmin ? `
                    <div class="booking-actions">
                        <select onchange="dashboardFunctions.updateBookingStatus('${booking.id}', this.value)" class="filter-select">
                            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="in-progress" ${booking.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                ` : ''}
            </div>
        `).join('');
    },
      // Update booking status (admin only)
    async updateBookingStatus(bookingId, newStatus) {
        if (!isAdmin) return;

        try {
            await database.ref(`bookings/${bookingId}`).update({
                status: newStatus,
                updatedAt: Date.now()
            });

            utils.showToast('Booking status updated successfully', 'success');
            this.loadAllBookings(); // Refresh the list
        } catch (error) {
            console.error('Error updating booking status:', error);
            utils.showToast('Failed to update booking status', 'error');
        }
    },

    // Switch dashboard tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`)?.classList.add('active');

        // Update tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName)?.classList.add('active');

        // Load data for active tab
        if (tabName === 'myBookings') {
            this.loadUserBookings();
        } else if (tabName === 'adminPanel' && isAdmin) {
            this.loadAllBookings();
        }
    }
};

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = field?.nextElementSibling;
    
    if (field && toggle) {
        const isPassword = field.type === 'password';
        field.type = isPassword ? 'text' : 'password';
        toggle.innerHTML = `<i class="fas fa-eye${isPassword ? '-slash' : ''}"></i>`;
    }
}
// Event Listeners
function initializeEventListeners() {
    // Navigation scroll effect
    window.addEventListener('scroll', () => {
        if (elements.navbar) {
            if (window.scrollY > 100) {
                elements.navbar.classList.add('scrolled');
            } else {
                elements.navbar.classList.remove('scrolled');
            }
        }
    });

    // Mobile navigation toggle
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', () => {
            elements.navMenu?.classList.toggle('active');
            elements.hamburger.classList.toggle('active');
        });
    }

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href?.startsWith('#')) {
                utils.scrollToSection(href.substring(1));
            }
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Auth button
    if (elements.authBtn) {
        elements.authBtn.addEventListener('click', () => {
            if (currentUser) {
                utils.openModal(elements.dashboardModal);
                dashboardFunctions.switchTab('myBookings');
            } else {
                utils.openModal(elements.authModal);
            }
        });
    }
  // Book now button
    if (elements.bookNowBtn) {
        elements.bookNowBtn.addEventListener('click', () => {
            if (currentUser) {
                utils.openModal(elements.bookingModal);
                bookingFunctions.initBookingModal();
            } else {
                utils.showToast('Please login to book an ambulance', 'warning');
                utils.openModal(elements.authModal);
            }
        });
    }

    // Auth form switches
    if (elements.showRegister) {
        elements.showRegister.addEventListener('click', () => {
            authFunctions.switchForm(true);
        });
    }
    if (elements.showLogin) {
        elements.showLogin.addEventListener('click', () => {
            authFunctions.switchForm(false);
        });
    }

    // Auth form submissions
    if (elements.loginFormEl) {
        elements.loginFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            if (email && password) {
                await authFunctions.login(email, password);
            }
        });
    }

    if (elements.registerFormEl) {
        elements.registerFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName')?.value;
            const email = document.getElementById('registerEmail')?.value;
            const password = document.getElementById('registerPassword')?.value;
            if (name && email && password) {
                await authFunctions.register(name, email, password);
            }
        });
    }

    // Booking form navigation
    if (elements.nextStepBtn) {
        elements.nextStepBtn.addEventListener('click', () => {
            bookingFunctions.nextStep();
        });
    }
    if (elements.prevStepBtn) {
        elements.prevStepBtn.addEventListener('click', () => {
            bookingFunctions.prevStep();
        });
    }
    if (elements.submitBookingBtn) {
        elements.submitBookingBtn.addEventListener('click', () => {
            bookingFunctions.submitBooking();
        });
    }

    // Dashboard tabs
    if (elements.myBookingsTab) {
        elements.myBookingsTab.addEventListener('click', () => {
            dashboardFunctions.switchTab('myBookings');
        });
    }
    if (elements.adminPanelTab) {
        elements.adminPanelTab.addEventListener('click', () => {
            dashboardFunctions.switchTab('adminPanel');
        });
    }
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            authFunctions.logout();
        });
    }
  // Refresh data button
    if (elements.refreshDataBtn) {
        elements.refreshDataBtn.addEventListener('click', () => {
            dashboardFunctions.loadUserBookings();
            if (isAdmin) {
                dashboardFunctions.loadAllBookings();
            }
        });
    }

    // Service card click handlers
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const serviceType = card.getAttribute('data-service');
            openBookingWithService(serviceType);
        });
    });

    // Emergency contact sharing handlers
    const autoFillContactBtn = document.getElementById('autoFillContactBtn');
    const shareContactBtn = document.getElementById('shareContactBtn');

    if (autoFillContactBtn) {
        autoFillContactBtn.addEventListener('click', () => {
            autoFillEmergencyContact();
        });
    }

    if (shareContactBtn) {
        shareContactBtn.addEventListener('click', () => {
            shareEmergencyContact();
        });
    }

    // Close modals when clicking backdrop
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                utils.closeModal(modal);
            }
        });
    });

    // Clear form errors on input
    document.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => {
            const inputField = field.closest('.input-field');
            const errorElement = field.closest('.input-group')?.querySelector('.field-error');
            
            if (inputField) {
                inputField.classList.remove('error');
            }
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });
}

// Function to open booking modal with pre-selected service
function openBookingWithService(serviceType) {
    if (!currentUser) {
        utils.openModal(elements.authModal);
        utils.showToast('Please login to book an ambulance', 'info');
        return;
    }

    utils.openModal(elements.bookingModal);
    bookingFunctions.initBookingModal();
    
    // Pre-select the service type
    setTimeout(() => {
        const serviceRadios = document.querySelectorAll('input[name="serviceType"]');
        serviceRadios.forEach(radio => {
            const serviceOption = radio.closest('.service-option');
            if (serviceOption && serviceOption.getAttribute('data-service') === serviceType) {
                radio.checked = true;
            }
        });
    }, 100); // Small delay to ensure modal is fully rendered
}

// Initialize the application
function initializeApp() {
    // Initialize Firebase auth state listener
    authFunctions.initAuthStateListener();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Hide loading overlay
    utils.hideLoading();
    
    console.log('BlitzMed application initialized successfully');
}

// Emergency contact sharing functions
function autoFillEmergencyContact() {
    if (!currentUser) {
        utils.showToast('Please login to use this feature', 'warning');
        return;
    }

    const emergencyContactName = document.getElementById('emergencyContactName');
    const emergencyContactPhone = document.getElementById('emergencyContactPhone');
    
    if (emergencyContactName && emergencyContactPhone) {
        // Use the current user's name as default
        emergencyContactName.value = currentUser.displayName || currentUser.email.split('@')[0];
        
        utils.showToast('Please update emergency contact phone number', 'info');
        emergencyContactPhone.focus();
    }
}

function shareEmergencyContact() {
    const emergencyContactName = document.getElementById('emergencyContactName');
    const emergencyContactPhone = document.getElementById('emergencyContactPhone');
    const patientName = document.getElementById('patientName');
    
    if (!emergencyContactName?.value || !emergencyContactPhone?.value) {
        utils.showToast('Please fill in emergency contact details first', 'warning');
        return;
    }

    const contactInfo = `Emergency Contact for ${patientName?.value || 'Patient'}:
Name: ${emergencyContactName.value}
Phone: ${emergencyContactPhone.value}
Time: ${new Date().toLocaleString()}`;

    // Use Web Share API if available, otherwise copy to clipboard
    if (navigator.share) {
        navigator.share({
            title: 'Emergency Contact Information',
            text: contactInfo
        }).then(() => {
            utils.showToast('Contact information shared successfully', 'success');
        }).catch(() => {
            copyToClipboard(contactInfo);
        });
    } else {
        copyToClipboard(contactInfo);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            utils.showToast('Contact information copied to clipboard', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        utils.showToast('Contact information copied to clipboard', 'success');
    } catch (err) {
        utils.showToast('Unable to copy contact information', 'error');
    }
    document.body.removeChild(textArea);
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    utils.showToast('An unexpected error occurred. Please refresh the page.', 'error');
});

// Handle Firebase connection state
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === false) {
        utils.showToast('Connection lost. Please check your internet connection.', 'warning');
    }
});



