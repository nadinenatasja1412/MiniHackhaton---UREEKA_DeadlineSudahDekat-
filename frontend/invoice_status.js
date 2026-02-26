const STATUS_API = "http://localhost:3000/invoice/status";
const PDF_BASE = "http://localhost:3000/public/invoices";

window.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.querySelector("#statusTable tbody");
  if (!tbody) return;

  try {
    const res = await fetch(STATUS_API);
    const data = await res.json();

    data.forEach((row) => {
      const tr = document.createElement("tr");

      const due = row.due_date ? new Date(row.due_date) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let label = row.status;
      let statusClass = "status-pill-warning";
      let bell = "";

      if (row.status === "PAID") {
        label = "PAID";
        statusClass = "status-pill-paid";
      } else if (due) {
        const dueCopy = new Date(due);
        dueCopy.setHours(0, 0, 0, 0);
        const diffDays = Math.floor(
          (dueCopy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) {
          // sudah lewat tenggat
          label = `H+${Math.abs(diffDays)}`;
          statusClass = "status-pill-danger";
          bell = "🔔";
        } else if (diffDays === 0) {
          label = "Today";
          statusClass = "status-pill-danger";
          bell = "🔔";
        } else if (diffDays <= 3) {
          label = `H-${diffDays}`;
          statusClass = "status-pill-warning";
          bell = "🔔";
        } else {
          label = `H-${diffDays}`;
          statusClass = "status-pill-warning";
        }
      }

      const pdfUrl = `${PDF_BASE}/invoice-${row.id}.pdf`;

      tr.innerHTML = `
        <td><a href="${pdfUrl}" target="_blank" title="Download Invoice">📄</a></td>
        <td>${row.invoice_code}</td>
        <td>${new Date(row.created_at).toLocaleDateString()}</td>
        <td>${row.company_name}</td>
        <td>${row.company_email}</td>
        <td class="${statusClass}">${label} ${bell}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="6">Failed to load status</td>';
    tbody.appendChild(tr);
  }
});

