import db from "./connection.js";

const runMigrations = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,

      quantidade_base REAL NOT NULL,
      unidade_medida TEXT NOT NULL,

      calorias REAL NOT NULL,
      proteina REAL NOT NULL,
      carboidrato REAL NOT NULL,
      gordura REAL NOT NULL,

      min_porcao REAL NOT NULL DEFAULT 0,
      max_porcao REAL NOT NULL DEFAULT 9999,
      porcao_sugerida REAL NOT NULL DEFAULT 0,

      intolerancia_lactose INTEGER NOT NULL DEFAULT 0,
      intolerancia_gluten INTEGER NOT NULL DEFAULT 0,

      cafe_da_manha INTEGER NOT NULL DEFAULT 0,
      almoco INTEGER NOT NULL DEFAULT 0,
      cafe_da_tarde INTEGER NOT NULL DEFAULT 0,
      jantar INTEGER NOT NULL DEFAULT 0,

      permite_fracao INTEGER NOT NULL DEFAULT 1,

      prioridade_cafe_da_manha INTEGER NOT NULL DEFAULT 0,
      prioridade_almoco INTEGER NOT NULL DEFAULT 0,
      prioridade_cafe_da_tarde INTEGER NOT NULL DEFAULT 0,
      prioridade_jantar INTEGER NOT NULL DEFAULT 0
    )
  `);

  console.log("Migrations executed");
};

export default runMigrations;
