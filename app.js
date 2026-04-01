import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Import the render functions from your other files
import { renderFleet } from './dashboard.js';
import { renderPayouts } from './payouts.js';
import { renderSubs } from './subscriptions.js';

const firebaseConfig = {
    apiKey: "AIzaSyAJcjATHW8cFWkWLEIBhf_7ViWPgXoWX3M",
    authDomain: "fundeddashboard.firebaseapp.com",
    databaseURL: "https://fundeddashboard-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fundeddashboard",
    storageBucket: "fundeddashboard.firebasestorage.app",
    messagingSenderId: "1050670416192",
    appId: "1:1050670416192:web:3ade461e3b6457dd4cfaa5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize Global Data
window.accounts = [];
window.payoutHistory = [];
window.subscriptions = [];

// Navigation Logic
window.showSection = (sectionId) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    // Handle the event if triggered by a click
    if (window.event) {
        window.event.currentTarget.classList.add('active');
    }
};

// Sync with Firebase
const dataRef = ref(db, 'funded_fleet_v10/');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        window.accounts = data.accounts || [];
        window.payoutHistory = data.payoutHistory || [];
        window.subscriptions = data.subscriptions || [];
        
        const status = document.getElementById('cloudStatus');
        status.innerText = "☁️ Cloud Synced";
        status.className = "text-emerald-500 text-[10px] font-bold uppercase italic mt-1";
    }
    renderAll();
});

window.saveAll = function() {
    set(ref(db, 'funded_fleet_v10/'), {
        accounts: window.accounts,
        payoutHistory: window.payoutHistory,
        subscriptions: window.subscriptions
    });
};

function renderAll() {
    renderFleet();
    renderPayouts();
    renderSubs();
}