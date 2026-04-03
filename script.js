// -- STATE --
let expenses = [];
let categories = ['Operasional', 'Bahan Baku', 'Gaji', 'Listrik/Air', 'Lain-lain'];

// -- INITIALIZATION --
window.onload = () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('input-date').value = today;
    renderCategories();
    addExpenseRow();

    // Auto Listeners
    ['input-date', 'input-shift', 'input-modal', 'input-dinein', 'input-cash', 'input-qris', 'input-reporter', 'input-branch'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateUI);
    });
};

// -- CATEGORY LOGIC --
function renderCategories() {
    const chipContainer = document.getElementById('category-chips');
    chipContainer.innerHTML = '';
    categories.forEach((cat, index) => {
        const chip = document.createElement('div');
        chip.className = "flex items-center bg-gray-100 px-3 py-1 rounded-full text-xs border border-gray-300";
        chip.innerHTML = `
            <span>${cat}</span>
            <button onclick="removeCategory(${index})" class="ml-2 text-red-500 hover:text-red-700 font-bold">×</button>
        `;
        chipContainer.appendChild(chip);
    });
    renderExpenseInputs();
}

function addCategory() {
    const input = document.getElementById('new-cat-input');
    const val = input.value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        input.value = '';
        renderCategories();
    }
}

function removeCategory(index) {
    if (categories.length > 1) {
        categories.splice(index, 1);
        renderCategories();
    }
}

// -- EXPENSE LOGIC --
function addExpenseRow() {
    expenses.push({ id: Date.now(), description: '', category: categories[0], price: 0, qty: 1, image: null });
    renderExpenseInputs();
    updateUI();
}

function removeExpenseRow(id) {
    expenses = expenses.filter(e => e.id !== id);
    renderExpenseInputs();
    updateUI();
}

function updateExpense(id, field, value) {
    const idx = expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
        expenses[idx][field] = (field === 'price' || field === 'qty') ? parseFloat(value) || 0 : value;
        calculateTotals();
    }
}

function handleImage(id, event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const idx = expenses.findIndex(ex => ex.id === id);
        if (idx !== -1) {
            expenses[idx].image = e.target.result;
            renderExpenseInputs();
        }
    };
    reader.readAsDataURL(file);
}

function renderExpenseInputs() {
    const container = document.getElementById('expense-container');
    container.innerHTML = '';
    expenses.forEach(exp => {
        const row = document.createElement('div');
        row.className = "p-4 bg-gray-50 rounded-xl border border-gray-200 relative shadow-sm";
        row.innerHTML = `
            <div class="grid grid-cols-12 gap-3 items-end">
                <div class="col-span-12 md:col-span-4">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Deskripsi</label>
                    <input type="text" placeholder="Contoh: Beli Sabun" value="${exp.description}" oninput="updateExpense(${exp.id}, 'description', this.value)" class="w-full text-xs rounded border-gray-300 p-2 border focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="col-span-6 md:col-span-3">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori</label>
                    <select onchange="updateExpense(${exp.id}, 'category', this.value)" class="w-full text-xs rounded border-gray-300 p-2 border focus:ring-blue-500 focus:border-blue-500">
                        ${categories.map(c => `<option value="${c}" ${exp.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="col-span-6 md:col-span-2">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Harga Satuan</label>
                    <input type="number" placeholder="0" value="${exp.price}" oninput="updateExpense(${exp.id}, 'price', this.value)" class="w-full text-xs rounded border-gray-300 p-2 border focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="col-span-4 md:col-span-1">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Qty</label>
                    <input type="number" value="${exp.qty}" oninput="updateExpense(${exp.id}, 'qty', this.value)" class="w-full text-xs rounded border-gray-300 p-2 border text-center focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="col-span-6 md:col-span-1 flex flex-col justify-end">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nota</label>
                    <div class="flex items-center gap-2">
                        <label class="cursor-pointer bg-white border border-gray-300 rounded p-2 flex items-center justify-center hover:bg-gray-100 transition shadow-sm w-full h-[34px]">
                            <i class="fas fa-camera text-blue-600 text-sm"></i>
                            <input type="file" accept="image/*" class="hidden" onchange="handleImage(${exp.id}, event)">
                        </label>
                        ${exp.image ? `<img src="${exp.image}" class="image-preview-thumb shadow-sm">` : ''}
                    </div>
                </div>
                <div class="col-span-2 md:col-span-1 flex items-center justify-center">
                    <button onclick="removeExpenseRow(${exp.id})" class="text-red-500 hover:text-red-700 transition p-2" title="Hapus Baris">
                        <i class="fas fa-trash-alt text-lg"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

// -- CALCULATION & UI --
function formatIDR(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

function calculateTotals() {
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const dineIn = parseFloat(document.getElementById('input-dinein').value) || 0;
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;

    const totalIncome = (cash + qris) - modal;
    const totalExpense = expenses.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);
    const grossProfit = dineIn - totalExpense;
    const gap = totalIncome - grossProfit;

    // Update Preview
    document.getElementById('res-branch').innerText = document.getElementById('input-branch').value;
    document.getElementById('res-date').innerText = 'Tgl: ' + (document.getElementById('input-date').value || '-');
    document.getElementById('res-shift').innerText = 'Shift: ' + document.getElementById('input-shift').value;
    document.getElementById('res-reporter').innerText = 'Kasir: ' + (document.getElementById('input-reporter').value || '-');
    document.getElementById('res-modal').innerText = formatIDR(modal);
    document.getElementById('res-dinein').innerText = formatIDR(dineIn);
    document.getElementById('res-cash').innerText = formatIDR(cash);
    document.getElementById('res-qris').innerText = formatIDR(qris);
    document.getElementById('res-total-income').innerText = formatIDR(totalIncome);
    document.getElementById('res-total-expense').innerText = formatIDR(totalExpense);
    document.getElementById('res-gross-profit').innerText = formatIDR(grossProfit);
    
    const gapEl = document.getElementById('res-gap');
    gapEl.innerText = formatIDR(gap);
    gapEl.className = gap < 0 ? "text-red-600 font-bold" : (gap > 0 ? "text-green-600 font-bold" : "text-black font-bold");

    const resList = document.getElementById('res-expense-list');
    if (expenses.length > 0) {
        resList.innerHTML = expenses.map(e => `
            <div class="flex justify-between items-start">
                <span class="flex-1 pr-2">${e.qty}x ${e.description || '...'}</span>
                <span>${formatIDR(e.price * e.qty)}</span>
            </div>
        `).join('');
    } else {
        resList.innerHTML = '<div class="text-center italic opacity-40 py-2">Tidak ada data</div>';
    }
}

function updateUI() { calculateTotals(); }

// -- PRINTING SYSTEM --
function printType(type) {
    const area = document.getElementById('print-area');
    const data = getReportData();
    area.innerHTML = '';
    document.body.className = ''; 

    if (type === 'receipt') {
        const clone = document.getElementById('receipt-preview').cloneNode(true);
        clone.classList.remove('shadow-lg');
        area.appendChild(clone);
    } 
    else if (type === 'pdf') {
        area.innerHTML = generateA4Report(data);
    }
    else if (type === 'attachment') {
        area.innerHTML = generateNotaAttachment(data);
    }

    setTimeout(() => { window.print(); }, 300);
}

function getReportData() {
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;
    const dinein = parseFloat(document.getElementById('input-dinein').value) || 0;
    const totalExpense = expenses.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);

    return {
        branch: document.getElementById('input-branch').value,
        reporter: document.getElementById('input-reporter').value || '-',
        date: document.getElementById('input-date').value || '-',
        shift: document.getElementById('input-shift').value,
        modal, dinein, cash, qris,
        totalIncome: (cash + qris) - modal,
        totalExpense,
        grossProfit: dinein - totalExpense,
        expenses: [...expenses]
    };
}

function generateA4Report(d) {
    const gap = d.totalIncome - d.grossProfit;
    return `
        <div class="p-12 bg-white min-h-screen font-sans">
            <div class="flex justify-between items-start border-b-4 border-gray-900 pb-6 mb-8">
                <div>
                    <h1 class="text-4xl font-black uppercase tracking-tighter">Dua Legenda Grup</h1>
                    <p class="text-lg font-bold text-gray-500">${d.branch.toUpperCase()}</p>
                </div>
                <div class="text-right">
                    <h2 class="text-xl font-bold uppercase">Laporan Closing Harian</h2>
                    <p class="text-gray-600">${d.date} | ${d.shift}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-12 mb-10">
                <div class="space-y-3">
                    <h3 class="text-lg font-bold border-b border-gray-300 pb-1">IKHTISAR KAS</h3>
                    <div class="flex justify-between"><span>Kasir / Pelapor:</span><span class="font-bold">${d.reporter}</span></div>
                    <div class="flex justify-between"><span>Modal Awal:</span><span class="font-bold">${formatIDR(d.modal)}</span></div>
                    <div class="flex justify-between"><span>Uang Cash Fisik:</span><span class="font-bold">${formatIDR(d.cash)}</span></div>
                    <div class="flex justify-between"><span>Uang QRIS/Transfer:</span><span class="font-bold">${formatIDR(d.qris)}</span></div>
                    <div class="flex justify-between border-t-2 border-black pt-2 font-black text-xl uppercase">
                        <span>Total Didapat:</span><span>${formatIDR(d.totalIncome)}</span>
                    </div>
                </div>
                <div class="space-y-3">
                    <h3 class="text-lg font-bold border-b border-gray-300 pb-1">HASIL AKHIR</h3>
                    <div class="flex justify-between"><span>Total Dine In (Omzet):</span><span class="font-bold">${formatIDR(d.dinein)}</span></div>
                    <div class="flex justify-between"><span>Total Pengeluaran:</span><span class="font-bold text-red-600">${formatIDR(d.totalExpense)}</span></div>
                    <div class="flex justify-between text-xl font-bold mt-4"><span>LABA KOTOR:</span><span>${formatIDR(d.grossProfit)}</span></div>
                    <div class="p-4 bg-gray-100 rounded-lg flex justify-between text-2xl font-black mt-2">
                        <span>SELISIH:</span><span>${formatIDR(gap)}</span>
                    </div>
                </div>
            </div>
            <h3 class="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase">Rincian Pengeluaran</h3>
            <table class="w-full border-collapse mb-10">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 p-2 text-left">Deskripsi</th>
                        <th class="border border-gray-300 p-2 text-left">Kategori</th>
                        <th class="border border-gray-300 p-2 text-center">Qty</th>
                        <th class="border border-gray-300 p-2 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${d.expenses.map(e => `
                        <tr>
                            <td class="border border-gray-300 p-2">${e.description || '-'}</td>
                            <td class="border border-gray-300 p-2">${e.category}</td>
                            <td class="border border-gray-300 p-2 text-center">${e.qty}</td>
                            <td class="border border-gray-300 p-2 text-right font-bold">${formatIDR(e.price * e.qty)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="mt-20 flex justify-end gap-20 text-center">
                <div><p class="mb-20">Pembuat Laporan,</p><p class="font-bold border-t border-black pt-2 w-48">${d.reporter}</p></div>
                <div><p class="mb-20">Pemilik / Manager,</p><p class="font-bold border-t border-black pt-2 w-48">(.......................)</p></div>
            </div>
        </div>
    `;
}

function generateNotaAttachment(d) {
    const filtered = d.expenses.filter(e => e.image);
    return `
        <div class="p-12 bg-white min-h-screen">
            <h1 class="text-2xl font-black text-center border-b-2 border-black pb-4 uppercase">Lampiran Foto Nota Pengeluaran</h1>
            <div class="flex justify-between my-4 text-sm font-bold uppercase">
                <span>${d.branch}</span>
                <span>${d.date} | Shift: ${d.shift}</span>
            </div>
            <div class="grid grid-cols-2 gap-8 mt-10">
                ${filtered.length > 0 ? filtered.map(e => `
                    <div class="border border-gray-300 p-4 rounded-lg break-inside-avoid bg-gray-50 flex flex-col items-center">
                        <img src="${e.image}" class="max-w-full max-h-[400px] object-contain shadow-md mb-4">
                        <div class="w-full text-center border-t border-gray-200 pt-2">
                            <p class="font-bold uppercase">${e.description || 'Tanpa Deskripsi'}</p>
                            <p class="text-xs text-gray-500">${e.category} - ${formatIDR(e.price * e.qty)}</p>
                        </div>
                    </div>
                `).join('') : '<p class="col-span-2 text-center py-20 text-gray-400 italic">Tidak ada foto nota yang diunggah.</p>'}
            </div>
        </div>
    `;
}

function exportToExcel() {
    const data = getReportData();
    const sheetData = [
        ["LAPORAN CLOSING " + data.branch.toUpperCase()],
        ["Kasir", data.reporter],
        ["Tanggal", data.date],
        ["Shift", data.shift],
        [""],
        ["RINGKASAN KEUANGAN"],
        ["Omzet (Dine In)", data.dinein],
        ["Cash Fisik", data.cash],
        ["QRIS/Transfer", data.qris],
        ["Modal Awal", data.modal],
        ["Total Didapat", data.totalIncome],
        ["Total Pengeluaran", data.totalExpense],
        ["Laba Kotor", data.grossProfit],
        ["Selisih", data.totalIncome - data.grossProfit],
        [""],
        ["RINCIAN PENGELUARAN"],
        ["Deskripsi", "Kategori", "Harga", "Qty", "Total"]
    ];

    data.expenses.forEach(e => {
        sheetData.push([e.description, e.category, e.price, e.qty, e.price * e.qty]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Closing");
    XLSX.writeFile(wb, `Closing_${data.branch.replace(/\s/g,'_')}_${data.date}.xlsx`);
}
