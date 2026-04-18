// --- PAYOUTS.JS ---

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

    // Sort months descending
    Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).forEach(month => {
        container.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                <div class="absolute -right-4 -top-4 text-slate-800/20 text-6xl font-black rotate-12 select-none">${month.split(' ')[0]}</div>
                <h4 class="text-slate-500 text-[10px] font-bold uppercase mb-1">${month}</h4>
                <p class="text-3xl font-black text-emerald-400 tracking-tighter italic mb-4">$${groups[month].total.toLocaleString()}</p>
                <div class="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                    ${groups[month].items.map(item => `
                        <div class="flex justify-between items-center text-[10px] font-mono border-b border-slate-800/50 pb-2">
                            <span class="text-slate-400 font-bold">${item.accountName}</span>
                            <span class="text-emerald-500 font-bold">+$${item.amount.toLocaleString()}</span>
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
    if (!acc) return alert("Account not found.");

    // 1. Record the payout in your global Payout History (Calendar)
    window.payoutHistory.push({
        id: Date.now(),
        amount: payoutAmount,
        date: new Date().toISOString(),
        accountName: acc.name
    });

    // 2. Upgrade the Stage
    acc.stage += 1;

    // 3. WIPE History & Reset Trading Days
    // We clear the history so the "Days Traded" starts at 0 for the new stage.
    acc.history = []; 
    
    // 4. Start the new stage with the remaining balance
    // We add this as a special entry so the audit log shows where the money started.
    acc.history.push({
        id: Date.now(),
        amount: remainingBalance,
        date: new Date().toISOString(),
        isAdjustment: true // We flag this so it doesn't count as a "Trading Day"
    });

    // 5. Prompt for new Target
    const nextTarget = parseFloat(prompt(`Upgrade to Stage ${acc.stage}! New Profit Target?`, acc.target));
    if(!isNaN(nextTarget)) acc.target = nextTarget;

    // 6. Save and Refresh
    window.saveAll();
    window.closeModal('payoutModal');
    
    // Clear inputs for next time
    amountInput.value = '';
    balanceInput.value = '';
};