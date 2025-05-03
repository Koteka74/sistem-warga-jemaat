import { google } from 'googleapis';
import { auth } from './auth'; // kredensial Google API

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end("Method not allowed");

  const { rowIndex, data } = req.body;
  if (!rowIndex || !data) return res.status(400).json({ error: "Data tidak lengkap" });

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const values = Object.values(data); // pastikan urutan sesuai header

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `DataJemaat!A${parseInt(rowIndex) + 2}`, // +2 karena header & 0-indexed
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values]
      }
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Gagal update ke Google Sheets" });
  }
}
