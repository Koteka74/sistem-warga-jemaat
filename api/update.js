export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { row, data } = req.body;

  if (!row || !Array.isArray(data)) {
    return res.status(400).send("Data tidak valid");
  }

  const scriptURL = "https://script.google.com/macros/s/AKfycbyuSCpnuB7AfNcxTCE2VW7ANRr6juySf0fPnuKB1b1HZxtfiqdisRdIrbn-fl0MbFcULA/exec";

  const params = new URLSearchParams();
  params.append("action", "updateData");
  params.append("row", row);
  params.append("data", JSON.stringify(data));

  try {
    const response = await fetch(`${scriptURL}?${params.toString()}`, {
      method: "GET", // ⚠️ Apps Script hanya menerima GET untuk data JSON dari frontend jika tidak pakai `doPost`
    });

    const text = await response.text();
    return res.status(200).send(text);
  } catch (err) {
    console.error("Gagal update:", err);
    return res.status(500).send("Gagal menghubungi Apps Script");
  }
}
