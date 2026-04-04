let expenses = [];
let categories = ['Operasional', 'Bahan Baku', 'Gaji', 'Listrik/Air', 'Lain-lain'];
let logs = [];

// --- INITIALIZATION ---
window.onload = () => {
    loadInitialData();
    renderCategories();
    renderExpenseInputs();
    renderLogs();
    calculateTotals();
    setupEventListeners();
};

function setupEventListeners() {
    const inputs = ['input-date', 'input-shift', 'input-modal', 'input-dinein', 'input-cash', 'input-qris', 'input-shopeefood', 'input-gofood', 'input-grabfood', 'input-reporter', 'input-branch'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            saveDraft();
            calculateTotals();
        });
    });
}

// --- DATA PERSISTENCE (Local Storage) ---
function saveDraft() {
    const draft = {
        reporter: document.getElementById('input-reporter').value,
        branch: document.getElementById('input-branch').value,
        date: document.getElementById('input-date').value,
        shift: document.getElementById('input-shift').value,
        // ... simpan field lainnya ...
        categories, expenses
    };
    localStorage.setItem('duaLegendaDraft', JSON.stringify(draft));
}

// --- LOGIC & CALCULATION ---
function calculateTotals() {
    const modal = parseFloat(document.getElementById('input-modal').value) || 0;
    const cash = parseFloat(document.getElementById('input-cash').value) || 0;
    const qris = parseFloat(document.getElementById('input-qris').value) || 0;
    
    const totalIncome = (cash + qris) - modal;
    const totalExpense = expenses.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);
    
    // Update UI Elements
    document.getElementById('res-total-income').innerText = formatIDR(totalIncome);
    document.getElementById('res-total-expense').innerText = formatIDR(totalExpense);
    // ... update preview lainnya ...
}

function formatIDR(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

// --- EXPORT FUNCTIONS ---
function exportToExcel() {
    // Logika SheetJS untuk ekspor ke .xlsx
}

function printType(type) {
    // Logika pemilihan layout cetak (Thermal, PDF, atau Lampiran)
}

// --- UI COMPONENTS ---
function renderExpenseInputs() {
    // Template literal untuk merender baris pengeluaran
}
