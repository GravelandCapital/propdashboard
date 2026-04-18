export function renderPayouts() {
    const container = document.getElementById('payoutCalendar');
    if (!container) return;
    container.innerHTML = '';
    const groups = {};
    window.payoutHistory.forEach(p => {
        const date = new Date(p.date);
        const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!groups[key]) groups[key] = { total: 0, items: [] };
        groups[key].total += p.amount;
        groups[key].items.push(p);
    });
    
    Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).forEach(month => {
        container.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                <div class="absolute -right-4 -top-4 text-slate-800/20 text-6xl font-black rotate-12 select-none">${month.split(' ')[0]}</div>
                <h4 class="text-slate-500 text-[10px] font-bold uppercase mb-1">${month}</h4>
                <p class="text-3xl font-black text-emerald-400 italic mb-4">$${groups[month].total.toLocaleString()}</p>
                <div class="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                    ${groups[month].items.map(item => `
                        <div class="flex justify-between items-center text-[10px] font-mono border-b border-slate-800/50 pb-2">
                            <span class="text-slate-400 font-bold">${item.accountName}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-emerald-500 font-bold">+$${item.amount.toLocaleString()}</span>
                                <button onclick="window.deletePayout(${item.id})" class="text-slate-700 hover:text-red-500 transition">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    });
}

window.processPayout = function() {
    const amountInput = document.getElementById('payoutInput');
    const balanceInput = document.getElementById('newBalanceInput');
    const payoutAmount = parseFloat(amountInput.value) || 0;
    const remainingBalance = parseFloat(balanceInput.value) || 0;
    
    const acc = window.accounts.find(a => a.id === window.activeId);
    if (!acc) return;

    window.payoutHistory.push({ id: Date.now(), amount: payoutAmount, date: new Date().toISOString(), accountName: acc.name });
    
    acc.stage += 1;
    acc.history = []; // WIPE days history for the new stage
    
    // Add the starting balance as an adjustment (doesn't count as a trading day)
    acc.history.push({ id: Date.now(), amount: remainingBalance, date: new Date().toISOString(), isAdjustment: true });

    const nextTarget = parseFloat(prompt(`Upgrade to Stage ${acc.stage}! New Profit Target?`, acc.target));
    if(!isNaN(nextTarget)) acc.target = nextTarget;

    window.recalculate(acc);
    window.saveAll();
    window.closeModal('payoutModal');
    amountInput.value = '';
    balanceInput.value = '';
};

window.deletePayout = function(id) {
    if(confirm("Delete this payout record? (This will not change your account stage)")) {
        window.payoutHistory = window.payoutHistory.filter(p => p.id !== id);
        window.saveAll();
    }
};