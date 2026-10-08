const form = document.querySelector("#form");
const q = document.querySelector("#q");
const classe = document.querySelector("#classe");
const vivas = document.querySelector("#vivas");
const state = document.querySelector("#state");
const results = document.querySelector("#results");

document.querySelectorAll(".example").forEach((b) => {
  b.onclick = () => {
    q.value = b.textContent;
    form.requestSubmit();
  };
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const term = q.value.trim();
  if (term.length < 2) {
    state.textContent = "Digite pelo menos 2 caracteres.";
    results.innerHTML = "";
    return;
  }

  state.textContent = "Pesquisando...";
  results.innerHTML = "";

  try {
    const u = `/api/marcas?q=${encodeURIComponent(term)}&classe=${encodeURIComponent(classe.value)}&vivas=${vivas.checked ? "1" : "0"}`;
    const r = await fetch(u);
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.error || "Erro");

    state.innerHTML = `Resultados para <strong>${escapeHtml(d.query)}</strong>`;

    if (!d.results.length) {
      results.innerHTML = `<div class="state">Nenhuma marca encontrada com esses filtros.</div>`;
      return;
    }

    results.innerHTML = `<div class="summary">${d.total} resultado(s)</div>` + d.results.map((x) => `
      <article class="card">
        <div class="cardtop">
          <div class="brand">${escapeHtml(x.marca)}</div>
          <div class="badge">${escapeHtml(x.situacao)}</div>
        </div>
        <div class="meta">
          <span>Processo <b>${escapeHtml(x.numero)}</b></span>
          <span>Classe <b>${escapeHtml(x.classe)}</b></span>
          <span>Titular <b>${escapeHtml(x.titular)}</b></span>
        </div>
      </article>
    `).join("");
  } catch (err) {
    state.textContent = "NÃ£o foi possÃ­vel realizar a pesquisa.";
    results.innerHTML = `<div class="state">${escapeHtml(err.message || "Fonte de dados indisponÃ­vel.")}</div>`;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}
