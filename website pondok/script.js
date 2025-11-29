// --- DATABASE SIMULASI (Mock Data) ---
// Kita gunakan localStorage agar data tersimpan saat refresh browser (simulasi backend)

const defaultSantri = {
    nama: "Ahmad Fulan",
    saldo: 1500000 // Saldo awal Rp 1.5 Juta
};

// Data pengajuan dana dari guru
let expenseRequests = JSON.parse(localStorage.getItem('expenseRequests')) || [
    { unit: "Waka Humas", desc: "Cetak Banner Muharram", amount: 150000, status: "Disetujui" }
];

// --- LOGIKA UTAMA ---

document.addEventListener("DOMContentLoaded", function () {

    // 1. Setup Data Awal jika belum ada
    if (!localStorage.getItem('santriSaldo')) {
        localStorage.setItem('santriSaldo', defaultSantri.saldo);
    }
    updateUI();

    // 2. Event Listener Switch Role (Dropdown di Navbar)
    const roleSwitcher = document.getElementById('roleSwitcher');
    if (roleSwitcher) {
        roleSwitcher.addEventListener('change', function () {
            switchView(this.value);
        });
    }
});

// Fungsi Ganti Tampilan (Router Sederhana)
function switchView(role) {
    // Sembunyikan semua view
    document.getElementById('view-login').classList.add('d-none');
    document.getElementById('view-wali').classList.add('d-none');
    document.getElementById('view-mart').classList.add('d-none');
    document.getElementById('view-bendahara').classList.add('d-none');
    document.getElementById('view-guru').classList.add('d-none');

    // Tampilkan yang dipilih
    if (role !== 'login') {
        document.getElementById(`view-${role}`).classList.remove('d-none');
        updateUI(); // Refresh data saat ganti layar
    } else {
        document.getElementById('view-login').classList.remove('d-none');
    }
}

// Fungsi Update Tampilan Data (Reactivity)
function updateUI() {
    // A. Update Saldo di Halaman Wali
    const currentSaldo = parseInt(localStorage.getItem('santriSaldo'));
    const waliSaldoEl = document.getElementById('waliSaldo');
    if (waliSaldoEl) waliSaldoEl.innerText = formatRupiah(currentSaldo);

    // B. Update Tabel Keuangan Bendahara
    const tableBody = document.getElementById('financeTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        let totalExpense = 0;

        expenseRequests.forEach(req => {
            totalExpense += parseInt(req.amount);
            const row = `
                <tr>
                    <td>${req.unit}</td>
                    <td>${req.desc}</td>
                    <td>${formatRupiah(req.amount)}</td>
                    <td><span class="badge bg-${req.status === 'Disetujui' ? 'success' : 'warning'}">${req.status}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // Update Total Pengeluaran
        const totalExpEl = document.getElementById('totalExpenseDisplay');
        if (totalExpEl) totalExpEl.innerText = formatRupiah(totalExpense);
    }
}

// --- LOGIKA HARUM MART (Koperasi) ---
function processMartPayment() {
    const total = document.getElementById('martTotal').value;
    if (!total || total <= 0) {
        alert("Masukkan total belanja!");
        return;
    }

    let currentSaldo = parseInt(localStorage.getItem('santriSaldo'));

    if (currentSaldo >= total) {
        currentSaldo -= total;
        localStorage.setItem('santriSaldo', currentSaldo);
        alert(`Pembayaran Berhasil! Saldo santri berkurang Rp ${total}. Sisa: ${formatRupiah(currentSaldo)}`);
        document.getElementById('martTotal').value = '';
        updateUI(); // Refresh data
    } else {
        alert("Saldo Santri Tidak Mencukupi!");
    }
}

// --- LOGIKA GURU (Pengajuan Dana) ---
function submitExpense() {
    const role = document.getElementById('guruRole').value;
    const desc = document.getElementById('guruDesc').value;
    const amount = document.getElementById('guruAmount').value;

    if (desc && amount) {
        const newRequest = {
            unit: role,
            desc: desc,
            amount: amount,
            status: "Pending" // Default status
        };

        expenseRequests.push(newRequest);
        // Simpan ke LocalStorage agar bendahara bisa lihat
        localStorage.setItem('expenseRequests', JSON.stringify(expenseRequests));

        alert("Pengajuan berhasil dikirim ke Bendahara!");
        document.getElementById('guruForm').reset();
        updateUI();
    } else {
        alert("Mohon lengkapi data!");
    }
}

// Helper Format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
}