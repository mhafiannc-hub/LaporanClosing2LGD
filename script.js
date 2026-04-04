let expenses = [];
let categories = ['Operasional', 'Bahan Baku', 'Gaji', 'Listrik/Air', 'Lain-lain'];
let logs = [];

// --- SISTEM PENYIMPANAN ---
window.onload = () => {
    loadInitialData();
    renderCategories();
    renderExpenseInputs();
    renderLogs();
    calculateTotals();

    const inputs = [
        'input-date', 'input-shift', 'input-modal', 'input-dinein',
        'input-cash', 'input-qris', 'input-shopeefood', 'input-gofood',
        'input-grabfood', 'input-reporter', 'input-branch'
    ];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            saveDraft();
            calculateTotals();
        });
    });
};

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
        expenses,
        categories
    };
    localStorage.setItem('kasir_draft', JSON.stringify(draft));
}

function loadInitialData() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('input-date').value = today;

    const saved = localStorage.getItem('kasir_draft');
    if (saved) {
        const d = JSON.parse(saved);
        document.getElementById('input-reporter').value = d.reporter || '';
        document.getElementById('input-branch').value = d.branch || 'Depot 2 Legenda';
        document.getElementById('input-date').value = d.date || today;
        document.getElementById('input-shift').value = d.shift || 'Shift 1';
        document.getElementById('input-modal').value = d.modal || 0;
        document.getElementById('input-dinein').value = d.dinein || 0;
        document.getElementById('input-cash').value = d.cash || 0;
        document.getElementById('input-qris').value = d.qris || 0;
        document.getElementById('input-shopeefood').value = d.shopeefood || 0;
        document.getElementById('input-gofood').value = d.gofood || 0;
        document.getElementById('input-grabfood').value = d.grabfood || 0;
        expenses = d.expenses || [];
        categories = d.categories || categories;
    }

    const savedLogs = localStorage.getItem('kasir_logs');
    if (savedLogs) logs = JSON.parse(savedLogs);
}

function resetDraft() {
    if (!confirm('Reset semua data form? Log riwayat tidak akan terhapus.')) return;
    expenses = [];
    localStorage.removeItem('kasir_draft');
    document.getElementById('input-reporter').value = '';
    document.getElementById('input-modal').value = 0;
    document.getElementById('input-dinein').value = 0;
    document.getElementById('input-cash').value = 0;
    document.getElementById('input-qris').value = 0;
    document.getElementById('input-shopeefood').value = 0;
    document.getElementById('input-gofood').value = 0;
    document.getElementById('input-grabfood').value = 0;
    renderExpenseInputs();
    calculateTotals();
    showMsg('Form berhasil direset!');
}

// --- KATEGORI ---
function renderCategories() {
    const container = document.getElementById('category-chips');
    container.innerHTML = '';
    categories.forEach((cat, i) => {
        const chip = document.createElement('div');
        chip.className = 'flex items-center gap-1 bg-white border border-purple-200 rounded-full px-3 py-1 text-xs font-bold text-purple-700 shadow-sm';
        chip.innerHTML = `
            <span>${cat}</span>
            <button onclick="removeCategory(${i})" class="text-red-400 hover:text-red-600 ml-1 font-black">&times;</button>
        `;
        container.appendChild(chip);
    });
}

function addCategory() {
    const input = document.getElementById('new-cat-input');
    const val = input.value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        input.value = '';
        renderCategories();
        renderExpenseInputs();
        saveDraft();
        showMsg(`Kategori "${val}" ditambahkan!`);
    }
}

function removeCategory(index) {
    categories.splice(index, 1);
    renderCategories();
    renderExpenseInputs();
    saveDraft();
}

// --- PENGELUARAN ---
function addExpenseRow() {
    expenses.push({ category: categories[0] || '', description: '', amount: 0, note: '', images: [] });
    renderExpenseInputs();
    saveDraft();
}

function removeExpenseRow(index) {
    expenses.splice(index, 1);
    renderExpenseInputs();
    calculateTotals();
    saveDraft();
}

function updateExpense(index, field, value) {
    expenses[index][field] = value;
    calculateTotals();
    saveDraft();
}

function renderExpenseInputs() {
    const container = document.getElementById('expense-container');
    container.innerHTML = '';
    if (expenses.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-300 py-8 text-sm italic">Belum ada pengeluaran. Klik "Tambah Baris".</p>';
        return;
    }
    expenses.forEach((exp, i) => {
        const card = document.createElement('div');
        card.className = 'expense-card bg-red-50 rounded-2xl border border-red-100 p-4 space-y-3';
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-xs font-black text-red-400 uppercase tracking-widest">Pengeluaran #${i + 1}</span>
                <button onclick="removeExpenseRow(${i})" class="text-red-400 hover:text-red-600 font-bold text-lg leading-none z-50 relative">&times;</button>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase">Kategori</label>
                    <select onchange="updateExpense(${i}, 'category', this.value)" class="mt-1 w-full rounded-xl border border-red-200 bg-white p-2 text-sm font-bold">
                        ${categories.map(c => `<option value="${c}" ${exp.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase">Jumlah (Rp)</label>
                    <input type="number" value="${exp.amount}" oninput="updateExpense(${i}, 'amount', parseFloat(this.value)||0)" class="mt-1 w-full rounded-xl border border-red-200 bg-white p-2 text-sm font-bold text-red-600">
                </div>
            </div>
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase">Keterangan</label>
                <input type="text" value="${exp.description}" oninput="updateExpense(${i}, 'description', this.value)" placeholder="Nama item / vendor..." class="mt-1 w-full rounded-xl border border-red-200 bg-white p-2 text-sm">
            </div>
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase">Catatan Tambahan</label>
                <input type="text" value="${exp.note || ''}" oninput="updateExpense(${i}, 'note', this.value)" placeholder="Opsional..." class="mt-1 w-full rounded-xl border border-red-200 bg-white p-2 text-sm text-gray-500">
            </div>
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase">Upload Nota / Bukti</label>
                <input type="file" accept="image/*" multiple onchange="handleImageUpload(${i}, this)" class="mt-1 w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                <div id="img-preview-${i}" class="flex flex-wrap gap-2 mt-2">
                    ${(exp.images || []).map(src => `<img src="${src}" class="image-preview-thumb">`).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleImageUpload(index, input) {
    const files = Array.from(input.files);
    const readers = files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
        expenses[index].images = (expenses[index].images || []).concat(results);
        const preview = document.getElementById(`img-preview-${index}`);
        preview.innerHTML = expenses[index].images.map(src => `<img src="${src}" class="image-preview-thumb">`).join('');
        saveDraft();
    });
}

// --- KALKULASI ---
function fmt(n) {
    return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function calculateTotals() {
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const dinein = parseFloat(document.getElementById('input-dinein').value) || 0;
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;
    const shopeefood = parseFloat(document.getElementById('input-shopeefood').value) || 0;
    const gofood = parseFloat(document.getElementById('input-gofood').value) || 0;
    const grabfood = parseFloat(document.getElementById('input-grabfood').value) || 0;
    const reporter = document.getElementById('input-reporter').value;
    const branch = document.getElementById('input-branch').value;
    const date = document.getElementById('input-date').value;
    const shift = document.getElementById('input-shift').value;

    const totalIncome = cash + qris - modal;
    const totalExpense = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const grossProfit = totalIncome - totalExpense;
    const gap = (cash + qris) - dinein;

    // Update Preview
    document.getElementById('res-branch').textContent = branch.toUpperCase();
    document.getElementById('res-date').textContent = 'Tgl: ' + (date || '-');
    document.getElementById('res-shift').textContent = 'Shift: ' + shift;
    document.getElementById('res-reporter').textContent = 'Kasir: ' + (reporter || '-');
    document.getElementById('res-dinein').textContent = fmt(dinein);
    document.getElementById('res-cash').textContent = fmt(cash);
    document.getElementById('res-qris').textContent = fmt(qris);
    document.getElementById('res-modal').textContent = fmt(modal);
    document.getElementById('res-total-income').textContent = fmt(totalIncome);
    document.getElementById('res-total-expense').textContent = fmt(totalExpense);
    document.getElementById('res-gross-profit').textContent = fmt(grossProfit);
    document.getElementById('res-gap').textContent = fmt(gap);
    document.getElementById('res-shopeefood').textContent = fmt(shopeefood);
    document.getElementById('res-gofood').textContent = fmt(gofood);
    document.getElementById('res-grabfood').textContent = fmt(grabfood);

    // Expense list in preview
    const expList = document.getElementById('res-expense-list');
    expList.innerHTML = '';
    expenses.forEach(e => {
        if (e.description || e.amount) {
            const row = document.createElement('div');
            row.className = 'flex justify-between';
            row.innerHTML = `<span class="truncate">${e.category}: ${e.description}</span><span>${fmt(e.amount)}</span>`;
            expList.appendChild(row);
        }
    });

    // Timestamp
    document.getElementById('print-timestamp').textContent = new Date().toLocaleString('id-ID');
}

// --- LOG ---
function saveToLog() {
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;
    const totalExpense = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netIncome = (cash + qris - modal) - totalExpense;

    const entry = {
        id: Date.now(),
        date: document.getElementById('input-date').value,
        shift: document.getElementById('input-shift').value,
        branch: document.getElementById('input-branch').value,
        reporter: document.getElementById('input-reporter').value,
        modal,
        dinein: parseFloat(document.getElementById('input-dinein').value) || 0,
        cash,
        qris,
        shopeefood: parseFloat(document.getElementById('input-shopeefood').value) || 0,
        gofood: parseFloat(document.getElementById('input-gofood').value) || 0,
        grabfood: parseFloat(document.getElementById('input-grabfood').value) || 0,
        totalExpense,
        netIncome,
        expenses: JSON.parse(JSON.stringify(expenses))
    };

    logs.unshift(entry);
    localStorage.setItem('kasir_logs', JSON.stringify(logs));
    renderLogs();
    showMsg('Laporan berhasil disimpan ke log!');
}

function deleteLog(id) {
    if (!confirm('Hapus entri log ini?')) return;
    logs = logs.filter(l => l.id !== id);
    localStorage.setItem('kasir_logs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const tbody = document.getElementById('log-list-body');
    tbody.innerHTML = '';
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-gray-300 text-sm italic">Belum ada log tersimpan.</td></tr>';
        return;
    }
    logs.forEach(log => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-50 hover:bg-gray-50 transition';
        tr.innerHTML = `
            <td class="py-3 px-2">
                <div class="font-bold text-xs">${log.date}</div>
                <div class="text-[10px] text-gray-400">${log.shift}</div>
            </td>
            <td class="py-3 px-2 text-xs font-bold text-gray-600">${log.branch}</td>
            <td class="py-3 px-2 text-xs font-bold ${log.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}">${fmt(log.netIncome)}</td>
            <td class="py-3 px-2 text-center">
                <button onclick="loadLog(${log.id})" class="text-blue-500 hover:text-blue-700 mr-2 text-xs font-bold">Muat</button>
                <button onclick="deleteLog(${log.id})" class="text-red-400 hover:text-red-600 text-xs font-bold">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadLog(id) {
    const log = logs.find(l => l.id === id);
    if (!log) return;
    document.getElementById('input-reporter').value = log.reporter;
    document.getElementById('input-branch').value = log.branch;
    document.getElementById('input-date').value = log.date;
    document.getElementById('input-shift').value = log.shift;
    document.getElementById('input-modal').value = log.modal;
    document.getElementById('input-dinein').value = log.dinein;
    document.getElementById('input-cash').value = log.cash;
    document.getElementById('input-qris').value = log.qris;
    document.getElementById('input-shopeefood').value = log.shopeefood;
    document.getElementById('input-gofood').value = log.gofood;
    document.getElementById('input-grabfood').value = log.grabfood;
    expenses = JSON.parse(JSON.stringify(log.expenses || []));
    renderExpenseInputs();
    calculateTotals();
    showMsg('Log berhasil dimuat!');
}

// --- EXPORT EXCEL ---
function exportToExcel() {
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;
    const totalExpense = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
        ['LAPORAN KASIR - DUA LEGENDA GRUP'],
        [],
        ['Cabang', document.getElementById('input-branch').value],
        ['Kasir', document.getElementById('input-reporter').value],
        ['Tanggal', document.getElementById('input-date').value],
        ['Shift', document.getElementById('input-shift').value],
        [],
        ['PENJUALAN', ''],
        ['Modal Awal', modal],
        ['Omzet Dine In', parseFloat(document.getElementById('input-dinein').value) || 0],
        ['Cash', cash],
        ['QRIS/Transfer', qris],
        ['ShopeeFood', parseFloat(document.getElementById('input-shopeefood').value) || 0],
        ['GoFood', parseFloat(document.getElementById('input-gofood').value) || 0],
        ['GrabFood', parseFloat(document.getElementById('input-grabfood').value) || 0],
        [],
        ['PENGELUARAN', ''],
        ...expenses.map(e => [e.category + ': ' + e.description, parseFloat(e.amount) || 0]),
        [],
        ['TOTAL KELUAR', totalExpense],
        ['LABA BERSIH', cash + qris - modal - totalExpense]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    // Sheet 2: Log
    if (logs.length > 0) {
        const logHeaders = ['Tanggal', 'Shift', 'Cabang', 'Kasir', 'Cash', 'QRIS', 'Total Keluar', 'Laba Bersih'];
        const logRows = logs.map(l => [l.date, l.shift, l.branch, l.reporter, l.cash, l.qris, l.totalExpense, l.netIncome]);
        const ws2 = XLSX.utils.aoa_to_sheet([logHeaders, ...logRows]);
        XLSX.utils.book_append_sheet(wb, ws2, 'Riwayat Log');
    }

    XLSX.writeFile(wb, `laporan_kasir_${document.getElementById('input-date').value}.xlsx`);
    showMsg('File Excel berhasil diunduh!');
}

// --- CETAK ---
function printType(type) {
    const printArea = document.getElementById('print-area');
    const receipt = document.getElementById('receipt-preview');

    let content = '';

    if (type === 'receipt') {
        content = receipt.outerHTML;
    } else if (type === 'pdf') {
        // Arsip + Nota (struk + semua gambar nota)
        const allImages = expenses.flatMap(e => e.images || []);
        const imagesHtml = allImages.length > 0 ? `
            <div class="page-break" style="margin-top:20px;">
                <h3 style="font-family:monospace;font-size:14px;border-bottom:1px dashed #000;padding-bottom:4px;">LAMPIRAN NOTA / BUKTI</h3>
                <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
                    ${allImages.map(src => `<img src="${src}" style="width:200px;height:auto;border:1px solid #ccc;border-radius:8px;">`).join('')}
                </div>
            </div>` : '';
        content = receipt.outerHTML + imagesHtml;
    } else if (type === 'attachment') {
        // Hanya nota
        const allImages = expenses.flatMap(e => e.images || []);
        if (allImages.length === 0) {
            showMsg('Tidak ada nota/gambar yang diunggah.');
            return;
        }
        content = `
            <div style="font-family:monospace;padding:10px;">
                <h3 style="font-size:14px;border-bottom:1px dashed #000;padding-bottom:4px;">NOTA / BUKTI PENGELUARAN</h3>
                <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
                    ${allImages.map(src => `<img src="${src}" style="width:200px;height:auto;border:1px solid #ccc;border-radius:8px;">`).join('')}
                </div>
            </div>`;
    }

    printArea.innerHTML = content;
    window.print();
    setTimeout(() => { printArea.innerHTML = ''; }, 1000);
}

// --- UTILITY ---
function showMsg(msg) {
    const box = document.getElementById('msg-box');
    box.textContent = msg;
    box.classList.remove('hidden');
    setTimeout(() => box.classList.add('hidden'), 3000);
}
