export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { role, username, password } = req.body;

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbw3-XllLxdu01cagX_pCQ_jGnTrCoTsMCbLoS_8l8wYKZGXiyWzEyk_TUSsMKaQvZfxWw/exec?action=loginAdmin",
      {
        method: "POST",
        body: JSON.stringify({ role, username, password }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Login Admin Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
