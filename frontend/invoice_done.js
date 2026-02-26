const DUE_API = "http://localhost:3000/invoice/due-date";

window.addEventListener("DOMContentLoaded", () => {
  const dataStr = localStorage.getItem("lastInvoice");
  const infoEl = document.getElementById("invoiceInfo");
  const pdfFileNameEl = document.getElementById("pdfFileName");
  const openPdfBtn = document.getElementById("openPdfBtn");
  const pdfViewer = document.getElementById("pdfViewer");
  const dueInput = document.getElementById("dueDateInput");
  const remakeBtn = document.getElementById("remakeBtn");
  const createPaymentBtn = document.getElementById("createPaymentBtn");

  if (
    !infoEl ||
    !pdfFileNameEl ||
    !openPdfBtn ||
    !pdfViewer ||
    !dueInput ||
    !remakeBtn ||
    !createPaymentBtn
  )
    return;

  if (!dataStr) {
    infoEl.textContent = "No invoice data found.";
    return;
  }

  const data = JSON.parse(dataStr);
  infoEl.textContent = `Invoice ID: ${data.invoiceCode} | Total: ${data.totalAmount}`;

  const pdfUrl = data.pdfUrl || "";
  const fileName = pdfUrl ? pdfUrl.split("/").pop() : `invoice-${data.invoiceCode}.pdf`;
  pdfFileNameEl.textContent = fileName;

  if (pdfUrl) {
    pdfViewer.src = pdfUrl;
  }

  const suggested = data.suggestedDueDate || "";
  if (suggested && typeof suggested === "string") {
    dueInput.value = suggested;
  }

  openPdfBtn.addEventListener("click", () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  });

  remakeBtn.addEventListener("click", () => {
    // kembali ke form dengan data terakhir
    window.location.href = "invoice_new.html";
  });

  createPaymentBtn.addEventListener("click", async () => {
    const dueDate = dueInput.value;
    if (!dueDate) {
      alert("Mohon isi due date terlebih dahulu.");
      return;
    }

    try {
      await fetch(DUE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: data.invoiceId, dueDate }),
      });
      const updated = { ...data, dueDate };
      localStorage.setItem("lastInvoice", JSON.stringify(updated));
      localStorage.setItem("lastInvoiceDueDate", dueDate);
      window.location.href = "payment_link.html";
    } catch (e) {
      alert("Gagal menyimpan due date");
    }
  });
});

