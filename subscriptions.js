export function renderSubs() {
    const container = document.getElementById('subGrid');
    if(!container) return;
    container.innerHTML = '';

    window.subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.date);
        const today = new Date();
        const diffTime = renewalDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let statusClass = "text-emerald-400";
        if (diffDays <= 3) statusClass = "text-red-500 animate-pulse";
        else if (diffDays <= 7) statusClass = "text-amber-500";

        container.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-black text-white italic uppercase">${sub.name}</h3>
                    <button onclick="deleteSub(${sub.id})" class="text-slate-700 hover:text-red-500">✕</button>
                </div>
                <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Renews In</p>
                    <p class="text-3xl font-black ${statusClass} italic tracking-tighter">${diffDays} Days</p>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span class="text-xs font-mono text-slate-400">${renewalDate.toLocaleDateString()}</span>
                    <span class="text-sm font-bold text-white">$${sub.cost}</span>
                </div>
            </div>
        `;
    });
}

window.createSubscription = function() {
    const newSub = {
        id: Date.now(),
        name: document.getElementById('subName').value,
        date: document.getElementById('subDate').value,
        cost: document.getElementById('subCost').value || 0
    };
    window.subscriptions.push(newSub);
    window.saveAll();
    window.closeModal('subModal');
};

window.deleteSub = function(id) {
    if(confirm("Delete subscription tracker?")) {
        window.subscriptions = window.subscriptions.filter(s => s.id !== id);
        window.saveAll();
    }
};