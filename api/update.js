export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { row, data } = req.body;

  // Validasi input
  if (!row || !Array.isArray(data)) {
    return res.status(400).send("Data tidak valid");
  }

  const scriptURL = "https://script.google.com/macros/s/AKfycby294uq0SODlKiwTl3qNx8A7j3ugAleXUi2rK6uBGA-PW3JkxhNa_oQQH3Qv9oTbStBgg/exec";

  const params = new URLSearchParams();
  params.append("action", "updateData");
  params.append("row", row);
  params.append("data", JSON.stringify(data));

  try {
    const response = await fetch(`${scriptURL}?${params.toString()}`, {
      method: "GET", // Apps Script menerima GET dari frontend (tanpa CORS)
    });

    const text = await response.text();

    // Coba parse response dari Apps Script jika berupa JSON
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(200).send(text); // Kalau bukan JSON, tetap kirim teks
    }
  } catch (err) {
    console.error("Gagal update:", err);
    return res.status(500).send("Gagal menghubungi Apps Script");
  }
}
