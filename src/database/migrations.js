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

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cpf TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,

      peso REAL NOT NULL,
      altura REAL NOT NULL,
      idade INTEGER NOT NULL,
      sexo TEXT NOT NULL,
      objetivo TEXT NOT NULL,
      nivel_atividade TEXT NOT NULL,
      intolerancia_lactose INTEGER NOT NULL DEFAULT 0,
      intolerancia_gluten INTEGER NOT NULL DEFAULT 0,

      basal_metabolic_cost REAL NOT NULL,
      tdee REAL NOT NULL,
      calorie_goal REAL NOT NULL,

      menu_json TEXT NOT NULL,

      created_at TEXT NOT NULL DEFAULT (datetime('now')),

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id)`);
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_menus_created_at ON menus(created_at DESC)`,
  );

  console.log("Migrations executed");
};

export default runMigrations;
