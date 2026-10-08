const DEMO = [
  {marca:"NEXUS", numero:"000000000", situacao:"Registro em vigor", titular:"DADO DE DEMONSTRAÇÃO", classe:"35", prioridade:"—"},
  {marca:"NEXUS DIGITAL", numero:"000000001", situacao:"Pedido em andamento", titular:"DADO DE DEMONSTRAÇÃO", classe:"42", prioridade:"—"},
  {marca:"NEXUS TECH", numero:"000000002", situacao:"Registro em vigor", titular:"DADO DE DEMONSTRAÇÃO", classe:"42", prioridade:"—"}
];

const json = (data, status=200) => new Response(JSON.stringify(data), {
  status,
  headers: {"content-type":"application/json; charset=UTF-8","cache-control":"no-store"}
});

function normalize(q) {
  return String(q||"").trim().replace(/\s+/g," ").slice(0,100);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/marcas") {
      const q = normalize(url.searchParams.get("q"));
      const classe = String(url.searchParams.get("classe")||"").trim();
      const vivas = url.searchParams.get("vivas") === "1";

      if (q.length < 2) return json({ok:false,error:"Digite pelo menos 2 caracteres."},400);

      // TEMPORÁRIO: camada de demonstração.
      // Aqui entra a fonte real do INPI na próxima etapa.
      let results = DEMO.filter(x => x.marca.toLowerCase().includes(q.toLowerCase()));

      if (classe) results = results.filter(x => x.classe === classe);
      if (vivas) results = results.filter(x => /vigor|andamento/i.test(x.situacao));

      return json({
        ok:true,
        query:q,
        source:"demo",
        warning:"Resultados de demonstração. A fonte oficial do INPI será conectada na próxima etapa.",
        total:results.length,
        results
      });
    }

    return env.ASSETS.fetch(request);
  }
};
