window.addEventListener("DOMContentLoaded", () => {
  const dataStr = localStorage.getItem("lastInvoice");
  const infoEl = document.getElementById("invoiceInfo");
  const linkText = document.getElementById("paymentLinkText");
  const copyBtn = document.getElementById("copyLinkBtn");

  if (!infoEl || !linkText || !copyBtn) return;

  if (!dataStr) {
    infoEl.textContent = "No invoice data found.";
    return;
  }

  const data = JSON.parse(dataStr);
  infoEl.textContent = `Invoice ID: ${data.invoiceCode} | Total: ${data.totalAmount}`;

  linkText.textContent = data.paymentLink || "-";

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(data.paymentLink);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    } catch {
      alert("Cannot copy link");
    }
  });
});


