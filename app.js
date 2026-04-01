import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// FIREBASE CONFIG
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

// GLOBAL DATA
window.accounts = [];
window.payoutHistory = [];
window.subscriptions = [];

// NAVIGATION
window.showSection = (sectionId) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
};

// MODALS
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');

// FIREBASE SYNC
const dataRef = ref(db, 'funded_fleet_v10/');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        window.accounts = data.accounts || [];
        window.payoutHistory = data.payoutHistory || [];
        window.subscriptions = data.subscriptions || [];
        document.getElementById('cloudStatus').innerText = "☁️ Cloud Synced";
        document.getElementById('cloudStatus').className = "text-emerald-500 text-[10px] font-bold uppercase italic mt-1";
    }
    renderAll();
});

window.saveAll = () => {
    set(ref(db, 'funded_fleet_v10/'), {
        accounts: window.accounts,
        payoutHistory: window.payoutHistory,
        subscriptions: window.subscriptions
    });
};

// RENDER DELEGATION
import { renderFleet } from './dashboard.js';
import { renderPayouts } from './payouts.js';
import { renderSubs } from './subscriptions.js';

function renderAll() {
    renderFleet();
    renderPayouts();
    renderSubs();
}