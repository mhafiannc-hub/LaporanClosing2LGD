let expenses = [];
const categories = ['Operasional', 'Bahan Baku', 'Gaji', 'Listrik/Air', 'Lain-lain'];

window.onload = () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('input-date').value = today;
    addExpenseRow();

    ['input-date', 'input-shift', 'input-modal', 'input-dinein', 'input-cash', 'input-qris', 'input-reporter', 'input-branch'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateUI);
    });
};

function updateUI() {
    renderExpenseInputs();
    calculateAndRenderReceipt();
}

function addExpenseRow() {
    expenses.push({ id: Date.now(), description: '', category: 'Operasional', price: 0, qty: 1, image: null });
    updateUI();
}

function removeExpenseRow(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    updateUI();
}

function updateExpense(id, field, value) {
    const index = expenses.findIndex(exp => exp.id === id);
    if (index !== -1) {
        expenses[index][field] = field === 'price' || field === 'qty' ? parseFloat(value) || 0 : value;
        calculateAndRenderReceipt();
    }
}

function handleImageUpload(id, event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const index = expenses.findIndex(exp => exp.id === id);
        if (index !== -1) {
            expenses[index].image = e.target.result;
            renderExpenseInputs();
        }
    };
    reader.readAsDataURL(file);
}

function renderExpenseInputs() {
    const container = document.getElementById('expense-container');
    container.innerHTML = '';

    expenses.forEach(exp => {
        const div = document.createElement('div');
        div.className = "p-3 bg-gray-50 rounded-lg border border-gray-200 relative group";
        div.innerHTML = `
            <div class="grid grid-cols-12 gap-2">
                <div class="col-span-7">
                    <input type="text" placeholder="Deskripsi" value="${exp.description}" 
                        oninput="updateExpense(${exp.id}, 'description', this.value)"
                        class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 p-1 border">
                </div>
                <div class="col-span-5">
                    <select onchange="updateExpense(${exp.id}, 'category', this.value)"
                        class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 p-1 border">
                        ${categories.map(cat => `<option value="${cat}" ${exp.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="col-span-4">
                    <input type="number" placeholder="Harga" value="${exp.price}" 
                        oninput="updateExpense(${exp.id}, 'price', this.value)"
                        class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 p-1 border">
                </div>
                <div class="col-span-2">
                    <input type="number" placeholder="Qty" value="${exp.qty}" 
                        oninput="updateExpense(${exp.id}, 'qty', this.value)"
                        class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 p-1 border">
                </div>
                <div class="col-span-4 flex items-center space-x-2">
                    <label class="cursor-pointer bg-white border border-gray-300 rounded p-1 hover:bg-gray-100 transition flex items-center justify-center w-full h-[30px]">
                        <i class="fas fa-camera text-gray-500 text-xs mr-1"></i>
                        <span class="text-[10px] text-gray-600">${exp.image ? 'Ganti Foto' : 'Foto Nota'}</span>
                        <input type="file" accept="image/*" class="hidden" onchange="handleImageUpload(${exp.id}, event)">
                    </label>
                    ${exp.image ? `<img src="${exp.image}" class="image-preview-thumb shadow-sm">` : ''}
                </div>
                <div class="col-span-2 flex justify-end items-center">
                    <button onclick="removeExpenseRow(${exp.id})" class="text-red-500 hover:text-red-700 text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function calculateAndRenderReceipt() {
    const reporterVal = document.getElementById('input-reporter').value;
    const branchVal = document.getElementById('input-branch').value;
    const dateVal = document.getElementById('input-date').value;
    const shiftVal = document.getElementById('input-shift').value;
    const modalVal = parseFloat(document.getElementById('input-modal').value) || 0;
    const dineInVal = parseFloat(document.getElementById('input-dinein').value) || 0;
    const cashVal = parseFloat(document.getElementById('input-cash').value) || 0;
    const qrisVal = parseFloat(document.getElementById('input-qris').value) || 0;

    const totalIncome = (cashVal + qrisVal) - modalVal;
    const totalExpense = expenses.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const grossProfit = dineInVal - totalExpense;
    const gap = totalIncome - grossProfit;

    document.getElementById('res-branch-display').innerText = branchVal;
    document.getElementById('res-reporter-display').innerText = `Pelapor: ${reporterVal || '-'}`;
    document.getElementById('res-date-display').innerText = `Tgl: ${dateVal || '-'}`;
    document.getElementById('res-shift-display').innerText = `Shift: ${shiftVal}`;
    document.getElementById('res-modal').innerText = formatIDR(modalVal);
    document.getElementById('res-dinein').innerText = formatIDR(dineInVal);
    document.getElementById('res-cash').innerText = formatIDR(cashVal);
    document.getElementById('res-qris').innerText = formatIDR(qrisVal);
    document.getElementById('res-total-income').innerText = formatIDR(totalIncome);
    document.getElementById('res-total-expense').innerText = formatIDR(totalExpense);
    document.getElementById('res-gross-profit').innerText = formatIDR(grossProfit);
    
    const gapEl = document.getElementById('res-gap');
    gapEl.innerText = formatIDR(gap);
    gapEl.className = gap < 0 ? "text-red-600 font-bold" : (gap > 0 ? "text-green-600 font-bold" : "text-black font-bold");

    const resExpList = document.getElementById('res-expense-list');
    resExpList.innerHTML = expenses.length > 0 ? expenses.map(exp => `
        <div class="flex justify-between items-start">
            <div class="flex-1 pr-2">${exp.qty}x ${exp.description || '...'}</div>
            <div>${formatIDR(exp.price * exp.qty)}</div>
        </div>`).join('') : '<div class="text-center italic text-gray-400">Belum ada pengeluaran</div>';

    document.getElementById('print-timestamp').innerText = new Date().toLocaleString('id-ID');
}

function printReceipt() {
    document.body.classList.add('print-receipt');
    document.body.classList.remove('print-pdf', 'print-attachment');
    window.print();
}

function printPDFArchive() {
    const reporterVal = document.getElementById('input-reporter').value;
    const branchVal = document.getElementById('input-branch').value;
    const dateVal = document.getElementById('input-date').value;
    const shiftVal = document.getElementById('input-shift').value;
    const modalVal = parseFloat(document.getElementById('input-modal').value) || 0;
    const dineInVal = parseFloat(document.getElementById('input-dinein').value) || 0;
    const cashVal = parseFloat(document.getElementById('input-cash').value) || 0;
    const qrisVal = parseFloat(document.getElementById('input-qris').value) || 0;
    
    const totalIncome = (cashVal + qrisVal) - modalVal;
    const totalExpense = expenses.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const grossProfit = dineInVal - totalExpense;

    document.getElementById('pdf-branch-title').innerText = "CABANG: " + branchVal.toUpperCase();
    document.getElementById('pdf-date-shift').innerText = dateVal + " | " + shiftVal;
    document.getElementById('pdf-reporter').innerText = reporterVal || "-";
    document.getElementById('pdf-reporter-sign').innerText = reporterVal || "Kasir";
    document.getElementById('pdf-modal').innerText = formatIDR(modalVal);
    document.getElementById('pdf-dinein').innerText = formatIDR(dineInVal);
    document.getElementById('pdf-cash').innerText = formatIDR(cashVal);
    document.getElementById('pdf-qris').innerText = formatIDR(qrisVal);
    document.getElementById('pdf-total-income').innerText = formatIDR(totalIncome);
    document.getElementById('pdf-total-expense').innerText = formatIDR(totalExpense);
    document.getElementById('pdf-gross-profit').innerText = formatIDR(grossProfit);
    document.getElementById('pdf-gap').innerText = formatIDR(totalIncome - grossProfit);
    document.getElementById('pdf-timestamp').innerText = new Date().toLocaleString('id-ID');

    const table = document.getElementById('pdf-expense-table');
    table.innerHTML = expenses.map(exp => `
        <tr><td class="border p-2">${exp.description}</td><td class="border p-2">${exp.category}</td><td class="border p-2 text-center">${exp.qty}</td><td class="border p-2 text-right font-bold">${formatIDR(exp.price * exp.qty)}</td></tr>
    `).join('');

    document.body.classList.remove('print-receipt', 'print-attachment');
    document.body.classList.add('print-pdf');
    window.print();
}

function printAttachments() {
    const grid = document.getElementById('attachment-grid');
    document.getElementById('att-branch').innerText = document.getElementById('input-branch').value.toUpperCase();
    document.getElementById('att-date').innerText = document.getElementById('input-date').value;
    document.getElementById('att-reporter').innerText = document.getElementById('input-reporter').value || '-';

    const filtered = expenses.filter(exp => exp.image);
    grid.innerHTML = filtered.length === 0 ? '<p class="col-span-2 text-center py-20 italic">Tidak ada foto nota.</p>' : 
        filtered.map(exp => `
        <div class="border border-gray-300 p-4 rounded-lg flex flex-col items-center bg-gray-50 break-inside-avoid">
            <img src="${exp.image}" class="max-w-full max-h-[300px] object-contain mb-3 shadow">
            <div class="w-full border-t pt-2 text-xs">
                <p class="font-bold uppercase">${exp.description || 'Tanpa Deskripsi'}</p>
                <p class="text-gray-600">Kat: ${exp.category} | Nilai: ${formatIDR(exp.price * exp.qty)}</p>
            </div>
        </div>`).join('');

    document.body.classList.remove('print-receipt', 'print-pdf');
    document.body.classList.add('print-attachment');
    window.print();
}

function exportToExcel() {
    const branchVal = document.getElementById('input-branch').value;
    const summaryData = [
        ["LAPORAN CLOSING " + branchVal.toUpperCase()],
        ["Dua Legenda Grup - Copyright 2026"], [""],
        ["Cabang", branchVal], ["Pelapor", document.getElementById('input-reporter').value || "-"],
        ["Tanggal", document.getElementById('input-date').value], ["Shift", document.getElementById('input-shift').value], [""],
        ["RINCIAN PENGELUARAN"], ["Deskripsi", "Kategori", "Harga Satuan", "Qty", "Subtotal"]
    ];
    expenses.forEach(exp => summaryData.push([exp.description, exp.category, exp.price, exp.qty, exp.price * exp.qty]));

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Closing");
    XLSX.writeFile(wb, `Closing_${branchVal.replace(/\s/g, '_')}_${document.getElementById('input-date').value}.xlsx`);
}