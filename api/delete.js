export default async function handler(req, res) {
  const scriptURL = "https://script.google.com/macros/s/AKfycby294uq0SODlKiwTl3qNx8A7j3ugAleXUi2rK6uBGA-PW3JkxhNa_oQQH3Qv9oTbStBgg/exec";

  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { row } = req.body;

  const response = await fetch(`${scriptURL}?action=deleteData&row=${row}`);
  const text = await response.text();

  return res.status(200).send(text);
}
