const PROFILE_API = "http://localhost:3000/profile";

window.addEventListener("DOMContentLoaded", async () => {
  const nameEl = document.getElementById("companyName");
  const addrEl = document.getElementById("companyAddress");
  const emailEl = document.getElementById("companyEmail");
  const phoneEl = document.getElementById("companyPhone");
  const alertBox = document.getElementById("profile-alert");

  if (!nameEl || !addrEl || !emailEl || !phoneEl || !alertBox) return;

  try {
    const res = await fetch(PROFILE_API);
    const data = await res.json();
    nameEl.value = data.company_name || "";
    addrEl.value = data.company_address || "";
    emailEl.value = data.company_email || "";
    phoneEl.value = data.company_phone || "";
  } catch (e) {
    alertBox.textContent = "Gagal mengambil data profile";
    alertBox.className = "alert alert-error";
  }
});

document.getElementById("saveProfileBtn") &&
  document
    .getElementById("saveProfileBtn")
    .addEventListener("click", async () => {
      const nameEl = document.getElementById("companyName");
      const addrEl = document.getElementById("companyAddress");
      const emailEl = document.getElementById("companyEmail");
      const phoneEl = document.getElementById("companyPhone");
      const alertBox = document.getElementById("profile-alert");

      if (!nameEl || !addrEl || !emailEl || !phoneEl || !alertBox) return;

      alertBox.textContent = "";
      alertBox.className = "alert";

      try {
        const res = await fetch(PROFILE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: nameEl.value,
            company_address: addrEl.value,
            company_phone: phoneEl.value,
            company_email: emailEl.value,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          alertBox.textContent = data.message || "Data berhasil disimpan";
          alertBox.className = "alert alert-success";
        } else {
          alertBox.textContent = data.message || "Gagal menyimpan data";
          alertBox.className = "alert alert-error";
        }
      } catch (e) {
        alertBox.textContent = "Error koneksi ke server";
        alertBox.className = "alert alert-error";
      }
    });


