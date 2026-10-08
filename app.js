const form=document.querySelector("#form"),q=document.querySelector("#q"),classe=document.querySelector("#classe"),vivas=document.querySelector("#vivas"),state=document.querySelector("#state"),results=document.querySelector("#results");
document.querySelectorAll(".example").forEach(b=>b.onclick=()=>{q.value=b.textContent;form.requestSubmit()});
form.addEventListener("submit",async e=>{
 e.preventDefault(); const term=q.value.trim(); if(term.length<2){state.textContent="Digite pelo menos 2 caracteres.";return}
 state.textContent="Pesquisando..."; results.innerHTML="";
 try{
  const u=`/api/marcas?q=${encodeURIComponent(term)}&classe=${encodeURIComponent(classe.value)}&vivas=${vivas.checked?"1":"0"}`;
  const r=await fetch(u),d=await r.json(); if(!r.ok||!d.ok) throw new Error(d.error||"Erro");
  if(d.source==="demo") results.innerHTML=`<div class="warning">${d.warning}</div>`;
  state.innerHTML=`Resultados para <strong>${escapeHtml(d.query)}</strong>`;
  if(!d.results.length){results.innerHTML+=`<div class="state">Nenhum resultado de demonstração encontrado.</div>`;return}
  results.innerHTML+=`<div class="summary">${d.total} resultado(s)</div>`+d.results.map(x=>`<article class="card"><div class="cardtop"><div class="brand">${escapeHtml(x.marca)}</div><div class="badge">${escapeHtml(x.situacao)}</div></div><div class="meta"><span>Processo <b>${escapeHtml(x.numero)}</b></span><span>Classe <b>${escapeHtml(x.classe)}</b></span><span>Titular <b>${escapeHtml(x.titular)}</b></span></div></article>`).join("");
 }catch(err){state.textContent="Não foi possível realizar a pesquisa.";results.innerHTML="<div class='state'>Tente novamente.</div>"}
});
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
