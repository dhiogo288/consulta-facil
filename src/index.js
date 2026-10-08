const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=UTF-8",
    "cache-control": "no-store"
  }
});

function normalize(q) {
  return String(q || "").trim().replace(/\s+/g, " ").slice(0, 100);
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function mapRow(row) {
  return {
    marca: row.marca ?? "",
    numero: row.numero ?? "",
    situacao: row.situacao ?? "",
    titular: row.titular ?? "",
    classe: row.classe ?? "",
    prioridade: row.prioridade ?? "—",
    registro: row.registro ?? "",
    tipo: row.tipo ?? ""
  };
}

async function searchD1(db, q, classe, vivas) {
  const params = [`%${escapeLike(q.toLowerCase())}%`];
  let sql = `
    SELECT marca, numero, situacao, titular, classe, prioridade, registro, tipo
    FROM marcas
    WHERE lower(marca) LIKE ? ESCAPE '\\'
  `;

  if (classe) {
    sql += " AND classe = ?";
    params.push(classe);
  }

  if (vivas) {
    sql += ` AND lower(situacao) NOT LIKE '%arquivad%'
             AND lower(situacao) NOT LIKE '%indeferid%'
             AND lower(situacao) NOT LIKE '%extint%'`;
  }

  sql += " ORDER BY marca LIMIT 100";
  const result = await db.prepare(sql).bind(...params).all();
  return (result.results || []).map(mapRow);
}

async function searchExternal(apiUrl, apiKey, q, classe, vivas) {
  const endpoint = new URL(apiUrl);
  endpoint.searchParams.set("marca", q);
  endpoint.searchParams.set("pesquisa_textual", "radical");
  endpoint.searchParams.set("pagina", "1");
  if (classe) endpoint.searchParams.set("ncl", classe);
  if (vivas) endpoint.searchParams.set("pedidos_vivos", "true");

  const headers = { "accept": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, { headers });
  if (!response.ok) throw new Error(`Fonte externa retornou HTTP ${response.status}`);

  const data = await response.json();
  const rows = Array.isArray(data?.processos) ? data.processos : [];
  return rows.map(mapRow);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/status") {
      return json({
        ok: true,
        database: Boolean(env.DB),
        external_source: Boolean(env.INPI_API_URL),
        demo_data: false
      });
    }

    if (url.pathname === "/api/marcas") {
      const q = normalize(url.searchParams.get("q"));
      const classe = String(url.searchParams.get("classe") || "").trim();
      const vivas = url.searchParams.get("vivas") === "1";

      if (q.length < 2) return json({ ok: false, error: "Digite pelo menos 2 caracteres." }, 400);

      try {
        let results;
        let source;

        if (env.INPI_API_URL) {
          results = await searchExternal(env.INPI_API_URL, env.INPI_API_KEY, q, classe, vivas);
          source = "external";
        } else if (env.DB) {
          results = await searchD1(env.DB, q, classe, vivas);
          source = "database";
        } else {
          return json({
            ok: false,
            error: "A fonte de dados ainda não foi configurada. O site está sem dados de demonstração para evitar resultados falsos."
          }, 503);
        }

        return json({
          ok: true,
          query: q,
          source,
          total: results.length,
          results
        });
      } catch (error) {
        return json({
          ok: false,
          error: "Não foi possível consultar a fonte de dados agora.",
          detail: String(error?.message || error)
        }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
