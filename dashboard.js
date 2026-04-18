export function renderFleet() {
    const container = document.getElementById('grid');
    if (!container) return;
    container.innerHTML = '';

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
                    <div class="flex gap-2">
                        <button onclick="window.openEditAccount(${acc.id})" class="text-slate-700 hover:text-white transition">⚙️</button>
                        <button onclick="window.deleteAccount(${acc.id})" class="text-slate-800 hover:text-red-500 transition">✕</button>
                    </div>
                </div>
                <div class="mb-8">
                    <div class="flex justify-between items-end mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-5xl font-black ${isLoss ? 'text-red-500' : 'text-white'} italic">$${acc.currentProfit.toLocaleString()}</span>
                            <button onclick="window.editBalance(${acc.id})" class="text-slate-700 hover:text-blue-400 transition text-sm">✎</button>
                        </div>
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
                        <p class="text-[9px] text-slate-500 font-bold uppercase mb-1">Days (Min $${acc.minProfitPerDay || 0})</p>
                        <p class="text-sm font-mono ${daysMet ? 'text-emerald-400' : 'text-slate-400'} font-bold tracking-wider">${acc.daysTraded} / ${acc.minDaysNeeded || 0}</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button onclick="window.logProfit(${acc.id})" class="flex-[2] bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition active:scale-95">Update</button>
                    <button onclick="window.showDetails(${acc.id})" class="flex-1 bg-slate-800 py-4 rounded-2xl font-bold text-xs uppercase text-slate-400 hover:bg-slate-700 transition active:scale-95">Audit</button>
                </div>
                ${canUpgrade ? `<button onclick="window.triggerPayout(${acc.id})" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-6 py-2 rounded-full animate-bounce shadow-xl uppercase whitespace-nowrap">Payout Ready</button>` : ''}
            </div>`;
    });
}

window.openEditAccount = function(id) {
    window.activeId = id;
    const acc = window.accounts.find(a => a.id === id);
    document.getElementById('editName').value = acc.name;
    document.getElementById('editStage').value = acc.stage;
    document.getElementById('editTarget').value = acc.target;
    document.getElementById('editCons').value = acc.consistency;
    document.getElementById('editDayOffset').value = acc.dayOffset || 0;
    window.openModal('editAccountModal');
};

window.updateAccount = function() {
    const acc = window.accounts.find(a => a.id === window.activeId);
    acc.name = document.getElementById('editName').value;
    acc.stage = parseInt(document.getElementById('editStage').value);
    acc.target = parseFloat(document.getElementById('editTarget').value);
    acc.consistency = parseFloat(document.getElementById('editCons').value);
    acc.dayOffset = parseInt(document.getElementById('editDayOffset').value) || 0;
    
    window.recalculate(acc);
    window.saveAll();
    window.closeModal('editAccountModal');
};

window.editBalance = function(id) {
    const acc = window.accounts.find(a => a.id === id);
    const newTotal = parseFloat(prompt(`Current Balance: $${acc.currentProfit.toLocaleString()}\nEnter NEW Total Balance:`, acc.currentProfit));
    if (isNaN(newTotal)) return;
    const adjustment = newTotal - acc.currentProfit;
    if(!acc.history) acc.history = [];
    acc.history.push({ id: Date.now(), amount: adjustment, date: new Date().toISOString(), isAdjustment: true });
    window.recalculate(acc);
    window.saveAll();
};

window.recalculate = function(acc) {
    if(!acc.history) acc.history = [];
    acc.history.sort((a, b) => new Date(a.date) - new Date(b.date));
    acc.currentProfit = acc.history.reduce((sum, e) => sum + e.amount, 0);
    
    const dayTotals = {};
    acc.history.forEach(e => {
        if (!e.isAdjustment) {
            const date = new Date(e.date).toDateString();
            dayTotals[date] = (dayTotals[date] || 0) + e.amount;
        }
    });

    const dayValues = Object.values(dayTotals);
    const minReq = acc.minProfitPerDay || 0;
    
    // Total days = Calculated days + Manual Offset
    acc.daysTraded = dayValues.filter(v => v >= minReq).length + (acc.dayOffset || 0);

    const profitDays = dayValues.filter(v => v > 0);
    acc.bestDay = profitDays.length > 0 ? Math.max(...profitDays) : 0;
};

// ... Rest of the functions (createAccount, deleteAccount, showDetails, etc.) stay exactly the same ...
window.showDetails = function(id) {
    window.activeId = id;
    const acc = window.accounts.find(a => a.id === id);
    if (!acc) return;
    const list = document.getElementById('historyList');
    document.getElementById('detailsTitle').innerText = `${acc.name} Audit`;
    list.innerHTML = '';
    [...(acc.history || [])].reverse().forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'});
        list.innerHTML += `<div class="bg-slate-800/60 p-4 rounded-xl flex justify-between items-center border border-slate-700/50"><div><p class="text-[10px] text-slate-500 font-bold uppercase">${date}${entry.isAdjustment ? ' [ADJ]' : ''}</p><p class="${entry.amount >= 0 ? 'text-emerald-400' : 'text-red-400'} font-bold font-mono">$${entry.amount.toLocaleString()}</p></div><div class="flex gap-2"><button onclick="window.editEntry(${acc.id}, ${entry.id})" class="text-xs bg-slate-700 px-3 py-1 rounded">Edit</button><button onclick="window.deleteEntry(${acc.id}, ${entry.id})" class="text-red-500 text-xs px-3">✕</button></div></div>`;
    });
    window.openModal('detailsModal');
};
window.addManualDay = function() {
    const amountVal = document.getElementById('manualProfit').value;
    const dateVal = document.getElementById('manualDate').value;
    if (!amountVal || !dateVal) return alert("Fill fields!");
    const acc = window.accounts.find(a => a.id === window.activeId);
    acc.history.push({ id: Date.now(), amount: parseFloat(amountVal), date: new Date(dateVal).toISOString() });
    window.recalculate(acc); window.saveAll(); window.showDetails(window.activeId);
    document.getElementById('manualProfit').value = '';
};
window.triggerPayout = function(id) { window.activeId = id; window.openModal('payoutModal'); };
window.createAccount = function() {
    const newAcc = { id: Date.now(), name: document.getElementById('mName').value || "Unnamed", stage: 1, target: parseFloat(document.getElementById('mTarget').value) || 0, consistency: parseFloat(document.getElementById('mCons').value) || 0, minDaysNeeded: parseInt(document.getElementById('mMinDays').value) || 0, minProfitPerDay: parseFloat(document.getElementById('mMinProfit').value) || 0, minBalance: parseFloat(document.getElementById('mMinBalance').value) || 0, history: [], currentProfit: 0, daysTraded: 0, bestDay: 0, dayOffset: 0 };
    window.accounts.push(newAcc); window.saveAll(); window.closeModal('setupModal');
};
window.logProfit = function(id) { const amount = parseFloat(prompt("Enter profit/loss:")); if (isNaN(amount)) return; const acc = window.accounts.find(a => a.id === id); acc.history.push({ id: Date.now(), amount, date: new Date().toISOString() }); window.recalculate(acc); window.saveAll(); };
window.deleteEntry = function(accId, entryId) { if (confirm("Delete?")) { const acc = window.accounts.find(a => a.id === accId); acc.history = acc.history.filter(e => e.id !== entryId); window.recalculate(acc); window.showDetails(accId); window.saveAll(); } };
window.editEntry = function(accId, entryId) { const acc = window.accounts.find(a => a.id === accId); const entry = acc.history.find(e => e.id === entryId); const newVal = parseFloat(prompt("Edit amount:", entry.amount)); if (!isNaN(newVal)) { entry.amount = newVal; window.recalculate(acc); window.showDetails(accId); window.saveAll(); } };
window.deleteAccount = function(id) { if(confirm("Delete?")) { window.accounts = window.accounts.filter(a => a.id !== id); window.saveAll(); } };