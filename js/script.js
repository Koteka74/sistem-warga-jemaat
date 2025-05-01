document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const url = 'https://script.google.com/macros/s/AKfycbxMhJV4b4ZxYG2K0O-FALGbcYxGaIiqpq1aGgc-iINAxJtoZcJLuZ_4h0iMJXHEtp5-/exec'; // Ganti ini

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `action=login&username=${username}&password=${password}`,

  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("loginMessage").classList.remove("hidden");
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("loginMessage").classList.remove("hidden");
    });
});
