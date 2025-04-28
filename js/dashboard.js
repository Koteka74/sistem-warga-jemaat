const scriptURL = "https://script.google.com/macros/s/AKfycbzef9OMJex-OQyZxV_9G_QyFyRgeF5OMocpwySw5gCHngaUySeB1LvArUeXqL16gewuLQ/exec";
const url = scriptURL + "?action=getData";

// ====== Variabel Global ======
let fullData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 10;

// ====== Fungsi Konversi Tanggal ======
function formatTanggalIndonesia(tanggalStr) {
  if (!tanggalStr) return "";
  const date = new Date(tanggalStr);
  if (isNaN(date)) return tanggalStr;

  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

function isoToInputDate(value) {
  if (!value) return "";
  const parts = value.split('/');
  if (parts.length === 3) {
    const [dd, mmm, yyyy] = parts;
    const bulanPendek = {
      Jan: "01", Feb: "02", Mar: "03",
      Apr: "04", Mei: "05", Jun: "06",
      Jul: "07", Agt: "08", Sep: "09",
      Okt: "10", Nov: "11", Des: "12"
    };
    const mm = bulanPendek[mmm] || "01";
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

// ====== Fungsi Tampil Tabel ======
function renderTable(data) {
  const headerRow = document.getElementById("tableHeader");
  const tableBody = document.getElementById("dataTable");
  headerRow.innerHTML = '';
  tableBody.innerHTML = '';

  const headers = data[0];
  const rows = data.slice(1);

  headers.forEach(header => {
    const th = document.createElement("th");
    th.className = "px-2 py-1 border";
    th.textContent = header;
    headerRow.appendChild(th);
  });

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const rowsToDisplay = rows.slice(start, end);

  rowsToDisplay.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Tombol Edit dan Hapus di sisi kiri
    const tdAksi = document.createElement("td");
    tdAksi.className = "px-2 py-1 border whitespace-nowrap flex gap-1";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";
    btnEdit.className = "bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded text-xs";
    btnEdit.onclick = () => bukaModalEdit(start + index, row);

    const btnHapus = document.createElement("button");
    btnHapus.textContent = "Hapus";
    btnHapus.className = "bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs";
    btnHapus.onclick = () => {
      if (confirm("Yakin ingin menghapus data ini?")) {
        hapusData(start + index);
      }
    };

    tdAksi.appendChild(btnEdit);
    tdAksi.appendChild(btnHapus);
    tr.appendChild(tdAksi);

    row.forEach(cell => {
      const td = document.createElement("td");
      td.className = "px-2 py-1 border";
      td.textContent = cell;
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
}

// ====== Fungsi Pagination ======
window.nextPage = function () {
  const rows = filteredData.slice(1);
  const totalPages = Math.ceil(rows.length / rowsPerPage);
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

// ====== Fungsi Tambah Data ======
document.getElementById("formTambah").addEventListener("submit", function (e) {
  e.preventDefault();
  const inputs = this.querySelectorAll("input, select");
  const data = [];

  inputs.forEach(input => {
    let value = input.value.trim();
    if (input.type === "date" && value) {
      const d = new Date(value);
      if (!isNaN(d)) {
        const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const tanggal = String(d.getDate()).padStart(2, '0');
        const bulan = bulanPendek[d.getMonth()];
        const tahun = d.getFullYear();
        value = `${tanggal}/${bulan}/${tahun}`;
      }
    }
    data.push(value);
  });

  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "action=addData&data=" + encodeURIComponent(JSON.stringify(data))
  });

  this.reset();
  showToast("Data berhasil ditambahkan!");
  tutupModal();
  location.reload();
});

// ====== Fungsi Edit Data ======
window.simpanEdit = function () {
  const form = document.getElementById("formEdit");
  const rowIndex = form.rowIndex.value;
  const inputs = form.querySelectorAll("#editFields input, #editFields select");
  const data = [];

  inputs.forEach(input => {
    let value = input.value.trim();
    if (input.type === "date" && value) {
      const d = new Date(value);
      if (!isNaN(d)) {
        const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const tanggal = String(d.getDate()).padStart(2, '0');
        const bulan = bulanPendek[d.getMonth()];
        const tahun = d.getFullYear();
        value = `${tanggal}/${bulan}/${tahun}`;
      }
    }
    data.push(value);
  });

  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "action=updateData&row=" + rowIndex + "&data=" + encodeURIComponent(JSON.stringify(data))
  });

  showToast("Data berhasil diupdate!");
  tutupModalEdit();
  location.reload();
};

// ====== Fungsi Hapus Data ======
function hapusData(rowIndex) {
  const urlDelete = scriptURL + `?action=deleteData&row=${rowIndex}`;
  fetch(urlDelete)
    .then(res => res.text())
    .then(msg => {
      showToast(msg);
      location.reload();
    });
}

// ====== Fungsi Toast ======
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// ====== Modal Tambah dan Edit ======
window.bukaModal = function () {
  document.getElementById("modalTambah").classList.remove("hidden");
};
window.tutupModal = function () {
  document.getElementById("modalTambah").classList.add("hidden");
};
window.tutupModalEdit = function () {
  document.getElementById("modalEdit").classList.add("hidden");
};

// ====== Load Data di Awal ======
window.onload = function () {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      fullData = data;
      filteredData = data;
      renderTable(filteredData);
    });

  document.getElementById("searchInput").addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const result = [fullData[0]];

    for (let i = 1; i < fullData.length; i++) {
      const row = fullData[i];
      const nama = row[1]?.toLowerCase() || "";
      if (nama.includes(keyword)) {
        result.push(row);
      }
    }
    filteredData = result;
    currentPage = 1;
    renderTable(filteredData);
  });

  document.getElementById("rowsPerPage").addEventListener("change", function () {
    rowsPerPage = parseInt(this.value);
    currentPage = 1;
    renderTable(filteredData);
  });
};
