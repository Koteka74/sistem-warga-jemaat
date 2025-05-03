const url = 'https://script.google.com/macros/s/AKfycbyuSCpnuB7AfNcxTCE2VW7ANRr6juySf0fPnuKB1b1HZxtfiqdisRdIrbn-fl0MbFcULA/exec?action=getData';
const scriptURL = "https://script.google.com/macros/s/AKfycbyuSCpnuB7AfNcxTCE2VW7ANRr6juySf0fPnuKB1b1HZxtfiqdisRdIrbn-fl0MbFcULA/exec";

const loginData = JSON.parse(localStorage.getItem("loginData")) || {};
const userRole = loginData.role;
const userRayon = loginData.rayon;
const userNama = loginData.nama;


let fullData = [];
let filteredData = []; // 🆕 Untuk menyimpan data yang sedang difilter
let currentRayon = "Semua";
let currentPage = 1;
let rowsPerPage = 10;
// Auto Logout jika tidak aktif selama 15 menit
let idleTime = 0;

//Fungsi muatData
function muatData() {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      let filteredData = data;

      if (userRole === "rayon") {
        filteredData = data.filter(item => item["Rayon"] === userRayon);
      } else if (userRole === "jemaat") {
        filteredData = data.filter(item =>
          item["Rayon"] === userRayon &&
          item["Nama Lengkap"] === userNama
        );
      }

      // Panggil fungsi renderTable atau renderData di sini
      renderTable(filteredData);
    });
}


//Format tanggal Indonesia
function formatTanggalIndonesia(tanggal) {
  if (!tanggal) return "";

  const bulanMap = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  let d;

  // Jika Date object, gunakan langsung
  if (Object.prototype.toString.call(tanggal) === "[object Date]") {
    d = tanggal;
  } else if (typeof tanggal === "string" && tanggal.includes("T")) {
    d = new Date(tanggal); // ISO string
  } else {
    return tanggal; // string biasa: abaikan
  }

  if (isNaN(d)) return tanggal;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = bulanMap[d.getMonth()];
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

function tanggalIndonesiaKeInput(tanggal) {
  if (!tanggal) return "";

  const [dd, mmm, yyyy] = tanggal.split("/");

  const bulanMap = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", Mei: "05", Jun: "06",
    Jul: "07", Agu: "08", Sep: "09", Okt: "10", Nov: "11", Des: "12"
  };

  const bulan = bulanMap[mmm] || "01";
  return `${yyyy}-${bulan}-${dd.padStart(2, '0')}`;
}

function convertToInputDate(value) {
  if (!value) return "";

  // Jika value berupa string seperti "5/1/2024" (mm/dd/yyyy)
  const d = new Date(value);
  if (isNaN(d)) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}


//Fungsi Konversi Tanggal
function isoToInputDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d)) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


// Fungsi bantu format tanggal ISO ke dd/mm/yyyy
function formatTanggal(isoStr) {
  if (!isoStr || !isoStr.includes("T")) return isoStr;
  const date = new Date(isoStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Format ISO ke YYYY-MM-DD untuk input[type="date"]
// Fungsi Konversi Tanggal untuk Isi Modal Edit
function inputDateToISO(dateStr) {
  if (!dateStr) return "";

  const bulanMap = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const [yyyy, mm, dd] = dateStr.split("-");
  const bulan = bulanMap[parseInt(mm) - 1];
  return `${dd}/${bulan}/${yyyy}`;
}


// ========================
// ====== FITUR EDIT ======
// ========================
window.bukaModalEdit = function (rowIndex, rowData) {
  const form = document.getElementById("formEdit");
  const fieldsDiv = document.getElementById("editFields");

  form.rowIndex.value = rowIndex;
  fieldsDiv.innerHTML = '';

  const headers = fullData[0];

  const dropdownFields = {
    "Jenis Kelamin": ["Laki-laki", "Perempuan"],
    "Agama": ["Islam", "Kristen", "Katolik", "Hindu", "Budha", "Lainnya"],
    "Status Baptis": ["Belum", "Sudah"],
    "Status Sidi": ["Belum", "Sudah"],
    "Status Nikah": ["Belum", "Sudah"],
    "Golongan Darah": ["A", "B", "AB", "O"],
    "Intra": ["PKB", "PW", "PAM", "PAR"],
    "Rayon": ["Rayon I", "Rayon II", "Rayon III", "Rayon IV", "Rayon V", "Rayon VI"],
    "Status Domisili": ["Tetap", "Tidak Tetap"],
  };

  headers.forEach((header, i) => {
    const value = rowData[i] || "";
    
    console.log("Nilai tanggal untuk header:", header, "→", value); // ✅ tambahkan di sini
    
    const label = document.createElement("label");
    label.className = "text-sm font-medium";
    label.textContent = header;

    let input;

    if (dropdownFields[header]) {
      input = document.createElement("select");
      input.className = "w-full border px-3 py-2 rounded";
      input.name = `field_${i}`;

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Pilih --";
      if (value === "") {
        defaultOption.selected = true;
      }
      input.appendChild(defaultOption);

      dropdownFields[header].forEach(optionText => {
        const opt = document.createElement("option");
        opt.value = optionText;
        opt.textContent = optionText;
        if (optionText === value) {
          opt.selected = true;
        }
        input.appendChild(opt); // ✅ tidak error karena pasti <option>
      });
    } else if (["Tanggal Lahir", "Tanggal Nikah"].includes(header)) {
      input = document.createElement("input");
      input.type = "date";
      input.className = "w-full border px-3 py-2 rounded";
      input.name = `field_${i}`;
      input.value = isoToInputDate(value); // ✅ konversi ISO ke yyyy-mm-dd
    } else {
      input = document.createElement("input");
      input.className = "w-full border px-3 py-2 rounded";
      input.name = `field_${i}`;
      if (["Tanggal Lahir", "Tanggal Nikah"].includes(header)) {
        input.value = isoToInputDate(value);
      } else {
        input.value = value;  
      }
    }

    const wrapper = document.createElement("div");
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    fieldsDiv.appendChild(wrapper);
  });

  document.getElementById("modalEdit").classList.remove("hidden");
}

//bukaModal
window.bukaModal = function () {
  const form = document.getElementById("formTambah");
  const fieldsDiv = document.getElementById("tambahFields");
  fieldsDiv.innerHTML = '';

  const headers = fullData[0];

  const dropdownFields = {
    "Jenis Kelamin": ["Laki-laki", "Perempuan"],
    "Agama": ["Islam", "Kristen", "Katolik", "Hindu", "Budha"],
    "Status Baptis": ["Belum", "Sudah"],
    "Status Sidi": ["Belum", "Sudah"],
    "Status Nikah": ["Belum", "Sudah"],
    "Golongan Darah": ["A", "B", "AB", "O"],
    "Status Nikah": ["Belum", "Sudah"],
    "Status Hubungan Dalam Keluarga": ["Kepala Keluarga", "Suami", "Istri", "Anak", "Menantu", "Cucu", "Orang Tua", "Mertua", "Famili Lain", "Pembantu", "Lainnya"],
    "Pendidikan Terakhir": ["Tidak/Belum Sekolah", "Belum Tamat SD", "Tamat SD", "SLTP", "SLTA", "Diploma I", "Diploma III", "Strata I", "Strata II", "Strata III"],
    "Intra": ["PKB", "PW", "PAM", "PAR", "Lainnya"],
    "Rayon": ["Rayon I", "Rayon II", "Rayon III", "Rayon IV", "Rayon V", "Rayon VI"],
    "Status Domisili": ["Tetap", "Tidak Tetap"],
  };

  headers.forEach((header, i) => {
    const label = document.createElement("label");
    label.className = "text-sm font-medium";
    label.textContent = header;

    let input;

    if (dropdownFields[header]) {
      input = document.createElement("select");
      input.className = "w-full border px-3 py-2 rounded";
      input.name = `field_${i}`;

      const optDefault = document.createElement("option");
      optDefault.value = "";
      optDefault.textContent = "-- Pilih --";
      //optDefault.disabled = true;
      optDefault.selected = true;
      input.appendChild(optDefault);

      dropdownFields[header].forEach(optVal => {
        const opt = document.createElement("option");
        opt.value = optVal;
        opt.textContent = optVal;
        input.appendChild(opt);
      });

    } else if (["Tanggal Lahir", "Tanggal Nikah"].includes(header)) {
      input = document.createElement("input");
      input.type = "date";
      input.className = "w-full border px-3 py-2 rounded";
      input.name = `field_${i}`;
    } else {
      input = document.createElement("input");
      input.className = "w-full border px-3 py-2 rounded";
      input.name = `field_${i}`;
    }

    const wrapper = document.createElement("div");
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    fieldsDiv.appendChild(wrapper);
  });

  document.getElementById("modalTambah").classList.remove("hidden");
}

//SIMPAN EDIT DATA
window.simpanEdit = async () => {
  showSpinner();

  // Ambil row index
  const rowIndexInput = document.querySelector("input[name='rowIndex']");
  if (!rowIndexInput) {
    console.error("Elemen input[name='rowIndex'] tidak ditemukan!");
    hideSpinner();
    return;
  }
  const rowIndex = rowIndexInput.value;

  // Ambil semua field dari modalEdit (input, select, textarea)
  const fields = document.querySelectorAll('#modalEdit input[name^="field_"], #modalEdit select[name^="field_"], #modalEdit textarea[name^="field_"]');

  // Kumpulkan data ke dalam format updatedData
  const updatedData = {};
  fields.forEach(field => {
    if (field.name && field.value !== undefined) {
      updatedData[field.name] = field.value;
    }
  });

  console.log("=== DEBUG SIMPAN EDIT ===");
  console.log("Row Index:", rowIndex);
  console.log("Updated Data:", updatedData);

  try {
    const response = await fetch('/api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        row: rowIndex,
        data: Object.values(updatedData)  // Kirim dalam bentuk array
      })
    });

    const raw = await response.text();
    let result;

    try {
      result = JSON.parse(raw);
    } catch (jsonErr) {
      console.error("Response bukan JSON:", raw);
      showToast("Gagal menyimpan data: " + raw, "bg-red-600");
      hideSpinner();
      return;
    }

    if (response.ok) {
      showToast("Data berhasil diperbarui", "bg-green-600");
      tutupModalEdit();
      muatData();
    } else {
      showToast(result.error || "Gagal menyimpan data", "bg-red-600");
    }

  } catch (err) {
    console.error("Gagal saat simpan:", err);
    showToast("Terjadi kesalahan saat menyimpan", "bg-red-600");
  }

  hideSpinner();
};



window.tutupModal = function () {
  document.getElementById("modalTambah").classList.add("hidden");
};

//TUtup ModalEdit
window.tutupModalEdit = function () {
  document.getElementById("modalEdit").classList.add("hidden");
};

//Hapus Data
function hapusData(rowIndex) {
  const url = 'https://script.google.com/macros/s/AKfycbyuSCpnuB7AfNcxTCE2VW7ANRr6juySf0fPnuKB1b1HZxtfiqdisRdIrbn-fl0MbFcULA/exec?action=deleteData&row=' + rowIndex;

  fetch("/api/delete", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ row: rowIndex })
  })
  .then(res => res.text())
  .then(msg => {
    showToast(msg || "Data berhasil dihapus");
    location.reload();
  })
  .catch(err => {
    console.error("Error saat menghapus:", err);
    alert("Gagal menghapus data.");
  });
}

// Render tabel utama
function renderTable(data) {
  const headerRow = document.getElementById("tableHeader");
  const tableBody = document.getElementById("dataTable");

  headerRow.innerHTML = '';
  tableBody.innerHTML = '';

  const headers = data[0];
  const rows = data.slice(1);

  let rows = data.slice(1); // ambil semua baris data
  const headers = data[0];

  // Ambil info login
  const role = localStorage.getItem("userRole");
  const namaLogin = localStorage.getItem("userNama");
  const rayonLogin = localStorage.getItem("userRayon");

  // Identifikasi kolom yang dibutuhkan
  const idxRayon = headers.findIndex(h => h.trim().toLowerCase() === "rayon");
  const idxNama = headers.findIndex(h => h.trim().toLowerCase() === "nama");
  const idxKeluarga = headers.findIndex(h => h.trim().toLowerCase() === "id keluarga");

  // Filter data berdasarkan role
  if (role === "rayon" && idxRayon >= 0) {
    rows = rows.filter(row => row[idxRayon]?.trim() === rayonLogin);
  }

  if (role === "jemaat" && idxRayon >= 0 && idxNama >= 0 && idxKeluarga >= 0) {
    // Cari ID Keluarga dari jemaat yang login
    const barisJemaat = rows.find(row =>
      row[idxRayon]?.trim() === rayonLogin &&
      row[idxNama]?.trim().toLowerCase() === namaLogin?.toLowerCase()
    );

    if (barisJemaat) {
      const idKeluarga = barisJemaat[idxKeluarga];
      rows = rows.filter(row =>
        row[idxRayon]?.trim() === rayonLogin &&
        row[idxKeluarga]?.trim() === idKeluarga
      );
    } else {
      rows = []; // Jika tidak ketemu, tampilkan kosong
    }
  }

  // Tambahkan kolom header "Aksi" paling awal
  const thAksi = document.createElement("th");
  thAksi.className = "px-2 py-1 border text-xs";
  thAksi.textContent = "Aksi";
  headerRow.appendChild(thAksi);
  
  // Buat header
  headers.forEach(header => {
    const th = document.createElement("th");
    th.className = "px-2 py-1 border text-xs";
    th.textContent = header;
    headerRow.appendChild(th);
  });

  // Tampilkan baris (pagination)
  const startIndex = (currentPage - 1) * rowsPerPage;
  const rowsToDisplay = rows.slice(startIndex, startIndex + rowsPerPage);

  rowsToDisplay.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    row.forEach((cell, j) => {
      const td = document.createElement("td");
      td.className = "px-2 py-1 border text-xs";

      const header = headers[j]?.trim().toLowerCase();

      if (["tanggal lahir", "tanggal nikah"].includes(header)) {
        td.textContent = formatTanggalIndonesia(cell);
      } else {
        td.textContent = cell;
      }

      tr.appendChild(td);
    });

    // ✅ Gunakan index asli dari fullData untuk keperluan hapus/edit
    const indexAsli = fullData.findIndex(r => JSON.stringify(r) === JSON.stringify(row));

    const tdAksi = document.createElement("td");
    tdAksi.className = "px-2 py-1 border text-center";

    const role = localStorage.getItem("userRole");

    // Hanya tampilkan tombol edit & hapus jika bukan jemaat
    if (role !== "jemaat") {
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "✎";
      btnEdit.className = "text-blue-600 text-xs mr-2";
      btnEdit.onclick = () => bukaModalEdit(indexAsli, row);

      const btnHapus = document.createElement("button");
      btnHapus.textContent = "🗑️";
      btnHapus.className = "text-red-600 text-xs";
      btnHapus.onclick = () => {
        if (confirm("Yakin ingin menghapus data ini?")) {
          hapusData(indexAsli);
        }
      };
    
      tdAksi.appendChild(btnEdit);
      tdAksi.appendChild(btnHapus);
    } else {
      tdAksi.textContent = "-"; // Jemaat hanya lihat tanda strip
    }
    
    tr.insertBefore(tdAksi, tr.firstChild); // aksi di sisi kiri

    tableBody.appendChild(tr);
  });

  // Update page info
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
}


// Pagination
window.nextPage = function () {
  const rows = filteredData.slice(1); // tanpa header
  const totalPages = Math.ceil((fullData.length - 1) / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(filteredData);
  }
};

window.prevPage = function () {
  if (currentPage > 1) {
    currentPage--;
    renderTable(filteredData);
  }
};

// Ambil data awal
fetch(url)
  .then(res => res.json())
  .then(data => {
    fullData = data;
    renderTable(fullData);
  });

//Logout
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// Tampilkan info login pengguna
document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("userRole");
  const nama = localStorage.getItem("userNama") || "";
  const rayon = localStorage.getItem("userRayon") || "";

  const display = document.getElementById("userDisplay");
  if (!display) return;

  if (role === "admin") {
    display.textContent = "Login sebagai Admin";
  } else if (role === "rayon") {
    display.textContent = `Majelis Rayon ${rayon}`;
  } else if (role === "jemaat") {
    display.textContent = `Jemaat: ${nama} (Rayon ${rayon})`;
  }
});


// 🔔 Fungsi toast modern
function showToast(msg, warna = 'bg-green-600') {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded text-white shadow-lg z-50 ${warna}`;
    toast.textContent = msg;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
}


window.onload = function () {
  resetIdleTimer(); // Auto logout timer reset
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const label = document.getElementById("usernameLabel");
  if (username && label) {
    label.textContent = `Halo, ${username}`;
  }

  if (!role || !username) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "index.html";
    return;
  }

  if (role === "jemaat") {
    const btnTambah = document.getElementById("btnTambah");
    if (btnTambah) btnTambah.style.display = "none";
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      fullData = data;
      filteredData = data; // ✅ ini penting agar pencarian bekerja
      if (role === "jemaat") {
        // Anggap username disimpan di kolom "Kode Anggota" (kolom ke-0)
        fullData = [data[0], ...data.filter(row => row[0] === username)];
      }

      renderTable(fullData);
      hitungStatistikUtama(fullData);
      tampilkanSemuaStatistik(fullData);
      
      const dropdownRayon = document.getElementById("filterRayon");

      dropdownRayon.addEventListener("change", function () {
        const pilihan = this.value;
        const dataTersaring = filterDataByRayon(fullData, pilihan);
        console.log("Rayon terpilih:", pilihan);
        console.log("Jumlah data hasil filter:", dataTersaring.length);
        console.log("Contoh data:", dataTersaring[1]);

        hitungStatistikUtama(dataTersaring);
        tampilkanSemuaStatistik(dataTersaring);
      });
     
      // Menampilkan statistik
      document.getElementById("totalJemaat").textContent = fullData.length - 1;
    });
  
  //CARI NAMA
  document.getElementById("searchInput").addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const dataToSearch = (filteredData && filteredData.length > 0) ? filteredData : fullData;

    if (!dataToSearch || dataToSearch.length === 0) return;

    const header = dataToSearch[0];
    const result = [header];

    for (let i = 1; i < dataToSearch.length; i++) {
      const row = dataToSearch[i];
      const nama = row[1]?.toLowerCase() || "";
      if (nama.includes(keyword)) {
        result.push(row);
      }
    }

    renderTable(result);
  });

  // Export ke Excel
  window.exportToExcel = function () {
    const headers = fullData[0];
    const rows = fullData.slice(1);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Jemaat");
    XLSX.writeFile(workbook, "Data_Jemaat.xlsx");
  }

  //formTambah / Tambah Data
  // Handle form tambah data
  document.getElementById("formTambah").addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = this.querySelectorAll("input, select");
    const data = [];

    inputs.forEach(input => {
      let value = input.value.trim();

      if (input.type === "date" && value) {
        const d = new Date(value);
        if (!isNaN(d)) {
          const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const tanggal = String(d.getDate()).padStart(2, '0');
          const bulan = bulanPendek[d.getMonth()];
          const tahun = d.getFullYear();
          value = `${tanggal}/${bulan}/${tahun}`;
        }
      }

      data.push(value);
    });

    showSpinner();
    
    fetch("/api/add", {
      method: "POST",
      //mode: "no-cors",
      headers: {
        //"Content-Type": "application/x-www-form-urlencoded"
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: data })  // ✅ langsung array
    })

    .then(res => res.text())
    .then(msg => {
      // ✅ Reset semua field
      this.reset();
      hideSpinner();
      showToast("Data berhasil ditambahkan!");
      tutupModal();
      location.reload();
    })
    .catch(err => {
      console.error("Error tambah data:", err);
      alert("Gagal menambahkan data.");
    });

    document.getElementById("rowsPerPage").addEventListener("change", () => {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          renderTable(data);
        });
    });
    
  })
  
  
  function buatStatistik(data, kolomIndex, judul, tipe = 'pie') {
    const container = document.getElementById("statistikJemaat");
    const countMap = {};

    data.slice(1).forEach(row => {
      const key = row[kolomIndex] || "Tidak Diisi";
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const labels = Object.keys(countMap);
    const values = Object.values(countMap);
    const colors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`);

    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded shadow text-center";

    const title = document.createElement("p");
    title.className = "text-gray-600 font-medium mb-2";
    title.textContent = judul;

    const canvas = document.createElement("canvas");

    div.appendChild(title);
    div.appendChild(canvas);
    container.appendChild(div);

    new Chart(canvas, {
      type: tipe,
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: false }
        },
        scales: tipe === 'bar' ? {
          y: { beginAtZero: true }
        } : {}
      }
    });
  } 

  
  function hitungStatistikUtama(data) {
    const rows = data.slice(1);
    const total = rows.length;
    const kepalaKeluarga = rows.filter(row =>
      row.includes("Suami") || row.includes("Kepala Keluarga")
    ).length;

    document.getElementById("totalJemaat").textContent = total;
    document.getElementById("totalKeluarga").textContent = kepalaKeluarga;
  }

  function filterDataByRayon(data, rayon) {
    if (rayon === "Semua") return data;

    const header = data[0];
    const rayonIndex = header.indexOf("Rayon");

    if (rayonIndex === -1) {
      console.warn("Kolom 'Rayon' tidak ditemukan!");
      return data;
    }

    const filtered = data.filter((row, index) => {
      if (index === 0) return true;
      return row[rayonIndex] === rayon;
    });

    return filtered;
  }


  function tampilkanSemuaStatistik(data) {
    document.getElementById("statistikJemaat").innerHTML = "";

    // Statistik Grafik
    buatStatistik(data, 2, "Jenis Kelamin");
    buatStatistik(data, 5, "Golongan Darah");
    buatStatistik(data, 7, "Status Baptis");
    buatStatistik(data, 8, "Status Sidi");
    buatStatistik(data, 9, "Status Nikah");
    buatStatistik(data, 13, "Pendidikan", "bar");
    buatStatistik(data, 15, "Pekerjaan", "bar");
    buatStatistik(data, 20, "Intra", "bar");
    buatStatistik(data, 21, "Rayon", "bar");
  }

  //Filter RAYON
  document.getElementById("filterRayon").addEventListener("change", function () {
    currentRayon = this.value;
    filteredData = filterDataByRayon(fullData, currentRayon);

    hitungStatistikUtama(filteredData);
    tampilkanSemuaStatistik(filteredData);
    renderTable(filteredData);
    if (filteredData.length <= 1) {
      alert(`Tidak ada data jemaat untuk ${currentRayon}`);
    }
  });


  function timerIncrement() {
    idleTime += 1;
    if (idleTime >= 15) { // 15 menit
      alert("Sesi Anda telah berakhir. Anda akan logout otomatis.");
      logout(); // Pakai fungsi logout() yang sudah kamu buat
    }
  }

  // Reset timer kalau ada aktivitas
  function resetIdleTimer() {
    idleTime = 0;
  }


  // Hitung waktu idle tiap 1 menit
  setInterval(timerIncrement, 60000); // 60.000 ms = 1 menit


  // Deteksi aktivitas
  window.onmousemove = resetIdleTimer;
  window.onmousedown = resetIdleTimer;
  window.onclick = resetIdleTimer;
  window.onscroll = resetIdleTimer;
  window.onkeypress = resetIdleTimer;


  
}

//Loading Spinner
function showSpinner() {
  document.getElementById("spinner").classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("spinner").classList.add("hidden");
}
