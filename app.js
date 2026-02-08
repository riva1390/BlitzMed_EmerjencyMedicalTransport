
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
