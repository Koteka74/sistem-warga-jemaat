export default async function handler(req, res) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbxMhJV4b4ZxYG2K0O-FALGbcYxGaIiqpq1aGgc-iINAxJtoZcJLuZ_4h0iMJXHEtp5-/exec";

  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { row } = req.body;

  const response = await fetch(`${scriptURL}?action=deleteData&row=${row}`);
  const text = await response.text();

  return res.status(200).send(text);
}
