const INVOICE_API = "http://localhost:3000/invoice";
const COMPANY_API = "http://localhost:3000/invoice/companies";

// Prefill jika user datang dari "Past Company"
window.addEventListener("DOMContentLoaded", async () => {
  const companyId = localStorage.getItem("selectedCompanyId");
  if (!companyId) return;

  try {
    const res = await fetch(`${COMPANY_API}/${companyId}`);
    if (!res.ok) return;
    const c = await res.json();

    const nameEl = document.getElementById("customerName");
    const addrEl = document.getElementById("customerAddress");
    const emailEl = document.getElementById("customerEmail");
    const phoneEl = document.getElementById("phone");

    if (nameEl) nameEl.value = c.name || "";
    if (addrEl) addrEl.value = c.address || "";
    if (emailEl) emailEl.value = c.email || "";
    if (phoneEl) phoneEl.value = c.phone || "";
  } catch (e) {
    // ignore error, user bisa isi manual
  }
});

document.getElementById("createInvoiceBtn") &&
  document
    .getElementById("createInvoiceBtn")
    .addEventListener("click", async () => {
      const customerName = document.getElementById("customerName").value;
      const customerAddress = document.getElementById("customerAddress").value;
      const customerEmail = document.getElementById("customerEmail").value;
      const phone = document.getElementById("phone").value;
      const rawText = document.getElementById("rawText").value;
      const discount = document.getElementById("discount").value;
      const alertBox = document.getElementById("invoice-alert");
      const companyId = localStorage.getItem("selectedCompanyId");

      if (!alertBox) return;

      alertBox.textContent = "";
      alertBox.className = "alert";

      try {
        const res = await fetch(INVOICE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawText,
            customerName,
            customerAddress,
            customerEmail,
            phone,
            discount: Number(discount || 0),
            userId: 1,
            companyId: companyId ? Number(companyId) : undefined,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.removeItem("selectedCompanyId");
          localStorage.setItem("lastInvoice", JSON.stringify(data));
          window.location.href = "invoice_done.html";
        } else {
          alertBox.textContent = data.message || "Gagal membuat invoice";
          alertBox.classList.add("alert-error");
        }
      } catch (e) {
        alertBox.textContent = "Error koneksi ke server";
        alertBox.classList.add("alert-error");
      }
    });


