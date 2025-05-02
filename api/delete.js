export default async function handler(req, res) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbyuSCpnuB7AfNcxTCE2VW7ANRr6juySf0fPnuKB1b1HZxtfiqdisRdIrbn-fl0MbFcULA/exec";

  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { row } = req.body;

  const response = await fetch(`${scriptURL}?action=deleteData&row=${row}`);
  const text = await response.text();

  return res.status(200).send(text);
}
