const SEND_EMAIL_API = "http://localhost:3000/invoice/send-email";

window.addEventListener("DOMContentLoaded", () => {
  const dataStr = localStorage.getItem("lastInvoice");
  const infoEl = document.getElementById("paymentInfo");
  const inputEl = document.getElementById("paymentLinkInput");
  const copyBtn = document.getElementById("copyPaymentBtn");
  const sendBtn = document.getElementById("sendEmailBtn");

  if (!infoEl || !inputEl || !copyBtn || !sendBtn) return;

  if (!dataStr) {
    infoEl.textContent = "No invoice data found.";
    return;
  }

  const data = JSON.parse(dataStr);

  infoEl.textContent = `Invoice ID: ${data.invoiceCode} | Total: ${data.totalAmount}`;
  inputEl.value = data.paymentLink || "";

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(inputEl.value);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    } catch (e) {
      alert("Cannot copy link");
    }
  });

  sendBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(SEND_EMAIL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: data.invoiceId,
          toEmail: data.customerEmail,
          paymentLink: data.paymentLink,
          pdfUrl: data.pdfUrl,
        }),
      });
      const resp = await res.json();
      if (res.ok) {
        alert(resp.message || "Invoice email sent");
      } else {
        alert(resp.message || "Failed to send email");
      }
    } catch (e) {
      alert("Error sending email");
    }
  });
});

