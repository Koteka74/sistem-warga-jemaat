export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { role, username, password } = req.body;

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycby9w70psh_Xp_lsCmglN6x7PTxr1-VBo-UvXLknDgmPAmlcXhPzdujO2ExXOKIRAinJSg/exec?action=loginAdmin",
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
