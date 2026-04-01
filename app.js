import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Import renderers
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
window.activeId = null;

// GLOBAL HELPERS
window.openModal = (id) => {
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove('hidden');
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('hidden');
};

window.showSection = (sectionId) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    const section = document.getElementById(`${sectionId}-section`);
    if(section) section.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (window.event) window.event.currentTarget.classList.add('active');
};

// FIREBASE PUSH
window.saveAll = function() {
    set(ref(db, 'funded_fleet_v10/'), {
        accounts: window.accounts,
        payoutHistory: window.payoutHistory,
        subscriptions: window.subscriptions
    }).then(() => {
        console.log("Data saved to Cloud");
    }).catch((error) => {
        console.error("Save failed:", error);
    });
};

// FIREBASE FETCH
const dataRef = ref(db, 'funded_fleet_v10/');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        window.accounts = data.accounts || [];
        window.payoutHistory = data.payoutHistory || [];
        window.subscriptions = data.subscriptions || [];
        
        const status = document.getElementById('cloudStatus');
        if(status) {
            status.innerText = "☁️ Cloud Synced";
            status.className = "text-emerald-500 text-[10px] font-bold uppercase italic mt-1";
        }
    }
    renderFleet();
    renderPayouts();
    renderSubs();
});