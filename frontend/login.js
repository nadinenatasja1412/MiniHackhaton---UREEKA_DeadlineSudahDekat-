const API_BASE = "http://localhost:3000";

document.getElementById("login-btn") &&
  document
    .getElementById("login-btn")
    .addEventListener("click", async () => {
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const alertBox = document.getElementById("login-alert");

      if (!emailInput || !passwordInput || !alertBox) return;

      const email = emailInput.value;
      const password = passwordInput.value;

      alertBox.textContent = "";
      alertBox.className = "alert";

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "home.html";
        } else {
          alertBox.textContent = data.message || "Login gagal";
          alertBox.classList.add("alert-error");
        }
      } catch (e) {
        alertBox.textContent = "Error koneksi ke server";
        alertBox.classList.add("alert-error");
      }
    });



