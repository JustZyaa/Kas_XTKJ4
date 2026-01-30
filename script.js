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
  data.transaksi.push({
    id: Date.now(),
    tanggal: new Date().toISOString().slice(0,10),
    jenis,
    ket,
    jumlah
  });

  saveData(data);

  // RESET INPUT (INI PENTING BUAT UX)
  ketInput.value = "";
  jumlahInput.value = "";

  render(); // pastikan render ke-trigger
}

function saldo(data) {
  return data.transaksi.reduce((s, t) =>
    t.jenis === "masuk" ? s + t.jumlah : s - t.jumlah, 0
  );
}

function render() {
  const data = getData();
  const list = document.getElementById("list");
  const saldoEl = document.getElementById("saldo");

  let saldo = 0;

  if (list) list.innerHTML = "";

  data.transaksi.forEach(t => {
    saldo += t.jenis === "masuk" ? t.jumlah : -t.jumlah;

    if (list) {
      const div = document.createElement("div");
      div.className = "trx fade-up";
      div.innerHTML = `
        <span>${t.ket}</span>
        <strong>${t.jenis === "masuk" ? "+" : "-"} Rp ${t.jumlah.toLocaleString("id-ID")}</strong>
      `;
      list.appendChild(div);
    }
  });

  if (saldoEl) {
    saldoEl.innerText = "Saldo: Rp " + saldo.toLocaleString("id-ID");
  }

  // 🔥 PANGGIL LAPORAN DI SINI
  updateLaporan(data);
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