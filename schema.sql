CREATE TABLE IF NOT EXISTS marcas (
  id INTEGER PRIMARY KEY,
  marca TEXT NOT NULL,
  marca_normalizada TEXT NOT NULL,
  numero TEXT,
  situacao TEXT,
  titular TEXT,
  classe TEXT,
  prioridade TEXT,
  registro TEXT,
  tipo TEXT
);

CREATE INDEX IF NOT EXISTS idx_marcas_marca_normalizada ON marcas(marca_normalizada);
CREATE INDEX IF NOT EXISTS idx_marcas_classe ON marcas(classe);
