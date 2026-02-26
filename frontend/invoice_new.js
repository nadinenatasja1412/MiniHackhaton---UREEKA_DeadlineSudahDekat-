const INVOICE_API = "http://localhost:3000/invoice";
const COMPANY_API = "http://localhost:3000/invoice/companies";

// Prefill dari lastInvoiceInput dan/atau \"Past Company\"
window.addEventListener("DOMContentLoaded", async () => {
  const nameEl = document.getElementById("customerName");
  const addrEl = document.getElementById("customerAddress");
  const emailEl = document.getElementById("customerEmail");
  const phoneEl = document.getElementById("phone");
  const rawTextEl = document.getElementById("rawText");
  const discountEl = document.getElementById("discount");

  // Prefill dari input terakhir (Remake)
  const lastInputStr = localStorage.getItem("lastInvoiceInput");
  if (
    lastInputStr &&
    nameEl &&
    addrEl &&
    emailEl &&
    phoneEl &&
    rawTextEl &&
    discountEl
  ) {
    try {
      const last = JSON.parse(lastInputStr);
      nameEl.value = last.customerName || "";
      addrEl.value = last.customerAddress || "";
      emailEl.value = last.customerEmail || "";
      phoneEl.value = last.phone || "";
      rawTextEl.value = last.rawText || "";
      discountEl.value = String(last.discount ?? 0);
    } catch {
      // ignore parse error
    }
  }

  // Jika datang dari Past Company, override dengan data company terpilih
  const companyId = localStorage.getItem("selectedCompanyId");
  if (!companyId) return;

  try {
    const res = await fetch(`${COMPANY_API}/${companyId}`);
    if (!res.ok) return;
    const c = await res.json();

    if (nameEl) nameEl.value = c.name || "";
    if (addrEl) addrEl.value = c.address || "";
    if (emailEl) emailEl.value = c.email || "";
    if (phoneEl) phoneEl.value = c.phone || "";
  } catch (e) {
    // ignore error
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
        const lastInput = {
          customerName,
          customerAddress,
          customerEmail,
          phone,
          rawText,
          discount: Number(discount || 0),
          companyId: companyId ? Number(companyId) : undefined,
        };

        const res = await fetch(INVOICE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...lastInput,
            userId: 1,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.removeItem("selectedCompanyId");
          localStorage.setItem("lastInvoiceInput", JSON.stringify(lastInput));
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


