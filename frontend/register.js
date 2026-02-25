const API_BASE_REG = "http://localhost:3000";

document.getElementById("register-btn") &&
  document
    .getElementById("register-btn")
    .addEventListener("click", async () => {
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const alertBox = document.getElementById("register-alert");

      if (!nameInput || !emailInput || !passwordInput || !alertBox) return;

      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;

      alertBox.textContent = "";
      alertBox.className = "alert";

      try {
        const res = await fetch(`${API_BASE_REG}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          alertBox.textContent = data.message || "Register sukses";
          alertBox.classList.add("alert-success");
          setTimeout(() => {
            window.location.href = "home.html";
          }, 1000);
        } else {
          alertBox.textContent = data.message || "Register gagal";
          alertBox.classList.add("alert-error");
        }
      } catch (e) {
        alertBox.textContent = "Error koneksi ke server";
        alertBox.classList.add("alert-error");
      }
    });


