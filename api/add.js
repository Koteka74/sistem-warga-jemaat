export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Metode tidak diizinkan");
  }

  const scriptURL = "https://script.google.com/macros/s/AKfycbykT3JLLiUMSTvQhSQ9mlsXvLz9frUY1gmS-1FxJ1dUxkdYeqmOxqC0bYPGCEywddjywg/exec";

  const params = new URLSearchParams();
  params.append("action", "addData");
  params.append("data", req.body.data); // JSON string

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Gagal mengirim data ke Google Script");
  }
}
