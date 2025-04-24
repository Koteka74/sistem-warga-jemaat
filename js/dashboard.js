let fullData = []; // deklarasi dulu
let currentPage = 1;
const rowsPerPage = 10;

function nextPage() {
  const totalPages = Math.ceil((fullData.length - 1) / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(fullData);
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable(fullData);
  }
}

window.onload = function () {
  const url = 'https://script.google.com/macros/s/AKfycbzKfFVn04fod7EJgBULdad_0Eksza7hm9wt3UeEQW7q0Uir5Mpem1dHuwJTALztEty9Sg/exec?action=getData';
  let currentPage = 1;
  const rowsPerPage = 10;

  // Format tanggal dari ISO ke dd/mm/yyyy
function formatTanggal(isoStr) {
  if (!isoStr || !isoStr.includes("T")) return isoStr; // bukan ISO

  const date = new Date(isoStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Format ISO ke yyyy-mm-dd (untuk input type="date")
function isoToInputDate(isoStr) {
  if (!isoStr || !isoStr.includes("T")) return "";
  const date = new Date(isoStr);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

  fetch(url)
    .then(res => res.json())
    .then(data => {
      fullData = data;
      renderTable(fullData);
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
  const addUrl = `https://script.google.com/macros/s/AKfycbzKfFVn04fod7EJgBULdad_0Eksza7hm9wt3UeEQW7q0Uir5Mpem1dHuwJTALztEty9Sg/exec?action=addData&data=${dataStr}`;

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

  //renderTable
  function renderTable(data) {
  const headerRow = document.getElementById("tableHeader");
  const tableBody = document.getElementById("dataTable");

  headerRow.innerHTML = '';
  tableBody.innerHTML = '';

  const headers = data[0];
  const rows = data.slice(1); // tanpa header

  // Tambahkan kolom header "Aksi"
  const thAksi = document.createElement("th");
  thAksi.className = "px-2 py-1 border";
  thAksi.textContent = "Aksi";
  headerRow.appendChild(thAksi);

  // Header lain
  headers.forEach(header => {
    const th = document.createElement("th");
    th.className = "px-2 py-1 border";
    th.textContent = header;
    headerRow.appendChild(th);
  });

  // Pagination
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const rowsToDisplay = rows.slice(start, end);

  rowsToDisplay.forEach(row => {
    const tr = document.createElement("tr");

    // Kolom Aksi
    const tdAction = document.createElement("td");
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";
    btnEdit.className = "text-blue-600 underline";
    btnEdit.setAttribute("data-index", fullData.indexOf(row));
    btnEdit.onclick = function () {
      const rowIndex = parseInt(this.getAttribute("data-index")) + 1;
      bukaModalEdit(rowIndex, row);
    };
    tdAction.appendChild(btnEdit);
    tdAction.className = "px-2 py-1 border";
    tr.appendChild(tdAction);

    // Kolom data
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

  // Tampilkan info halaman
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
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
  function bukaModalEdit(rowIndex, rowData) {
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

    const updateUrl = `https://script.google.com/macros/s/AKfycbzKfFVn04fod7EJgBULdad_0Eksza7hm9wt3UeEQW7q0Uir5Mpem1dHuwJTALztEty9Sg/exec?action=updateData&row=${rowIndex}&data=${encodeURIComponent(JSON.stringify(data))}`;

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
