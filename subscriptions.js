export function renderSubs() {
    const container = document.getElementById('subGrid');
    if(!container) return;
    container.innerHTML = '';
    if (window.subscriptions.length === 0) container.innerHTML = `<p class="text-slate-600 italic text-sm col-span-full text-center py-10">No active subscriptions.</p>`;
    window.subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.date);
        const diffDays = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));
        let statusClass = "text-emerald-400";
        if (diffDays <= 3) statusClass = "text-red-500 animate-pulse";
        else if (diffDays <= 7) statusClass = "text-amber-500";
        container.innerHTML += `<div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden"><div class="flex justify-between items-start mb-4"><h3 class="text-xl font-black text-white italic uppercase">${sub.name}</h3><button onclick="window.deleteSub(${sub.id})" class="text-slate-800 hover:text-red-500 transition">✕</button></div><div class="space-y-1"><p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Renews In</p><p class="text-3xl font-black ${statusClass} italic tracking-tighter">${diffDays < 0 ? 'Expired' : diffDays + ' Days'}</p></div><div class="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center"><span class="text-xs font-mono text-slate-400">${renewalDate.toLocaleDateString()}</span><span class="text-sm font-bold text-white">$${parseFloat(sub.cost).toLocaleString()}</span></div></div>`;
    });
}
window.createSubscription = function() {
    const name = document.getElementById('subName').value;
    const date = document.getElementById('subDate').value;
    const cost = document.getElementById('subCost').value;
    if (!name || !date) return alert("Fill fields!");
    window.subscriptions.push({ id: Date.now(), name, date, cost: cost || 0 });
    window.saveAll(); window.closeModal('subModal');
};
window.deleteSub = function(id) { if(confirm("Delete?")) { window.subscriptions = window.subscriptions.filter(s => s.id !== id); window.saveAll(); } };