const url = 'https://script.google.com/macros/s/AKfycbwr48rbRBUF2ldaurXsybOQp4afkDALILMAbitf8-Sn5RjCsy6KcCTXxQJIBVv4f4ibPQ/exec?action=getData';

let fullData = [];
let currentPage = 1;
const rowsPerPage = 10;

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
function isoToInputDate(isoStr) {
  if (!isoStr || !isoStr.includes("T")) return "";
  const date = new Date(isoStr);
  return date.toISOString().slice(0, 10);
}

// Render tabel utama
window.renderTable = function (data) {
  const headerRow = document.getElementById("tableHeader");
  const tableBody = document.getElementById("dataTable");

  headerRow.innerHTML = '';
  tableBody.innerHTML = '';

  const headers = data[0];
  const rows = data.slice(1);

  // Tambah kolom "Aksi"
  const thAksi = document.createElement("th");
  thAksi.className = "px-2 py-1 border";
  thAksi.textContent = "Aksi";
  headerRow.appendChild(thAksi);

  // Header lainnya
  headers.forEach(header => {
    const th = document.createElement("th");
    th.className = "px-2 py-1 border";
    th.textContent = header;
    headerRow.appendChild(th);
  });

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const rowsToDisplay = rows.slice(start, end);

  rowsToDisplay.forEach(row => {
    const tr = document.createElement("tr");

    // === Kolom Aksi (Edit + Hapus) ===
    const tdAction = document.createElement("td");

    // Tombol Edit
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";
    btnEdit.className = "text-blue-600 underline mr-2";
    btnEdit.setAttribute("data-index", fullData.indexOf(row));
    btnEdit.onclick = function () {
      const rowIndex = parseInt(this.getAttribute("data-index")) + 1;
      bukaModalEdit(rowIndex, row);
    };
    tdAction.appendChild(btnEdit);

    // Tombol Hapus
    const btnHapus = document.createElement("button");
    btnHapus.textContent = "Hapus";
    btnHapus.className = "text-red-600 underline";
    btnHapus.setAttribute("data-index", fullData.indexOf(row));
    btnHapus.onclick = function () {
      const rowIndex = parseInt(this.getAttribute("data-index")) + 1;

      if (confirm("Apakah kamu yakin ingin menghapus data ini?")) {
        const deleteUrl = `https://script.google.com/macros/s/AKfycbwr48rbRBUF2ldaurXsybOQp4afkDALILMAbitf8-Sn5RjCsy6KcCTXxQJIBVv4f4ibPQ/exec?action=deleteData&row=${rowIndex}`;
        fetch(deleteUrl)
          .then(res => res.text())
          .then(msg => {
            alert(msg);
            location.reload();
          })
          .catch(err => {
            alert("Gagal menghapus data.");
            console.error(err);
          });
      }
    };
    tdAction.appendChild(btnHapus);

    tdAction.className = "px-2 py-1 border";
    tr.appendChild(tdAction);

    // === Data row ===
    row.forEach((cell, j) => {
      const td = document.createElement("td");
      const header = headers[j];

      let displayValue = cell;
      if (["Tanggal Lahir", "Tanggal Nikah"].includes(header)) {
        displayValue = formatTanggal(cell);
      }

      td.textContent = displayValue;
      td.className = "px-2 py-1 border";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
};


// Pagination
window.nextPage = function () {
  const totalPages = Math.ceil((fullData.length - 1) / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(fullData);
  }
};

window.prevPage = function () {
  if (currentPage > 1) {
    currentPage--;
    renderTable(fullData);
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


window.onload = function () {
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

      // Panggil statistik berdasarkan kolom
      buatStatistik(fullData, 21, "Rayon", "bar");
      buatStatistik(fullData, 2, "Jenis Kelamin");
      buatStatistik(fullData, 5, "Golongan Darah");
      buatStatistik(fullData, 7, "Status Baptis");
      buatStatistik(fullData, 8, "Status Sidi");
      buatStatistik(fullData, 9, "Status Nikah");
      buatStatistik(fullData, 13, "Pendidikan", "bar");
      buatStatistik(fullData, 15, "Pekerjaan", "bar");
      buatStatistik(fullData, 20, "Intra", "bar");

    });
  
 
  //formTambah
  document.getElementById("formTambah").addEventListener("submit", function (e) {
  e.preventDefault();
  const headers = fullData[0];

  //const inputs = this.querySelectorAll("input[name^='field_'], select[name^='field_']");
  const data = [];

  for (let i = 0; i < headers.length; i++) {
    const input = this.querySelector(`[name="field_${i}"]`);
    let val = input ? input.value.trim() : "";

    // Kosongkan "-- Pilih --"
    if (val === "-- Pilih --") {
      val = "";
    }
    
    // Format tanggal ke dd/mm/yyyy sebelum dikirim
    if (["Tanggal Lahir", "Tanggal Nikah"].includes(headers[i]) && val.includes("-")) {
      const parts = val.split("-");
      val = `${parts[2]}/${parts[1]}/${parts[0]}`; // dd/mm/yyyy
    }

    data.push(val);
  }

  const dataStr = encodeURIComponent(JSON.stringify(data));
  const addUrl = `https://script.google.com/macros/s/AKfycbwr48rbRBUF2ldaurXsybOQp4afkDALILMAbitf8-Sn5RjCsy6KcCTXxQJIBVv4f4ibPQ/exec?action=addData&data=${dataStr}`;

  fetch(addUrl)
    .then(res => res.text())
    .then(msg => {
      console.log("Respon:", msg);
      alert(msg);
      tutupModal();
      location.reload();
    })
    .catch(err => {
      console.error("Fetch error:", err);
      alert("Gagal menyimpan data.");
    });
});



  document.getElementById("searchInput").addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const filtered = [fullData[0]];
    for (let i = 1; i < fullData.length; i++) {
      const row = fullData[i];
      const nama = row[1]?.toLowerCase() || "";
      if (nama.includes(keyword)) {
        filtered.push(row);
      }
    }
    renderTable(filtered);
  });

  document.getElementById("rowsPerPage").addEventListener("change", () => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        renderTable(data);
      });
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

  //bukaModal
  window.bukaModal = function () {
  const form = document.getElementById("formTambah");
  const fieldsDiv = document.getElementById("tambahFields");
  fieldsDiv.innerHTML = '';

  const headers = fullData[0];

  const dropdownFields = {
    "Jenis Kelamin": ["Laki-laki", "Perempuan"],
    "Agama": ["Islam", "Kristen", "Katolik", "Hindu", "Budha"],
    "Status Baptis": ["Sudah", "Belum"],
    "Status Sidi": ["Sudah", "Belum"],
    "Status Nikah": ["Sudah", "Belum"],
    "Golongan Darah": ["A", "B", "AB", "O"]
  };

  headers.forEach((header, i) => {
    const label = document.createElement("label");
    label.className = "text-sm font-medium";
    label.textContent = header;

    let input;

    if (dropdownFields[header]) {
      input = document.createElement("select");
      //if (["Tanggal Lahir", "Tanggal Nikah"].includes(header)) {
        //input = document.createElement("input");
        //input.type = "date";
        //input.placeholder = "Format: DD/MM/YYYY"; // 👈 petunjuk format
        //input.className = "w-full border px-3 py-2 rounded";
        //input.name = `field_${i}`;
        //input.value = value || ""; // saat edit
      //}

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


  window.tutupModal = function () {
    document.getElementById("modalTambah").classList.add("hidden");
  };

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
    "Agama": ["Kristen", "Katolik", "Islam", "Hindu", "Budha", "Lainnya"],
    "Status Baptis": ["Sudah", "Belum"],
    "Status Sidi": ["Sudah", "Belum"],
    "Status Nikah": ["Sudah", "Belum"],
    "Golongan Darah": ["A", "B", "AB", "O"]
  };

  headers.forEach((header, i) => {
    const value = rowData[i] || "";

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
      input.value = value;
    }

    const wrapper = document.createElement("div");
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    fieldsDiv.appendChild(wrapper);
  });

  document.getElementById("modalEdit").classList.remove("hidden");
}


  //TUtup ModalEdit
  window.tutupModalEdit = function () {
    document.getElementById("modalEdit").classList.add("hidden");
  };

  document.getElementById("formEdit").addEventListener("submit", function (e) {
    e.preventDefault();
    const rowIndex = this.rowIndex.value;
    const headers = fullData[0];

    // Ambil semua field berdasarkan urutan field_0, field_1, dst.
    const data = [];
    
    for (let i = 0; i < headers.length; i++) {
     const input = this.querySelector(`[name="field_${i}"]`);
     let val = input ? input.value.trim() : "";

     // Konversi ke dd/mm/yyyy jika input type date (val = yyyy-mm-dd)
     if (["Tanggal Lahir", "Tanggal Nikah"].includes(headers[i]) && val.includes("-")) {
       const parts = val.split("-");
       val = `${parts[2]}/${parts[1]}/${parts[0]}`; // dd/mm/yyyy
     }

     data.push(val);
   }

    const updateUrl = `https://script.google.com/macros/s/AKfycbwr48rbRBUF2ldaurXsybOQp4afkDALILMAbitf8-Sn5RjCsy6KcCTXxQJIBVv4f4ibPQ/exec?action=updateData&row=${rowIndex}&data=${encodeURIComponent(JSON.stringify(data))}`;

    fetch(updateUrl)
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        tutupModalEdit();
        location.reload();
      })
      .catch(err => {
        console.error("Fetch error:", err);
        alert("Gagal mengupdate data.");
      });
  });
};

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

document.getElementById("filterRayon").addEventListener("change", function () {
  const pilihan = this.value;
  const dataTersaring = filterDataByRayon(fullData, pilihan);
  hitungStatistikUtama(dataTersaring);
  tampilkanSemuaStatistik(dataTersaring);
});
