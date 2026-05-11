/**
 * ============================================================
 * script.js — SITTA Universitas Terbuka
 * Berisi semua logika interaksi DOM untuk seluruh halaman.
 * Dipanggil setelah data.js di-load.
 * ============================================================
 */

// ════════════════════════════════════════════════════════════
// UTILITAS UMUM
// ════════════════════════════════════════════════════════════

/**
 * Mendapatkan nama hari dalam Bahasa Indonesia.
 */
function getNamaHari(index) {
  var hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  return hari[index];
}

/**
 * Mendapatkan nama bulan dalam Bahasa Indonesia.
 */
function getNamaBulan(index) {
  var bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  return bulan[index];
}

/**
 * Memformat tanggal dari string "YYYY-MM-DD" → "DD Bulan YYYY".
 */
function formatTanggal(str) {
  var d = new Date(str);
  return d.getDate() + " " + getNamaBulan(d.getMonth()) + " " + d.getFullYear();
}

/**
 * Membuat badge status HTML berdasarkan teks status.
 */
function buatBadgeStatus(status) {
  var cls = "badge-info";
  if (status === "Terkirim")          cls = "badge-success";
  else if (status === "Dalam Perjalanan") cls = "badge-warning";
  else if (status === "Diproses")     cls = "badge-info";
  else if (status === "Dibatalkan")   cls = "badge-danger";
  return '<span class="badge ' + cls + '">' + status + '</span>';
}

// ════════════════════════════════════════════════════════════
// SESI / SESSION (Simulasi via localStorage)
// ════════════════════════════════════════════════════════════

/**
 * Menyimpan data pengguna yang login ke localStorage (simulasi sesi).
 */
function simpanSesi(pengguna) {
  localStorage.setItem("sitta_user", JSON.stringify(pengguna));
}

/**
 * Mengambil data sesi pengguna yang sedang login.
 * Jika tidak ada sesi, kembalikan null.
 */
function getSesi() {
  var raw = localStorage.getItem("sitta_user");
  return raw ? JSON.parse(raw) : null;
}

/**
 * Menghapus sesi (logout).
 */
function hapusSesi() {
  localStorage.removeItem("sitta_user");
  window.location.href = "index.html";
}

/**
 * Mengisi info pengguna di sidebar dari data sesi.
 */
function isiInfoPengguna() {
  var user = getSesi();
  // Jika tidak ada sesi, arahkan ke halaman login
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  var elNama = document.getElementById("sidebar-nama");
  var elRole = document.getElementById("sidebar-role");
  var elAvatar = document.getElementById("sidebar-avatar");
  if (elNama)   elNama.textContent   = user.nama;
  if (elRole)   elRole.textContent   = user.role + " — " + user.lokasi;
  if (elAvatar) elAvatar.textContent = user.nama.charAt(0).toUpperCase();
}

// ════════════════════════════════════════════════════════════
// SIDEBAR: DROPDOWN & ACTIVE LINK
// ════════════════════════════════════════════════════════════

/**
 * Inisialisasi dropdown di sidebar.
 * Klik nav-item bertanda dropdown akan toggle class "open".
 */
function initDropdown() {
  var items = document.querySelectorAll(".nav-item.has-dropdown");
  items.forEach(function(item) {
    var link = item.querySelector(".nav-link");
    link.addEventListener("click", function() {
      var dropdown = item.querySelector(".nav-dropdown");
      // Toggle state open/close
      item.classList.toggle("open");
      if (dropdown) dropdown.classList.toggle("open");
    });
  });
}

/**
 * Tandai nav-link yang sesuai dengan halaman aktif saat ini.
 */
function setActiveNav() {
  var halaman = window.location.pathname.split("/").pop();
  var links = document.querySelectorAll(".nav-link[data-page]");
  links.forEach(function(link) {
    if (link.getAttribute("data-page") === halaman) {
      link.classList.add("active");
      // Buka parent dropdown jika ada
      var parentItem = link.closest(".nav-item.has-dropdown, .nav-dropdown")
                           ? link.closest(".nav-item") : null;
      if (parentItem) {
        parentItem.classList.add("open");
        var dd = parentItem.querySelector(".nav-dropdown");
        if (dd) dd.classList.add("open");
      }
    }
  });
}

// ════════════════════════════════════════════════════════════
// TOPBAR: TANGGAL
// ════════════════════════════════════════════════════════════

/**
 * Menampilkan tanggal hari ini di elemen #topbar-date menggunakan Date().
 */
function tampilkanTanggal() {
  var el = document.getElementById("topbar-date");
  if (!el) return;
  var now = new Date();
  el.textContent = getNamaHari(now.getDay()) + ", " +
                   now.getDate() + " " +
                   getNamaBulan(now.getMonth()) + " " +
                   now.getFullYear();
}

// ════════════════════════════════════════════════════════════
// HALAMAN LOGIN (index.html)
// ════════════════════════════════════════════════════════════

/**
 * Inisialisasi semua logika halaman Login.
 */
function initLogin() {
  var form        = document.getElementById("form-login");
  var inputEmail  = document.getElementById("input-email");
  var inputPw     = document.getElementById("input-password");
  var togglePw    = document.getElementById("toggle-pw");
  var btnLupa     = document.getElementById("btn-lupa-pw");
  var btnDaftar   = document.getElementById("btn-daftar");

  if (!form) return; // Jika bukan halaman login, stop

  // Jika sudah ada sesi aktif, langsung ke dashboard
  if (getSesi()) {
    window.location.href = "dashboard.html";
    return;
  }

  // ── Toggle tampilkan/sembunyikan password ────────────────
  if (togglePw) {
    togglePw.addEventListener("click", function() {
      var type = inputPw.getAttribute("type") === "password" ? "text" : "password";
      inputPw.setAttribute("type", type);
      togglePw.textContent = type === "password" ? "👁" : "🙈";
    });
  }

  // ── Submit form Login ────────────────────────────────────
  form.addEventListener("submit", function(e) {
    e.preventDefault(); // Cegah reload halaman

    var email    = inputEmail.value.trim();
    var password = inputPw.value.trim();

    // Validasi: kolom tidak boleh kosong
    if (!email || !password) {
      alert("email/password yang anda masukkan salah");
      return;
    }

    // Cari pengguna yang cocok di array dataPengguna (dari data.js)
    var cocok = dataPengguna.find(function(p) {
      return p.email === email && p.password === password;
    });

    if (cocok) {
      // Simpan ke sesi dan arahkan ke dashboard
      simpanSesi(cocok);
      window.location.href = "dashboard.html";
    } else {
      // Validasi gagal: tampilkan alert sesuai spesifikasi
      alert("email/password yang anda masukkan salah");
      inputPw.value = "";
      inputPw.focus();
    }
  });

  // ── Modal: Lupa Password ─────────────────────────────────
  if (btnLupa) {
    btnLupa.addEventListener("click", function(e) {
      e.preventDefault();
      bukaModal("modal-lupa-pw");
    });
  }

  // ── Modal: Daftar ────────────────────────────────────────
  if (btnDaftar) {
    btnDaftar.addEventListener("click", function(e) {
      e.preventDefault();
      bukaModal("modal-daftar");
    });
  }
}

// ════════════════════════════════════════════════════════════
// MODAL (Digunakan di halaman Login)
// ════════════════════════════════════════════════════════════

/**
 * Membuka modal berdasarkan ID overlay-nya.
 */
function bukaModal(id) {
  var overlay = document.getElementById(id);
  if (overlay) overlay.classList.add("open");
}

/**
 * Menutup modal berdasarkan ID overlay-nya.
 */
function tutupModal(id) {
  var overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove("open");
}

/**
 * Inisialisasi semua tombol tutup modal di halaman saat ini.
 * Setiap tombol dengan class "modal-close" atau klik overlay akan menutup modal.
 */
function initModal() {
  // Klik tombol ✕ di dalam modal
  document.querySelectorAll(".modal-close").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var overlay = btn.closest(".modal-overlay");
      if (overlay) overlay.classList.remove("open");
    });
  });

  // Klik di luar kotak modal (di area overlay gelap)
  document.querySelectorAll(".modal-overlay").forEach(function(overlay) {
    overlay.addEventListener("click", function(e) {
      // Hanya tutup jika yang diklik adalah overlay, bukan konten di dalamnya
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
}

// ════════════════════════════════════════════════════════════
// HALAMAN DASHBOARD (dashboard.html)
// ════════════════════════════════════════════════════════════

/**
 * Menampilkan greeting dinamis berdasarkan jam lokal menggunakan Date().
 * Pagi: 05-11, Siang: 12-14, Sore: 15-18, Malam: lainnya.
 */
function tampilkanGreeting() {
  var elGreeting = document.getElementById("greeting-text");
  var elIcon     = document.getElementById("greeting-icon");
  if (!elGreeting) return;

  var jam    = new Date().getHours();
  var user   = getSesi();
  var nama   = user ? user.nama.split(" ")[0] : "Pengguna";
  var salam  = "";
  var icon   = "";

  if (jam >= 5 && jam < 12) {
    salam = "Selamat Pagi"; icon = "🌤";
  } else if (jam >= 12 && jam < 15) {
    salam = "Selamat Siang"; icon = "☀️";
  } else if (jam >= 15 && jam < 19) {
    salam = "Selamat Sore"; icon = "🌇";
  } else {
    salam = "Selamat Malam"; icon = "🌙";
  }

  elGreeting.innerHTML = salam + ", <em>" + nama + "!</em>";
  if (elIcon) elIcon.textContent = icon;
}

/**
 * Menampilkan tabel histori transaksi dari array dataHistori (data.js).
 * Memanipulasi DOM untuk membuat baris <tr> secara dinamis.
 */
function tampilkanHistori() {
  var tbody = document.getElementById("histori-tbody");
  if (!tbody || typeof dataHistori === "undefined") return;

  tbody.innerHTML = ""; // Kosongkan dulu

  dataHistori.forEach(function(item) {
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><strong>" + item.noDO + "</strong></td>" +
      "<td>" + formatTanggal(item.tanggal) + "</td>" +
      "<td>" + item.penerima + "</td>" +
      "<td>" + item.barang + "</td>" +
      "<td style='text-align:center'><strong>" + item.jumlah + "</strong></td>" +
      "<td>" + item.ekspedisi + "</td>" +
      "<td>" + buatBadgeStatus(item.status) + "</td>";
    tbody.appendChild(tr);
  });
}

// ════════════════════════════════════════════════════════════
// HALAMAN TRACKING (tracking.html)
// ════════════════════════════════════════════════════════════

/**
 * Inisialisasi logika pencarian tracking pengiriman.
 * Membaca input nomor DO, mencari di dataTracking (data.js),
 * lalu merender hasilnya secara dinamis ke DOM.
 */
function initTracking() {
  var form       = document.getElementById("form-tracking");
  var inputDO    = document.getElementById("input-nodo");
  var hasilDiv   = document.getElementById("hasil-tracking");

  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    var noDO = inputDO.value.trim();

    if (!noDO) {
      alert("Nomor DO tidak boleh kosong!");
      return;
    }

    // Cari data di objek dataTracking menggunakan nomor DO sebagai key
    var data = (typeof dataTracking !== "undefined") ? dataTracking[noDO] : null;

    if (!data) {
      // Nomor DO tidak ditemukan
      hasilDiv.innerHTML =
        '<div class="not-found">' +
        '<div class="not-found-icon">🔍</div>' +
        "<h4>Data Tidak Ditemukan</h4>" +
        "<p>Nomor DO <strong>" + noDO + "</strong> tidak terdaftar di sistem.<br>" +
        "Coba gunakan: <strong>2023001234</strong> atau <strong>2023005678</strong></p>" +
        "</div>";
      hasilDiv.className = "card tracking-result visible";
      return;
    }

    // Tentukan step yang aktif berdasarkan status
    var steps = ["Diproses", "Dikemas", "Dikirim", "Dalam Perjalanan", "Terkirim"];
    var statusIndex = {
      "Diproses": 0,
      "Dikemas": 1,
      "Dikirim": 2,
      "Dalam Perjalanan": 3,
      "Terkirim": 4
    };
    var activeStep = statusIndex[data.status] !== undefined ? statusIndex[data.status] : 2;

    // Buat HTML untuk progress steps
    var stepsIcons = ["📋","📦","🏭","🚚","✅"];
    var stepsHTML  = '<div class="progress-steps">';
    steps.forEach(function(step, i) {
      var cls  = i < activeStep ? "done" : (i === activeStep ? "active" : "");
      var icon = i < activeStep ? "✓" : stepsIcons[i];
      stepsHTML +=
        '<div class="step ' + cls + '">' +
        '<div class="step-dot">' + icon + "</div>" +
        '<div class="step-label">' + step + "</div>" +
        "</div>";
    });
    stepsHTML += "</div>";

    // Buat HTML untuk timeline perjalanan
    var timelineHTML = '<div class="timeline">';
    // Balik urutan agar terbaru tampil di atas
    var perjalananReverse = data.perjalanan.slice().reverse();
    perjalananReverse.forEach(function(item, idx) {
      timelineHTML +=
        '<div class="timeline-item" style="animation-delay:' + (idx * 0.1) + 's">' +
        '<div class="timeline-dot"></div>' +
        '<div class="timeline-time">🕐 ' + item.waktu + "</div>" +
        '<div class="timeline-desc">' + item.keterangan + "</div>" +
        "</div>";
    });
    timelineHTML += "</div>";

    // Render semua hasil ke DOM
    hasilDiv.innerHTML =
      '<div class="card-header">' +
      '<h3>📦 Hasil Tracking DO #' + data.nomorDO + "</h3>" +
      buatBadgeStatus(data.status) +
      "</div>" +
      '<div class="card-body">' +
      // Grid info utama
      '<div class="tracking-info-grid mb-3">' +
      '<div class="info-item"><div class="info-label">Nama Penerima</div><div class="info-value">👤 ' + data.nama + "</div></div>" +
      '<div class="info-item"><div class="info-label">Ekspedisi</div><div class="info-value">🚚 ' + data.ekspedisi + "</div></div>" +
      '<div class="info-item"><div class="info-label">Tanggal Kirim</div><div class="info-value">📅 ' + formatTanggal(data.tanggalKirim) + "</div></div>" +
      '<div class="info-item"><div class="info-label">Kode Paket</div><div class="info-value">📋 ' + data.paket + "</div></div>" +
      '<div class="info-item"><div class="info-label">Total Pembayaran</div><div class="info-value" style="color:var(--gold);font-size:1.1rem">' + data.total + "</div></div>" +
      '<div class="info-item"><div class="info-label">Status</div><div class="info-value">' + buatBadgeStatus(data.status) + "</div></div>" +
      "</div>" +
      // Progress bar langkah
      "<h4 style='font-family:var(--font-display);color:var(--navy);margin-bottom:16px'>Status Pengiriman</h4>" +
      stepsHTML +
      // Timeline perjalanan
      "<h4 style='font-family:var(--font-display);color:var(--navy);margin-bottom:16px'>Riwayat Perjalanan</h4>" +
      timelineHTML +
      "</div>";

    hasilDiv.className = "card tracking-result visible";

    // Scroll ke hasil dengan smooth
    hasilDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ════════════════════════════════════════════════════════════
// HALAMAN STOK BAHAN AJAR (stok.html)
// ════════════════════════════════════════════════════════════

/**
 * Menampilkan data dari dataBahanAjar (data.js) ke dalam tabel dan card secara dinamis.
 * Menggunakan DOM manipulation untuk membuat elemen.
 */
function tampilkanStok() {
  var tbody = document.getElementById("stok-tbody");
  var grid  = document.getElementById("stok-grid");

  // ── Render Tabel ─────────────────────────────────────────
  if (tbody && typeof dataBahanAjar !== "undefined") {
    renderTabelStok(dataBahanAjar);
  }

  // ── Render Card Grid ──────────────────────────────────────
  if (grid && typeof dataBahanAjar !== "undefined") {
    renderCardStok(dataBahanAjar);
  }
}

/**
 * Render array data ke tabel #stok-tbody.
 * Dipanggil saat pertama load dan saat data baru ditambahkan.
 */
function renderTabelStok(data) {
  var tbody = document.getElementById("stok-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach(function(item, idx) {
    // Tentukan warna bar stok (hijau jika banyak, kuning jika sedang, merah jika sedikit)
    var stokPct = Math.min((item.stok / 600) * 100, 100);
    var barColor = stokPct > 50 ? "var(--success)" : stokPct > 20 ? "var(--warning)" : "var(--danger)";

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><code style='background:var(--gold-pale);padding:2px 6px;border-radius:4px;font-size:.8rem;color:var(--navy)'>" + item.kodeBarang + "</code></td>" +
      "<td>" + item.namaBarang + "</td>" +
      "<td style='text-align:center'><span class='badge badge-info'>" + item.jenisBarang + "</span></td>" +
      "<td style='text-align:center'>Ed. " + item.edisi + "</td>" +
      "<td>" + item.kodeLokasi + "</td>" +
      "<td>" +
        "<div style='display:flex;align-items:center;gap:10px'>" +
        "<strong style='min-width:34px'>" + item.stok + "</strong>" +
        "<div style='flex:1;height:6px;background:var(--gray-200);border-radius:3px;overflow:hidden'>" +
        "<div style='height:100%;width:" + stokPct + "%;background:" + barColor + ";border-radius:3px'></div>" +
        "</div>" +
        "</div>" +
      "</td>" +
      "<td class='tbl-actions'>" +
        "<button class='btn btn-sm btn-outline' onclick='alert(\"Fitur edit akan segera hadir!\")'>✏️ Edit</button>" +
        "<button class='btn btn-sm btn-primary' onclick='alert(\"Pesanan dibuat untuk: " + item.namaBarang + "\")'>📦 Pesan</button>" +
      "</td>";
    tbody.appendChild(tr);
  });
}

/**
 * Render array data ke card grid #stok-grid.
 */
function renderCardStok(data) {
  var grid = document.getElementById("stok-grid");
  if (!grid) return;

  grid.innerHTML = "";

  data.forEach(function(item) {
    var stokPct = Math.min((item.stok / 600) * 100, 100);
    var div = document.createElement("div");
    div.className = "stok-card";
    div.style.animation = "fadeInUp .4s ease both";

    // Buat img cover; fallback ke placeholder jika gagal load
    var coverHTML =
      '<img class="stok-cover" src="' + item.cover + '" alt="' + item.namaBarang + '" ' +
      'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">' +
      '<div class="stok-cover-placeholder" style="display:none">📚</div>';

    div.innerHTML =
      coverHTML +
      '<div class="stok-info">' +
      '<div class="stok-code">' + item.kodeBarang + "</div>" +
      '<div class="stok-name">' + item.namaBarang + "</div>" +
      '<div class="stok-meta">' +
        "<span>Ed. " + item.edisi + "</span>" +
        "<span>" + item.kodeLokasi + "</span>" +
      "</div>" +
      '<div class="stok-count">' +
        '<span class="count-num">' + item.stok + "</span>" +
        '<span class="count-label">eksemplar</span>' +
      "</div>" +
      '<div class="stok-bar"><div class="stok-bar-fill" style="width:' + stokPct + '%"></div></div>' +
      "</div>";
    grid.appendChild(div);
  });
}

/**
 * Inisialisasi form "Tambah Stok".
 * Saat form di-submit, data baru dari input ditambahkan ke array dataBahanAjar
 * dan tabel/card di-render ulang secara dinamis.
 */
function initTambahStok() {
  var form = document.getElementById("form-tambah-stok");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    // Ambil nilai dari setiap input form
    var kodeBarang  = document.getElementById("ts-kode").value.trim();
    var namaBarang  = document.getElementById("ts-nama").value.trim();
    var jenisBarang = document.getElementById("ts-jenis").value.trim();
    var edisi       = document.getElementById("ts-edisi").value.trim();
    var kodeLokasi  = document.getElementById("ts-lokasi").value.trim();
    var stok        = parseInt(document.getElementById("ts-stok").value, 10);

    // Validasi sederhana: semua kolom wajib terisi
    if (!kodeBarang || !namaBarang || !jenisBarang || !edisi || !kodeLokasi || isNaN(stok)) {
      alert("Semua kolom wajib diisi dengan benar!");
      return;
    }

    // Buat objek data baru sesuai struktur dataBahanAjar
    var dataBaru = {
      kodeLokasi: kodeLokasi,
      kodeBarang: kodeBarang,
      namaBarang: namaBarang,
      jenisBarang: jenisBarang,
      edisi: edisi,
      stok: stok,
      cover: "" // Tidak ada cover untuk data baru
    };

    // Tambahkan ke array dataBahanAjar (data dummy yang sudah ada)
    dataBahanAjar.push(dataBaru);

    // Re-render tabel dan card dengan data terbaru
    renderTabelStok(dataBahanAjar);
    renderCardStok(dataBahanAjar);

    // Reset form setelah berhasil
    form.reset();

    // Umpan balik ke pengguna
    alert("✅ Data stok \"" + namaBarang + "\" berhasil ditambahkan!");

    // Scroll ke tabel
    var tabel = document.getElementById("stok-tbody");
    if (tabel) tabel.closest(".card").scrollIntoView({ behavior: "smooth" });
  });
}

/**
 * Toggle tampilan panel tambah stok.
 */
function toggleTambahStok() {
  var panel = document.getElementById("tambah-stok-panel");
  if (!panel) return;
  var isVisible = panel.style.display !== "none";
  panel.style.display = isVisible ? "none" : "block";
}

// ════════════════════════════════════════════════════════════
// INISIALISASI GLOBAL — Dijalankan saat DOM siap
// ════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", function() {
  // Elemen umum di semua halaman (kecuali login)
  isiInfoPengguna();
  initDropdown();
  setActiveNav();
  tampilkanTanggal();
  initModal();

  // Inisialisasi spesifik per halaman
  initLogin();          // index.html
  tampilkanGreeting();  // dashboard.html
  tampilkanHistori();   // dashboard.html
  initTracking();       // tracking.html
  tampilkanStok();      // stok.html
  initTambahStok();     // stok.html
});
