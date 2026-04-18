// --- MAIN RENDER ---
export function renderFleet() {
    const container = document.getElementById('grid');
    if (!container) return;
    container.innerHTML = '';

    <div class="flex justify-between items-end mb-2">
    <div class="flex items-center gap-2">
        <span class="text-5xl font-black ${isLoss ? 'text-red-500' : 'text-white'} italic">$${acc.currentProfit.toLocaleString()}</span>
        <button onclick="window.editBalance(${acc.id})" class="text-slate-700 hover:text-blue-400 transition text-sm">✎</button>
    </div>
    <div class="text-right text-[10px] font-mono font-bold text-slate-500 italic">Target: $${acc.target.toLocaleString()}</div>
</div>

    window.accounts.forEach(acc => {
        const isLoss = acc.currentProfit < 0;
        const progress = acc.target > 0 ? Math.min((Math.abs(acc.currentProfit) / acc.target) * 100, 100) : 0;
        const curCons = acc.currentProfit > 0 ? (acc.bestDay / acc.currentProfit) * 100 : 0;
        const violation = acc.consistency > 0 && curCons > acc.consistency;

        const daysMet = !acc.minDaysNeeded || acc.daysTraded >= acc.minDaysNeeded;
        const balanceMet = !acc.minBalance || acc.currentProfit >= acc.minBalance;
        const consistencyMet = !acc.consistency || !violation;
        const canUpgrade = daysMet && balanceMet && consistencyMet;

        let barClass = isLoss ? "bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-blue-600";
        let cardClass = isLoss ? "card-drawdown" : "";
        if(!isLoss && acc.stage === 2) cardClass = "stage-2";
        if(!isLoss && acc.stage >= 3) cardClass = "stage-3";

        container.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative ${cardClass} transition-all duration-500">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <span class="text-[9px] bg-slate-950 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-slate-800">Stage ${acc.stage}</span>
                        <h3 class="text-2xl font-black text-white italic mt-2 tracking-tight">${acc.name}</h3>
                    </div>
                    <button onclick="window.deleteAccount(${acc.id})" class="text-slate-800 hover:text-red-500">✕</button>
                </div>
                <div class="mb-8">
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-5xl font-black ${isLoss ? 'text-red-500' : 'text-white'} italic">$${acc.currentProfit.toLocaleString()}</span>
                        <div class="text-right text-[10px] font-mono font-bold text-slate-500 italic">Target: $${acc.target.toLocaleString()}</div>
                    </div>
                    <div class="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
                        <div class="progress-bar ${barClass} h-full rounded-full" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-8">
                    <div class="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                        <p class="text-[9px] text-slate-500 font-bold uppercase mb-1">Best Day</p>
                        <p class="text-sm font-mono ${violation ? 'text-red-500' : 'text-blue-400'} font-bold">$${acc.bestDay.toLocaleString()}</p>
                    </div>
                    <div class="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                        <p class="text-[9px] text-slate-500 font-bold uppercase mb-1">Days</p>
                        <p class="text-sm font-mono ${daysMet ? 'text-emerald-400' : 'text-slate-400'} font-bold tracking-wider">${acc.daysTraded} / ${acc.minDaysNeeded || 0}</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button onclick="window.logProfit(${acc.id})" class="flex-[2] bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition active:scale-95">Update</button>
                    <button onclick="window.showDetails(${acc.id})" class="flex-1 bg-slate-800 py-4 rounded-2xl font-bold text-xs uppercase text-slate-400 hover:bg-slate-700 transition active:scale-95">Audit</button>
                </div>
                ${canUpgrade ? `<button onclick="window.triggerPayout(${acc.id})" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-6 py-2 rounded-full animate-bounce shadow-xl uppercase">Payout Ready</button>` : ''}
            </div>`;
    });
}

// --- CORE FUNCTIONS ---

window.createAccount = function() {
    const newAcc = {
        id: Date.now(),
        name: document.getElementById('mName').value || "Unnamed",
        stage: 1,
        target: parseFloat(document.getElementById('mTarget').value) || 0,
        consistency: parseFloat(document.getElementById('mCons').value) || 0,
        minDaysNeeded: parseInt(document.getElementById('mMinDays').value) || 0,
        minProfitPerDay: parseFloat(document.getElementById('mMinProfit').value) || 0,
        minBalance: parseFloat(document.getElementById('mMinBalance').value) || 0,
        history: [], currentProfit: 0, daysTraded: 0, bestDay: 0
    };
    window.accounts.push(newAcc);
    window.saveAll();
    window.closeModal('setupModal');
};

window.logProfit = function(id) {
    const amount = parseFloat(prompt("Enter profit/loss:"));
    if (isNaN(amount)) return;
    const acc = window.accounts.find(a => a.id === id);
    if(!acc.history) acc.history = [];
    acc.history.push({ id: Date.now(), amount, date: new Date().toISOString() });
    recalculate(acc);
    window.saveAll();
};

window.showDetails = function(id) {
    window.activeId = id; // Critical: Set the global ID for the "Add" button
    const acc = window.accounts.find(a => a.id === id);
    if (!acc) return;

    const list = document.getElementById('historyList');
    const title = document.getElementById('detailsTitle');
    
    if(title) title.innerText = `${acc.name} Audit`;
    if(list) {
        list.innerHTML = '';
        const history = acc.history || [];
        [...history].reverse().forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'});
            list.innerHTML += `
                <div class="bg-slate-800/60 p-4 rounded-xl flex justify-between items-center border border-slate-700/50">
                    <div>
                        <p class="text-[10px] text-slate-500 font-bold uppercase">${date}</p>
                        <p class="${entry.amount >= 0 ? 'text-emerald-400' : 'text-red-400'} font-bold font-mono">$${entry.amount.toLocaleString()}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.editEntry(${acc.id}, ${entry.id})" class="text-xs bg-slate-700 px-3 py-1 rounded">Edit</button>
                        <button onclick="window.deleteEntry(${acc.id}, ${entry.id})" class="text-xs text-red-500 bg-red-900/20 px-3 py-1 rounded">✕</button>
                    </div>
                </div>`;
        });
    }
    window.openModal('detailsModal');
};

window.addManualDay = function() {
    const amountInput = document.getElementById('manualProfit');
    const dateInput = document.getElementById('manualDate');
    
    const amount = parseFloat(amountInput.value);
    const dateVal = dateInput.value;

    if (isNaN(amount) || !dateVal) return alert("Please enter both profit and date!");

    // Safety: Check if the date is valid before processing
    const parsedDate = new Date(dateVal);
    if (isNaN(parsedDate.getTime())) return alert("Invalid Date format!");

    const acc = window.accounts.find(a => a.id === window.activeId);
    if (!acc) return alert("Error: No active account selected. Close and reopen Audit.");

    if(!acc.history) acc.history = [];
    acc.history.push({ 
        id: Date.now(), 
        amount: amount, 
        date: parsedDate.toISOString() 
    });

    recalculate(acc);
    window.showDetails(window.activeId); // Refresh the list
    window.saveAll(); // Push to Firebase
    
    // Clear inputs
    amountInput.value = '';
    dateInput.value = '';
};

window.deleteEntry = function(accId, entryId) {
    if (confirm("Delete entry?")) {
        const acc = window.accounts.find(a => a.id === accId);
        acc.history = acc.history.filter(e => e.id !== entryId);
        recalculate(acc);
        window.showDetails(accId);
        window.saveAll();
    }
};

window.editEntry = function(accId, entryId) {
    const acc = window.accounts.find(a => a.id === accId);
    const entry = acc.history.find(e => e.id === entryId);
    const newVal = parseFloat(prompt("Edit amount:", entry.amount));
    if (!isNaN(newVal)) { 
        entry.amount = newVal; 
        recalculate(acc);
        window.showDetails(accId); 
        window.saveAll(); 
    }
};

window.deleteAccount = function(id) {
    if(confirm("Permanently delete account?")) {
        window.accounts = window.accounts.filter(a => a.id !== id);
        window.saveAll();
    }
};

function recalculate(acc) {
    if(!acc.history) acc.history = [];
    acc.history.sort((a, b) => new Date(a.date) - new Date(b.date));
    acc.currentProfit = acc.history.reduce((sum, e) => sum + e.amount, 0);
    const profitDays = acc.history.filter(h => h.amount > 0).map(h => h.amount);
    acc.bestDay = profitDays.length > 0 ? Math.max(...profitDays) : 0;
    const uniqueDays = new Set();
    acc.history.forEach(e => { 
        if (e.amount >= (acc.minProfitPerDay || 0)) uniqueDays.add(new Date(e.date).toDateString()); 
    });
    acc.daysTraded = uniqueDays.size;
}

window.triggerPayout = function(id) {
    console.log("Payout triggered for account:", id);
    window.activeId = id; // Store the ID so the payout knows where to go
    window.openModal('payoutModal');
};

// Function to edit balance anytime
window.editBalance = function(id) {
    const acc = window.accounts.find(a => a.id === id);
    const newTotal = parseFloat(prompt(`Current Balance: $${acc.currentProfit.toLocaleString()}\nEnter NEW Total Balance:`, acc.currentProfit));
    
    if (isNaN(newTotal)) return;

    // Calculate the adjustment needed
    const adjustment = newTotal - acc.currentProfit;

    if (!acc.history) acc.history = [];
    
    acc.history.push({
        id: Date.now(),
        amount: adjustment,
        date: new Date().toISOString(),
        isAdjustment: true // Mark as adjustment so it doesn't count as a trading day
    });

    recalculate(acc);
    window.saveAll();
};

// Update the recalculate function to IGNORE adjustments when counting trading days
function recalculate(acc) {
    if(!acc.history) acc.history = [];
    acc.history.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    acc.currentProfit = acc.history.reduce((sum, e) => sum + e.amount, 0);
    
    const dayTotals = {};
    acc.history.forEach(entry => {
        // Only count entries that are NOT adjustments for trading days
        if (!entry.isAdjustment) {
            const dateStr = new Date(entry.date).toDateString();
            dayTotals[dateStr] = (dayTotals[dateStr] || 0) + entry.amount;
        }
    });

    const dayValues = Object.values(dayTotals);
    acc.daysTraded = dayValues.filter(v => v >= (acc.minProfitPerDay || 0)).length;

    const profitDays = dayValues.filter(v => v > 0);
    acc.bestDay = profitDays.length > 0 ? Math.max(...profitDays) : 0;
}