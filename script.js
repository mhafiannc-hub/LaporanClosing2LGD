/**
 * Closing Dua Legenda Grup - Script Utama
 * Fitur: Kalkulasi, LocalStorage, Log Riwayat, dan Cetak PDF/Excel
 */

let expenses = [];
let categories = ['Operasional', 'Bahan Baku', 'Gaji', 'Listrik/Air', 'Lain-lain'];
let logs = [];

// --- INISIALISASI ---
window.onload = () => {
    loadDraft();
    loadLogs();
    renderCategories();
    renderExpenseInputs();
    renderLogs();
    calculateTotals();

    // Event listeners untuk simpan otomatis (Auto-save)
    const inputs = [
        'input-date', 'input-shift', 'input-modal', 'input-dinein', 
        'input-cash', 'input-qris', 'input-shopeefood', 'input-gofood', 
        'input-grabfood', 'input-reporter', 'input-branch'
    ];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                saveDraft();
                calculateTotals();
            });
        }
    });
};

// --- PENYIMPANAN DATA (LOCAL STORAGE) ---
function saveDraft() {
    const draft = {
        reporter: document.getElementById('input-reporter').value,
        branch: document.getElementById('input-branch').value,
        date: document.getElementById('input-date').value,
        shift: document.getElementById('input-shift').value,
        modal: document.getElementById('input-modal').value,
        dinein: document.getElementById('input-dinein').value,
        cash: document.getElementById('input-cash').value,
        qris: document.getElementById('input-qris').value,
        shopeefood: document.getElementById('input-shopeefood').value,
        gofood: document.getElementById('input-gofood').value,
        grabfood: document.getElementById('input-grabfood').value,
        categories,
        expenses
    };
    localStorage.setItem('duaLegendaDraft', JSON.stringify(draft));
}

function loadDraft() {
    const saved = localStorage.getItem('duaLegendaDraft');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('input-reporter').value = data.reporter || '';
        document.getElementById('input-branch').value = data.branch || 'Depot 2 Legenda';
        document.getElementById('input-date').value = data.date || new Date().toISOString().split('T')[0];
        document.getElementById('input-shift').value = data.shift || 'Shift 1';
        document.getElementById('input-modal').value = data.modal || 0;
        document.getElementById('input-dinein').value = data.dinein || 0;
        document.getElementById('input-cash').value = data.cash || 0;
        document.getElementById('input-qris').value = data.qris || 0;
        document.getElementById('input-shopeefood').value = data.shopeefood || 0;
        document.getElementById('input-gofood').value = data.gofood || 0;
        document.getElementById('input-grabfood').value = data.grabfood || 0;
        if (data.categories) categories = data.categories;
        if (data.expenses) expenses = data.expenses;
    } else {
        document.getElementById('input-date').value = new Date().toISOString().split('T')[0];
        expenses = [{ id: Date.now(), description: '', category: categories[0], price: 0, qty: 1, image: null }];
    }
}

function saveToLog() {
    const reportData = getReportData();
    const logItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('id-ID'),
        reporter: reportData.reporter,
        branch: reportData.branch,
        date: reportData.date,
        shift: reportData.shift,
        totalIncome: reportData.totalIncome,
        fullData: reportData
    };
    
    logs.unshift(logItem); // Tambah ke daftar teratas
    localStorage.setItem('duaLegendaLogs', JSON.stringify(logs));
    renderLogs();
    showMessage("Berhasil! Laporan disimpan ke riwayat.");
}

function loadLogs() {
    const saved = localStorage.getItem('duaLegendaLogs');
    if (saved) logs = JSON.parse(saved);
}

function resetDraft() {
    if (confirm('Tuan Rex, yakin ingin membersihkan form? Riwayat tersimpan tidak akan hilang.')) {
        localStorage.removeItem('duaLegendaDraft');
        location.reload();
    }
}

// --- LOG UI ---
function renderLogs() {
    const body = document.getElementById('log-list-body');
    if (logs.length === 0) {
        body.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-gray-400 italic">Belum ada riwayat laporan di perangkat ini.</td></tr>`;
        return;
    }
    body.innerHTML = logs.map(l => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
            <td class="py-3 px-2">
                <div class="font-bold text-gray-800">${l.date}</div>
                <div class="text-[10px] text-gray-500">${l.shift} | ${l.reporter}</div>
            </td>
            <td class="py-3 px-2 text-xs font-medium text-gray-600">${l.branch}</td>
            <td class="py-3 px-2 text-xs font-black text-indigo-600">${formatIDR(l.totalIncome)}</td>
            <td class="py-3 px-2">
                <div class="flex justify-center gap-3">
                    <button onclick="restoreFromLog(${l.id})" class="text-blue-500 hover:text-blue-700" title="Buka"><i class="fas fa-folder-open"></i></button>
                    <button onclick="deleteLog(${l.id})" class="text-red-300 hover:text-red-500" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteLog(id) {
    if (confirm('Hapus laporan ini dari memori perangkat?')) {
        logs = logs.filter(l => l.id !== id);
        localStorage.setItem('duaLegendaLogs', JSON.stringify(logs));
        renderLogs();
    }
}

function restoreFromLog(id) {
    const item = logs.find(l => l.id === id);
    if (item && confirm('Muat data riwayat ini ke formulir? Data yang sedang diisi akan diganti.')) {
        const d = item.fullData;
        document.getElementById('input-reporter').value = d.reporter;
        document.getElementById('input-branch').value = d.branch;
        document.getElementById('input-date').value = d.date;
        document.getElementById('input-shift').value = d.shift;
        document.getElementById('input-modal').value = d.modal;
        document.getElementById('input-dinein').value = d.dinein;
        document.getElementById('input-cash').value = d.cash;
        document.getElementById('input-qris').value = d.qris;
        document.getElementById('input-shopeefood').value = d.shopee;
        document.getElementById('input-gofood').value = d.gofood;
        document.getElementById('input-grabfood').value = d.grab;
        expenses = d.expenses;
        
        renderExpenseInputs();
        calculateTotals();
        saveDraft();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- KALKULASI UTAMA ---
function formatIDR(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

function calculateTotals() {
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const dinein = parseFloat(document.getElementById('input-dinein').value) || 0;
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;
    const shopee = parseFloat(document.getElementById('input-shopeefood').value) || 0;
    const gofood = parseFloat(document.getElementById('input-gofood').value) || 0;
    const grab = parseFloat(document.getElementById('input-grabfood').value) || 0;

    const totalIncome = (cash + qris) - modal;
    const totalExpense = expenses.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);
    const grossProfit = dinein - totalExpense;
    const gap = totalIncome - grossProfit;

    // Sinkronisasi ke Pratinjau Struk
    document.getElementById('res-branch').innerText = document.getElementById('input-branch').value;
    document.getElementById('res-date').innerText = 'Tgl: ' + (document.getElementById('input-date').value || '-');
    document.getElementById('res-shift').innerText = 'Shift: ' + document.getElementById('input-shift').value;
    document.getElementById('res-reporter').innerText = 'Kasir: ' + (document.getElementById('input-reporter').value || '-');
    document.getElementById('res-modal').innerText = formatIDR(modal);
    document.getElementById('res-dinein').innerText = formatIDR(dinein);
    document.getElementById('res-cash').innerText = formatIDR(cash);
    document.getElementById('res-qris').innerText = formatIDR(qris);
    document.getElementById('res-shopeefood').innerText = formatIDR(shopee);
    document.getElementById('res-gofood').innerText = formatIDR(gofood);
    document.getElementById('res-grabfood').innerText = formatIDR(grab);
    document.getElementById('res-total-income').innerText = formatIDR(totalIncome);
    document.getElementById('res-total-expense').innerText = formatIDR(totalExpense);
    document.getElementById('res-gross-profit').innerText = formatIDR(grossProfit);
    
    const gapEl = document.getElementById('res-gap');
    gapEl.innerText = formatIDR(gap);
    gapEl.className = gap < 0 ? "text-red-600 font-bold" : (gap > 0 ? "text-green-600 font-bold" : "text-black font-bold");

    const resList = document.getElementById('res-expense-list');
    resList.innerHTML = expenses.length > 0 ? 
        expenses.map(e => `<div class="flex justify-between"><span>${e.qty}x ${e.description || '...'}</span><span>${formatIDR(e.price * e.qty)}</span></div>`).join('') : 
        '<div class="text-center italic opacity-40 py-2">Belum ada pengeluaran</div>';
    
    document.getElementById('print-timestamp').innerText = new Date().toLocaleString('id-ID');
}

// --- PENGELUARAN UI ---
function renderExpenseInputs() {
    const container = document.getElementById('expense-container');
    container.innerHTML = expenses.map(exp => `
        <div class="p-5 bg-white rounded-2xl border border-gray-200 relative shadow-sm hover:border-blue-300 transition-all">
            <div class="grid grid-cols-12 gap-4 items-start">
                <div class="col-span-12 lg:col-span-5">
                    <label class="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Deskripsi Item</label>
                    <textarea placeholder="..." oninput="updateExpense(${exp.id}, 'description', this.value)" 
                        class="w-full text-sm rounded-xl border-gray-200 p-3 border focus:ring-2 focus:ring-blue-500 outline-none min-h-[42px] resize-none">${exp.description}</textarea>
                </div>
                <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                    <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Kategori</label>
                    <select onchange="updateExpense(${exp.id}, 'category', this.value)" class="w-full text-sm rounded-xl border-gray-200 p-3 border bg-gray-50 h-[46px]">
                        ${categories.map(c => `<option value="${c}" ${exp.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                    <label class="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider text-right">Harga Satuan</label>
                    <input type="number" value="${exp.price}" oninput="updateExpense(${exp.id}, 'price', this.value)" 
                        class="w-full text-sm rounded-xl border-gray-200 p-3 border focus:ring-2 focus:ring-blue-500 outline-none font-bold h-[46px] text-right">
                </div>
                <div class="col-span-6 lg:col-span-1">
                    <label class="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider text-center">Qty</label>
                    <input type="number" value="${exp.qty}" oninput="updateExpense(${exp.id}, 'qty', this.value)" 
                        class="w-full text-sm rounded-xl border-gray-300 p-3 border text-center h-[46px] font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div class="col-span-6 lg:col-span-2 flex flex-col">
                    <label class="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Nota Fisik</label>
                    <div class="flex items-center gap-2">
                        <label class="cursor-pointer bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-2 flex items-center justify-center hover:bg-blue-100 transition shadow-sm w-full h-[46px]">
                            <i class="fas fa-camera text-blue-500 text-lg"></i>
                            <input type="file" accept="image/*" class="hidden" onchange="handleImage(${exp.id}, event)">
                        </label>
                        ${exp.image ? `<img src="${exp.image}" class="image-preview-thumb shadow-sm">` : ''}
                    </div>
                </div>
                <button onclick="removeExpenseRow(${exp.id})" class="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full shadow hover:bg-red-700 transition flex items-center justify-center"><i class="fas fa-times text-xs"></i></button>
            </div>
        </div>`).join('');
}

function updateExpense(id, field, value) {
    const idx = expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
        expenses[idx][field] = (field === 'price' || field === 'qty') ? parseFloat(value) || 0 : value;
        saveDraft();
        calculateTotals();
    }
}

function addExpenseRow() {
    expenses.push({ id: Date.now(), description: '', category: categories[0], price: 0, qty: 1, image: null });
    saveDraft();
    renderExpenseInputs();
    calculateTotals();
}

function removeExpenseRow(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveDraft();
    renderExpenseInputs();
    calculateTotals();
}

function handleImage(id, event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const idx = expenses.findIndex(ex => ex.id === id);
        if (idx !== -1) {
            expenses[idx].image = e.target.result;
            saveDraft();
            renderExpenseInputs();
        }
    };
    reader.readAsDataURL(file);
}

// --- MANAJEMEN KATEGORI ---
function renderCategories() {
    const container = document.getElementById('category-chips');
    container.innerHTML = categories.map((cat, idx) => `
        <div class="flex items-center bg-white px-3 py-1 rounded-full text-[10px] font-bold border border-purple-200 text-purple-700 shadow-sm">
            <span>${cat}</span><button onclick="removeCategory(${idx})" class="ml-2 text-red-400 font-bold">×</button>
        </div>
    `).join('');
    renderExpenseInputs();
}

function addCategory() {
    const input = document.getElementById('new-cat-input');
    const val = input.value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        input.value = '';
        saveDraft();
        renderCategories();
    }
}

function removeCategory(idx) {
    if (categories.length > 1) {
        categories.splice(idx, 1);
        saveDraft();
        renderCategories();
    }
}

// --- SISTEM CETAK & EKSPOR ---
function getReportData() {
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const dinein = parseFloat(document.getElementById('input-dinein').value) || 0;
    const totalExpense = expenses.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);
    
    return {
        branch: document.getElementById('input-branch').value,
        reporter: document.getElementById('input-reporter').value || '-',
        date: document.getElementById('input-date').value || '-',
        shift: document.getElementById('input-shift').value,
        modal, dinein, cash, qris,
        shopee: parseFloat(document.getElementById('input-shopeefood').value) || 0,
        gofood: parseFloat(document.getElementById('input-gofood').value) || 0,
        grab: parseFloat(document.getElementById('input-grabfood').value) || 0,
        totalIncome: (cash + qris) - modal,
        totalExpense,
        grossProfit: dinein - totalExpense,
        expenses: [...expenses]
    };
}

function printType(type) {
    const area = document.getElementById('print-area');
    const data = getReportData();
    area.innerHTML = '';
    document.body.className = ''; 

    if (type === 'receipt') {
        document.body.classList.add('print-receipt');
        area.appendChild(document.getElementById('receipt-preview').cloneNode(true));
    } else if (type === 'pdf') {
        document.body.classList.add('print-pdf');
        // Gabungkan halaman laporan A4 dan lampiran foto nota
        area.innerHTML = generateA4Report(data) + `<div class="page-break"></div>` + generateNotaAttachment(data);
    } else if (type === 'attachment') {
        document.body.classList.add('print-attachment');
        area.innerHTML = generateNotaAttachment(data);
    }
    
    // Beri waktu browser memproses konten sebelum jendela cetak muncul
    setTimeout(() => { window.print(); }, 350);
}

function generateA4Report(d) {
    const gap = d.totalIncome - d.grossProfit;
    return `
        <div class="p-8 bg-white font-sans text-sm">
            <div class="flex justify-between items-start border-b-4 border-gray-900 pb-4 mb-6">
                <div><h1 class="text-3xl font-black uppercase tracking-tighter">Dua Legenda Grup</h1><p class="text-lg font-bold text-gray-500">${d.branch.toUpperCase()}</p></div>
                <div class="text-right font-bold uppercase tracking-tight"><h2 class="text-xl">Laporan Closing Harian</h2><p class="text-gray-600">${d.date} | ${d.shift}</p></div>
            </div>
            <div class="grid grid-cols-2 gap-8 mb-6">
                <div class="space-y-2">
                    <h3 class="text-lg font-bold border-b border-gray-300 uppercase tracking-widest text-blue-800">Ringkasan Kas</h3>
                    <div class="flex justify-between"><span>Pelapor:</span><span class="font-bold">${d.reporter}</span></div>
                    <div class="flex justify-between"><span>Modal Awal:</span><span>${formatIDR(d.modal)}</span></div>
                    <div class="flex justify-between"><span>Uang Cash:</span><span>${formatIDR(d.cash)}</span></div>
                    <div class="flex justify-between"><span>QRIS/Transfer:</span><span>${formatIDR(d.qris)}</span></div>
                    <div class="flex justify-between border-t-2 border-black pt-2 font-black text-xl"><span>Total Didapat:</span><span>${formatIDR(d.totalIncome)}</span></div>
                </div>
                <div class="space-y-2">
                    <h3 class="text-lg font-bold border-b border-gray-300 uppercase tracking-widest text-indigo-800">Hasil Akhir</h3>
                    <div class="flex justify-between"><span>Omzet (Dine In):</span><span>${formatIDR(d.dinein)}</span></div>
                    <div class="flex justify-between"><span>Total Keluar:</span><span class="text-red-600">${formatIDR(d.totalExpense)}</span></div>
                    <div class="flex justify-between text-xl font-bold mt-2"><span>LABA KOTOR:</span><span>${formatIDR(d.grossProfit)}</span></div>
                    <div class="p-3 bg-gray-100 rounded-lg flex justify-between text-2xl font-black"><span>SELISIH:</span><span>${formatIDR(gap)}</span></div>
                </div>
            </div>
            <div class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <h3 class="text-[10px] font-black text-orange-700 mb-2 uppercase tracking-widest">Penjualan Online Food</h3>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div><p class="text-[9p
