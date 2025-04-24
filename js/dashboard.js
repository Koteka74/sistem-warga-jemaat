window.onload = function () {
  const url = 'https://script.google.com/macros/s/AKfycbxg2PRFq7c6Q89xZL3EFjR73nZlQb9GAvekYUXi0cdRZdaRfv6_JK9ZLThEj4O7Wbd8EQ/exec?action=getData';
  let fullData = [];

  fetch(url)
    .then(res => res.json())
    .then(data => {
      fullData = data;
      renderTable(fullData);
    });

  document.getElementById("formTambah").addEventListener("submit", function (e) {
  e.preventDefault();

  const kode = this.kode.value.trim();
  const nama = this.nama.value.trim();
  const gender = this.gender.value;

  if (!kode || !nama || !gender) {
    alert("Semua kolom wajib diisi.");
    return;
  }

  const data = [kode, nama, gender];
  const dataStr = encodeURIComponent(JSON.stringify(data));

  const addUrl = `https://script.google.com/macros/s/AKfycbxg2PRFq7c6Q89xZL3EFjR73nZlQb9GAvekYUXi0cdRZdaRfv6_JK9ZLThEj4O7Wbd8EQ/exec?action=addData&data=${dataStr}`;

  fetch(addUrl)
    .then(res => res.text())
    .then(msg => {
      console.log("Respon:", msg);  // 🧪 Debug
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

  function renderTable(data) {
    const headerRow = document.getElementById("tableHeader");
    const tableBody = document.getElementById("dataTable");

    headerRow.innerHTML = '';
    tableBody.innerHTML = '';

    const headers = data[0];
    const rows = data.slice(1);

    // Header
    headers.forEach(header => {
      const th = document.createElement("th");
      th.className = "px-2 py-1 border";
      th.textContent = header;
      headerRow.appendChild(th);
    });

    // Tambahkan kolom aksi
    const aksiTh = document.createElement("th");
    aksiTh.textContent = "Aksi";
    aksiTh.className = "px-2 py-1 border";
    headerRow.appendChild(aksiTh);

    // Isi Data
    const rowsPerPage = parseInt(document.getElementById("rowsPerPage").value);
    const rowsToDisplay = rows.slice(0, rowsPerPage);

    rowsToDisplay.forEach((row, i) => {
      const tr = document.createElement("tr");

      row.forEach(cell => {
        const td = document.createElement("td");
        td.className = "px-2 py-1 border";
        td.textContent = cell;
        tr.appendChild(td);
      });

      const aksiTd = document.createElement("td");
      aksiTd.className = "px-2 py-1 border";
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Edit";
      btnEdit.className = "bg-yellow-400 text-black px-2 py-1 rounded text-xs hover:bg-yellow-500";
      btnEdit.onclick = () => bukaModalEdit(i + 2, row); // +2 karena header + 1-indexed
      aksiTd.appendChild(btnEdit);
      tr.appendChild(aksiTd);

      tableBody.appendChild(tr);
    });
  }

  window.bukaModal = function () {
    document.getElementById("modalTambah").classList.remove("hidden");
  };

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
    headers.forEach((header, i) => {
      const label = document.createElement("label");
      label.className = "text-sm font-medium";
      label.textContent = header;

      const input = document.createElement("input");
      input.className = "w-full border px-3 py-2 rounded";
      input.name = `field_${i}`;
      input.value = rowData[i] || "";

      const wrapper = document.createElement("div");
      wrapper.appendChild(label);
      wrapper.appendChild(input);

      fieldsDiv.appendChild(wrapper);
    });

    document.getElementById("modalEdit").classList.remove("hidden");
  };

  window.tutupModalEdit = function () {
    document.getElementById("modalEdit").classList.add("hidden");
  };

  document.getElementById("formEdit").addEventListener("submit", function (e) {
    e.preventDefault();
    const rowIndex = this.rowIndex.value;
    const inputs = this.querySelectorAll("input[name^='field_']");
    const data = Array.from(inputs).map(input => input.value.trim());

    const updateUrl = `https://script.google.com/macros/s/AKfycbxg2PRFq7c6Q89xZL3EFjR73nZlQb9GAvekYUXi0cdRZdaRfv6_JK9ZLThEj4O7Wbd8EQ/exec?action=updateData&row=${rowIndex}&data=${encodeURIComponent(JSON.stringify(data))}`;

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
