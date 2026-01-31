const KEY = "kas-pro-data";

/* =======================
   STORAGE HELPERS
======================= */
function getData() {
  const raw = JSON.parse(localStorage.getItem(KEY));

  // kalau kosong / format lama
  if (!raw || !Array.isArray(raw.transaksi)) {
    return { transaksi: [] };
  }

  return raw;
}

function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function tambah(jenis) {
  const ketInput = document.getElementById("ket");
  const jumlahInput = document.getElementById("jumlah");

  const ket = ketInput.value.trim();
  const jumlah = Number(jumlahInput.value);

  if (!ket || jumlah <= 0) {
    alert("Isi keterangan dan jumlah dengan benar");
    return;
  }

  const data = getData();

  if (editId) {
    // MODE EDIT
    const trx = data.transaksi.find(t => t.id === editId);
    trx.ket = ket;
    trx.jumlah = jumlah;
    trx.jenis = jenis;

    editId = null;
  } else {
    // MODE TAMBAH
    data.transaksi.push({
      id: Date.now(),
      tanggal: new Date().toISOString().slice(0,10),
      jenis,
      ket,
      jumlah
    });
  }

  saveData(data);

  ketInput.value = "";
  jumlahInput.value = "";

  render();
}

function saldo(data) {
  return data.transaksi.reduce((s, t) =>
    t.jenis === "masuk" ? s + t.jumlah : s - t.jumlah, 0
  );
}

function render() {
  const data = getData();

  const listMasuk = document.getElementById("listMasuk");
  const listKeluar = document.getElementById("listKeluar");
  const saldoEl = document.getElementById("saldo");

  listMasuk.innerHTML = "";
  listKeluar.innerHTML = "";

  let saldo = 0;

  data.transaksi.forEach((t, i) => {
    saldo += t.jenis === "masuk" ? t.jumlah : -t.jumlah;

    const div = document.createElement("div");
      div.className = "trx fade-stagger";
      div.dataset.id = t.id;
      div.style.animationDelay = `${i * 0.06}s`;


    div.innerHTML = `
      <div>
        <span>${t.ket}</span>
        <small style="color:var(--muted);display:block">${t.tanggal}</small>
      </div>

      <div style="text-align:right">
        <strong style="color:${t.jenis === "masuk" ? "#22c55e" : "#ef4444"}">
          ${t.jenis === "masuk" ? "+" : "-"} Rp ${t.jumlah.toLocaleString("id-ID")}
        </strong>
        <button class="edit-btn" onclick="editTransaksi(${t.id})">EDIT</button>
      </div>
    `;

    if (t.jenis === "masuk") {
      listMasuk.appendChild(div);
    } else {
      listKeluar.appendChild(div);
    }
  });

  saldoEl.innerText = "Saldo: Rp " + saldo.toLocaleString("id-ID");

  updateLaporan(data);
}

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".edit-btn");
  if (!btn) return;

  const trxEl = btn.closest(".trx");
  if (!trxEl) return;

  const id = Number(trxEl.dataset.id);

  console.log("EDIT CLICKED:", id); // 🔥 sekarang angka, bukan NaN
  editTransaksi(id);
});


let editId = null;

/* =======================
   EDIT TRANSAKSI
======================= */
function editTransaksi(id) {
  const data = getData();
  const trx = data.transaksi.find(t => t.id === id);
  if (!trx) return;

  editId = id;

  document.getElementById("editKet").value = trx.ket;
  document.getElementById("editJumlah").value = trx.jumlah;

  document.getElementById("editModal").classList.remove("hidden");
}

/* =======================
   SIMPAN EDIT
======================= */
function simpanEdit() {
  const ket = document.getElementById("editKet").value.trim();
  const jumlah = Number(document.getElementById("editJumlah").value);

  if (!ket || jumlah <= 0) {
    alert("Data tidak valid");
    return;
  }

  const data = getData();
  const trx = data.transaksi.find(t => t.id === editId);
  if (!trx) return;

  trx.ket = ket;
  trx.jumlah = jumlah;

  saveData(data);
  editId = null;

  tutupModal();
  render();
}

/* =======================
   TUTUP MODAL
======================= */
function tutupModal() {
  document.getElementById("editModal").classList.add("hidden");
}

function updateLaporan(data) {
  const totalMasukEl = document.getElementById("totalMasuk");
  const totalKeluarEl = document.getElementById("totalKeluar");

  if (!totalMasukEl || !totalKeluarEl) return;

  let masuk = 0;
  let keluar = 0;

  data.transaksi.forEach(t => {
    if (t.jenis === "masuk") masuk += t.jumlah;
    else keluar += t.jumlah;
  });

  totalMasukEl.innerText = "Rp " + masuk.toLocaleString("id-ID");
  totalKeluarEl.innerText = "Rp " + keluar.toLocaleString("id-ID");
}

/* BACKUP */
function exportJSON() {
  const blob = new Blob(
    [localStorage.getItem(KEY)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "kas-backup.json";
  a.click();
}

function importJSON(file) {
  const r = new FileReader();
  r.onload = e => {
    localStorage.setItem(KEY, e.target.result);
    alert("Data di-restore");
  };
  r.readAsText(file);
}

document.addEventListener("DOMContentLoaded", render);

const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  console.log("scrolling", currentScrollY);
  
  // NAVBAR HIDE SAAT SCROLL KE BAWAH
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    navbar.classList.add('nav-hide');
  } 
  // NAVBAR MUNCUL SAAT SCROLL KE ATAS
  else {
    navbar.classList.remove('nav-hide');
  }

  lastScrollY = currentScrollY;
});

function showKasTab(type, btn) {
  const masuk = document.getElementById("listMasuk");
  const keluar = document.getElementById("listKeluar");

  masuk.style.display = "none";
  keluar.style.display = "none";

  document.querySelectorAll(".tab-btn")
    .forEach(b => b.classList.remove("active"));

  if (type === "masuk") {
    masuk.style.display = "block";
  } else {
    keluar.style.display = "block";
  }

  btn.classList.add("active");
}
