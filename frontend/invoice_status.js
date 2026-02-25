const STATUS_API = "http://localhost:3000/invoice/status";

window.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.querySelector("#statusTable tbody");
  if (!tbody) return;

  try {
    const res = await fetch(STATUS_API);
    const data = await res.json();

    data.forEach((row) => {
      const tr = document.createElement("tr");
      const statusClass =
        row.status === "PAID"
          ? "status-pill-paid"
          : row.status === "OVERDUE"
          ? "status-pill-danger"
          : "status-pill-warning";

      tr.innerHTML = `
        <td>${row.invoice_code}</td>
        <td>${new Date(row.created_at).toLocaleDateString()}</td>
        <td>${row.company_name}</td>
        <td>${row.company_email}</td>
        <td class="${statusClass}">${row.status}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="5">Failed to load status</td>';
    tbody.appendChild(tr);
  }
});


