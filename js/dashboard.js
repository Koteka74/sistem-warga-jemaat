const url = 'https://script.google.com/macros/s/AKfycby294uq0SODlKiwTl3qNx8A7j3ugAleXUi2rK6uBGA-PW3JkxhNa_oQQH3Qv9oTbStBgg/exec?action=getData';
const scriptURL = "https://script.google.com/macros/s/AKfycby294uq0SODlKiwTl3qNx8A7j3ugAleXUi2rK6uBGA-PW3JkxhNa_oQQH3Qv9oTbStBgg/exec";

let fullData = [];
let filteredData = []; // 🆕 Untuk menyimpan data yang sedang difilter
let currentRayon = "Semua";
let currentPage = 1;
let rowsPerPage = 10;
// Auto Logout jika tidak aktif selama 15 menit
let idleTime = 0;

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
    "Golongan Darah": ["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "Status Hubungan Dalam Keluarga": ["Kepala Keluarga", "Suami", "Istri", "Anak", "Menantu", "Cucu", "Orang Tua", "Mertua", "Famili Lain", "Pembantu", "Lainnya"],
    "Pendidikan Terakhir": ["Tidak/Belum Sekolah", "Belum Tamat SD", "Tamat SD", "SLTP", "SLTA", "Diploma I", "Diploma III", "Strata I", "Strata II", "Strata III"],
    "Intra": ["PKB", "PW", "PAM", "PAR"],
    "Rayon": ["Rayon I", "Rayon II", "Rayon III", "Rayon IV", "Rayon V", "Rayon VI"],
    "Status Domisili": ["Tetap", "Tidak Tetap"],
    "Pekerjaan": [
      "Belum/ Tidak Bekerja",
      "Mengurus Rumah Tangga",
      "Pelajar/Mahasiswa",
      "Pensiunan",
      "Pegawai Negeri Sipil",
      "TNI",
      "Kepolisian RI (POLRI)",
      "Perdagangan",
      "Petani/Pekebun",
      "Petemak",
      "Nelayan/Perikanan",
      "Industri",
      "Konstruksi",
      "Transpotasi",
      "Karyawan Swasta",
      "Karyawan BUMN",
      "Karyawan BUMD",
      "Karyawan Honorer",
      "Buruh Harian Lepas",
      "Pembantu Rumah Tangga",
      "Tukang Cukur",
      "Tukang Listrik",
      "Tukang Batu",
      "Tukang Kayu",
      "Tukang Sol Sepatu",
      "Tukang Las",
      "Tukang jahit",
      "Tukang gigi",
      "Penata rias",
      "Penata busana",
      "Penata rambut",
      "Mekanik",
      "Seniman",
      "Perancang Busana",
      "Penterjemah",
      "Pendeta",
      "Wartawan",
      "Juru masak",
      "Promotor acara",
      "Anggota DPR RI",
      "Anggota DPD",
      "Anggota BPK",
      "Gubernur",
      "Wakil Gubemur",
      "Bupati",
      "Wakil Bupati",
      "Walikota",
      "Wakil Walikota",
      "Ang. DPRD Prov",
      "Ang. DPRD Kab/Kota",
      "Dosen",
      "Guru",
      "Pilot",
      "Pengacara",
      "Notaris",
      "Arsitek",
      "Akuntan",
      "Konsultan",
      "Dokter",
      "Bidan",
      "Perawat",
      "Apoteker",
      "Psikiater/Psikolog",
      "PenyiarTelevisi",
      "Penyiar Radio",
      "Pelaut",
      "Peneliti",
      "Sopir",
      "Pedagang",
      "Perangkat Kampung",
      "Kepala Desa",
      "Wiraswasta"
    ],
  };

  headers.forEach((header, i) => {
    const value = rowData[i] || "";
    
    console.log("Nilai tanggal untuk header:", header, "→", value); // ✅ tambahkan di sini
    console.log(dropdownFields[header])
      
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
    "Golongan Darah": ["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "Status Nikah": ["Belum", "Sudah"],
    "Status Hubungan Dalam Keluarga": ["Kepala Keluarga", "Suami", "Istri", "Anak", "Menantu", "Cucu", "Orang Tua", "Mertua", "Famili Lain", "Pembantu", "Lainnya"],
    "Pendidikan Terakhir": ["Tidak/Belum Sekolah", "Belum Tamat SD", "Tamat SD", "SLTP", "SLTA", "Diploma I", "Diploma III", "Strata I", "Strata II", "Strata III"],
    "Intra": ["PKB", "PW", "PAM", "PAR", "Lainnya"],
    "Rayon": ["Rayon I", "Rayon II", "Rayon III", "Rayon IV", "Rayon V", "Rayon VI"],
    "Status Domisili": ["Tetap", "Tidak Tetap"],
    "Pekerjaan": [
      "Belum/ Tidak Bekerja",
      "Mengurus Rumah Tangga",
      "Pelajar/Mahasiswa",
      "Pensiunan",
      "Pegawai Negeri Sipil",
      "TNI",
      "Kepolisian RI (POLRI)",
      "Perdagangan",
      "Petani/Pekebun",
      "Petemak",
      "Nelayan/Perikanan",
      "Industri",
      "Konstruksi",
      "Transpotasi",
      "Karyawan Swasta",
      "Karyawan BUMN",
      "Karyawan BUMD",
      "Karyawan Honorer",
      "Buruh Harian Lepas",
      "Pembantu Rumah Tangga",
      "Tukang Cukur",
      "Tukang Listrik",
      "Tukang Batu",
      "Tukang Kayu",
      "Tukang Sol Sepatu",
      "Tukang Las",
      "Tukang jahit",
      "Tukang gigi",
      "Penata rias",
      "Penata busana",
      "Penata rambut",
      "Mekanik",
      "Seniman",
      "Perancang Busana",
      "Penterjemah",
      "Pendeta",
      "Wartawan",
      "Juru masak",
      "Promotor acara",
      "Anggota DPR RI",
      "Anggota DPD",
      "Anggota BPK",
      "Gubernur",
      "Wakil Gubemur",
      "Bupati",
      "Wakil Bupati",
      "Walikota",
      "Wakil Walikota",
      "Ang. DPRD Prov",
      "Ang. DPRD Kab/Kota",
      "Dosen",
      "Guru",
      "Pilot",
      "Pengacara",
      "Notaris",
      "Arsitek",
      "Akuntan",
      "Konsultan",
      "Dokter",
      "Bidan",
      "Perawat",
      "Apoteker",
      "Psikiater/Psikolog",
      "PenyiarTelevisi",
      "Penyiar Radio",
      "Pelaut",
      "Peneliti",
      "Sopir",
      "Pedagang",
      "Perangkat Kampung",
      "Kepala Desa",
      "Wiraswasta"
    ],

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

  // Ambil No Kode terakhir
  const noKodeIndex = fullData[0].indexOf("No Kode");
  const kodeList = fullData
    .slice(1)
    .map(row => parseInt(row[noKodeIndex]))
    .filter(num => !isNaN(num));

  const lastKode = kodeList.length > 0 ? Math.max(...kodeList) : 0;

  document.getElementById("noKodeTerakhir").textContent = `No Kode terakhir: ${lastKode}`;
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

window.tutupModalKeluarga = function () {
  document.getElementById("modalKeluarga").classList.add("hidden");
};


//Hapus Data
function hapusData(rowIndex) {
  const url = 'https://script.google.com/macros/s/AKfycby294uq0SODlKiwTl3qNx8A7j3ugAleXUi2rK6uBGA-PW3JkxhNa_oQQH3Qv9oTbStBgg/exec?action=deleteData&row=' + rowIndex;

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

      //Cek Kepala Keluarga
 
      if (["tanggal lahir", "tanggal nikah"].includes(header)) {
        td.textContent = formatTanggalIndonesia(cell);
      } else if (j === 1 && ["suami", "kepala keluarga"].includes((row[12] || "").toLowerCase())) {
        // Jika kolom Nama (j == 1) dan status suami/kepala keluarga
        const btn = document.createElement("button");
        btn.textContent = cell;
        btn.className = "text-blue-600 underline text-xs";
        btn.onclick = () => tampilkanKeluarga(row[0]); // row[0] = No Kode
        td.appendChild(btn);
      } else {
        td.textContent = cell;
      }

      tr.appendChild(td);
    });

    // ✅ Gunakan index asli dari fullData untuk keperluan hapus/edit
    const indexAsli = fullData.findIndex(r => JSON.stringify(r) === JSON.stringify(row));

    const tdAksi = document.createElement("td");
    tdAksi.className = "px-2 py-1 border text-center";

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
    tr.insertBefore(tdAksi, tr.firstChild); // aksi di sisi kiri

    tableBody.appendChild(tr);
  });

  //Konek ke tampilkan data per baris
  document.getElementById("rowsPerPage").addEventListener("change", function () {
    rowsPerPage = parseInt(this.value); // update jumlah baris
    currentPage = 1; // reset ke halaman pertama
    renderTable(filteredData.length ? filteredData : fullData); // tampilkan ulang tabel
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
    window.location.href = "index.html";
}

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

function tampilkanKeluarga(noKode) {
  const header = fullData[0];
  const keluarga = fullData.filter((row, i) => i === 0 || row[0] === noKode);

  if (keluarga.length <= 1) {
    alert("Data keluarga tidak ditemukan.");
    return;
  }

  const kkRow = keluarga.find(row =>
    (row[12] || "").toLowerCase().includes("suami") ||
    (row[12] || "").toLowerCase().includes("kepala keluarga")
  );
  const kkNama = kkRow ? kkRow[1] : "Tidak diketahui";

  document.getElementById("namaKepalaKeluarga").textContent = kkNama;
  document.getElementById("noKodeKeluarga").textContent = noKode;

  const kolomDiambil = ["Nama Lengkap", "Jenis Kelamin", "Tanggal Lahir", "Status Hubungan Dalam Keluarga"];
  const indexes = kolomDiambil.map(kol => header.indexOf(kol));

  let html = `<table class="min-w-full text-sm border border-gray-300 mt-2">
    <thead><tr>${kolomDiambil.map(h => `<th class="border px-2 py-1">${h}</th>`).join("")}</tr></thead>
    <tbody>`;

  const daftarKosong = [];

  keluarga.slice(1).forEach(row => {
    html += `<tr>`;
    indexes.forEach((i, idx) => {
      let val = row[i] || "-";

      if (header[i] === "Tanggal Lahir") {
        val = formatTanggal(val);
      }

      html += `<td class="border px-2 py-1">${val}</td>`;
    });
    html += `</tr>`;

    // Cek kekurangan data:
    const namaLengkap = row[1] || "Tanpa Nama"; // ← tambahkan baris ini
    const golDarah = row[5];
    const statusNikah = (row[9] || "").toLowerCase();
    const tanggalNikah = row[10];
    const tempatNikah = row[11];
    const pendidikan = (row[13] || "").trim();
    const gelar = row[14] || "";
    const asalGereja = row[16];
    const namaIbu = row[17];
    const namaAyah = row[18];

    if (!golDarah) daftarKosong.push(`${namaLengkap}: Golongan Darah belum diisi`);
    if (statusNikah === "sudah") {
      if (!tempatNikah) daftarKosong.push(`${namaLengkap}: Tempat Nikah belum diisi`);
      if (!tanggalNikah) daftarKosong.push(`${namaLengkap}: Tanggal Nikah belum diisi`);
    }
    if (!asalGereja) daftarKosong.push(`${namaLengkap}: Asal Gereja belum diisi`);
    const butuhGelar = ["Diploma III", "Strata I", "Strata II", "Strata III"];
    if (butuhGelar.includes(pendidikan) && gelar.trim() === "") {
      daftarKosong.push(`${namaLengkap}: Gelar terakhir belum diisi`);
    }
    if (!namaAyah) daftarKosong.push(`${namaLengkap}: Nama Ayah belum diisi`);
    if (!namaIbu) daftarKosong.push(`${namaLengkap}: Nama Ibu belum diisi`);
  });

  html += `</tbody></table>`;

  // Tambahkan keterangan data kosong
  let warning = "";
  if (daftarKosong.length) {
    warning = `
      <div class="text-red-600 mt-4 text-sm">
        ⚠️ <strong>Data belum lengkap:</strong><br>
        ${[...new Set(daftarKosong)].map(item => `• ${item}`).join("<br>")}
      </div>
    `;
  } else {
    warning = `<div class="text-green-600 mt-4 text-sm">✅ Semua data keluarga sudah lengkap</div>`;
  }


  document.getElementById("kontenKeluarga").innerHTML = html + warning;
  document.getElementById("modalKeluarga").classList.remove("hidden");
}


function cetakKartuKeluarga() {
  const originalContent = document.body.innerHTML;
  const modalContent = document.getElementById("modalKeluarga").innerHTML;

  document.body.innerHTML = modalContent;
  window.print();

  document.body.innerHTML = originalContent;
  window.location.reload(); // Refresh agar semua fungsi kembali aktif
}

window.printKartuKeluarga = function () {
  const modal = document.getElementById("modalKeluarga");
  const content = modal.querySelector(".modal-body") || modal;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Cetak Kartu Keluarga</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
          th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
          th { background-color: #dbeafe; }
          .warning { margin-top: 16px; color: #dc2626; font-size: 13px; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();

  function toggleExportMenu() {
  const menu = document.getElementById("exportMenu");
  menu.classList.toggle("hidden");
}

// Ekspor semua data
function exportToExcel() {
  const worksheet = XLSX.utils.aoa_to_sheet(fullData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Jemaat");
  XLSX.writeFile(workbook, "Data_Jemaat_Semua.xlsx");
}

// Ekspor berdasarkan rayon terpilih dari dropdown
function exportRayonSelected() {
  const selectedRayon = document.getElementById("rayonSelect").value;
  const filteredData = fullData.filter((row, i) => i === 0 || row[34] === selectedRayon);

  const worksheet = XLSX.utils.aoa_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, selectedRayon);
  XLSX.writeFile(workbook, `Data_Jemaat_${selectedRayon.replace(" ", "_")}.xlsx`);
}

};
