const COMPANY_SEARCH_API = "http://localhost:3000/invoice/companies/search";

const renderResults = (companies) => {
  const container = document.getElementById("results");
  if (!container) return;
  container.innerHTML = "";

  if (!companies || companies.length === 0) {
    container.innerHTML = '<div class="info">No company found.</div>';
    return;
  }

  companies.forEach((c) => {
    const div = document.createElement("div");
    div.className = "field-group";
    div.innerHTML = `
      <strong>${c.name}</strong><br/>
      <span class="info">${c.address || "-"} | ${c.email}</span><br/>
      <button class="btn btn-block" data-id="${c.id}">Next</button>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (id) {
        // simpan id ke localStorage untuk di-load di form invoice
        localStorage.setItem("selectedCompanyId", id);
        window.location.href = "invoice_new.html";
      }
    });
  });
};

window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  if (!input) return;

  let timeoutId = null;
  input.addEventListener("input", () => {
    const q = input.value;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`${COMPANY_SEARCH_API}?query=${encodeURIComponent(q)}`);
        const data = await res.json();
        renderResults(data);
      } catch (e) {
        renderResults([]);
      }
    }, 300);
  });
});


