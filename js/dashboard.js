window.onload = function () {
  const url = 'https://script.google.com/macros/s/AKfycbxg2PRFq7c6Q89xZL3EFjR73nZlQb9GAvekYUXi0cdRZdaRfv6_JK9ZLThEj4O7Wbd8EQ/exec?action=getData';
  let fullData = [];

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      fullData = data;
      renderTable(fullData);
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

    headers.forEach(header => {
      const th = document.createElement("th");
      th.className = "px-2 py-1 border";
      th.textContent = header;
      headerRow.appendChild(th);
    });

    const rowsPerPage = parseInt(document.getElementById("rowsPerPage").value);
    const rowsToDisplay = rows.slice(0, rowsPerPage);

    rowsToDisplay.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.className = "px-2 py-1 border";
        td.textContent = cell;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }

  window.bukaModal = function () {
    document.getElementById("modalTambah").classList.remove("hidden");
  };

  window.tutupModal = function () {
    document.getElementById("modalTambah").classList.add("hidden");
  };

  // Handle form tambah data (pakai GET untuk menghindari CORS)
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
    const getUrl = `https://script.google.com/macros/s/AKfycbwchcqYjRgCxKsOJZ213lIt0YE9UswGkvHkxM9NwGFEJAHaEKJNf2UNJCFYkfbOXQzv4A/exec?action=addData&data=${dataStr}`;

    fetch(getUrl)
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
};
