export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi" });
  }

  const sheetURL =
    "https://script.google.com/macros/s/AKfycbyuSCpnuB7AfNcxTCE2VW7ANRr6juySf0fPnuKB1b1HZxtfiqdisRdIrbn-fl0MbFcULA/exec";

  const params = new URLSearchParams();
  params.append("action", "getAdmin"); // action ini harus cocok dengan yang di Apps Script kamu
  params.append("username", username);
  params.append("password", password);

  try {
    const response = await fetch(`${sheetURL}?${params.toString()}`);
    const data = await response.json();

    if (data.success) {
      // Login berhasil
      return res.status(200).json({ success: true, user: data.user });
    } else {
      // Gagal login
      return res.status(401).json({ success: false, message: "Username atau password salah" });
    }
  } catch (err) {
    console.error("Gagal login admin:", err);
    return res.status(500).json({ error: "Gagal menghubungi server login" });
  }
}
