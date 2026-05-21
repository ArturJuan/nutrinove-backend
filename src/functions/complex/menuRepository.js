import db from "../../database/connection.js";

const sanitizeCpf = (cpf) => String(cpf).replace(/\D/g, "");

const upsertUser = (cpf, nome) => {
  const cleanCpf = sanitizeCpf(cpf);

  const existing = db
    .prepare("SELECT id FROM users WHERE cpf = ?")
    .get(cleanCpf);

  if (existing) {
    db.prepare(
      "UPDATE users SET nome = ?, updated_at = datetime('now') WHERE id = ?",
    ).run(nome, existing.id);
    return existing.id;
  }

  const result = db
    .prepare("INSERT INTO users (cpf, nome) VALUES (?, ?)")
    .run(cleanCpf, nome);

  return result.lastInsertRowid;
};

const saveMenu = (userData, menuResult) => {
  const userId = upsertUser(userData.cpf, userData.nome);

  const insertMenu = db.prepare(`
    INSERT INTO menus (
      user_id,
      peso, altura, idade, sexo, objetivo, nivel_atividade,
      intolerancia_lactose, intolerancia_gluten,
      basal_metabolic_cost, tdee, calorie_goal,
      menu_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertMenu.run(
    userId,
    userData.peso,
    userData.altura,
    userData.idade,
    userData.sexo,
    userData.objetivo,
    userData.nivelAtividade,
    userData.intoleranciaLactose ? 1 : 0,
    userData.intoleranciaGluten ? 1 : 0,
    menuResult.basalMetabolicCost,
    menuResult.tdee,
    menuResult.calorieGoal,
    JSON.stringify(menuResult),
  );

  return result.lastInsertRowid;
};

const getMenuById = (id) => {
  const row = db
    .prepare(
      `
      SELECT m.*, u.cpf, u.nome AS user_nome
      FROM menus m
      JOIN users u ON u.id = m.user_id
      WHERE m.id = ?
    `,
    )
    .get(id);

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    cpf: row.cpf,
    nome: row.user_nome,
    peso: row.peso,
    altura: row.altura,
    idade: row.idade,
    sexo: row.sexo,
    objetivo: row.objetivo,
    nivelAtividade: row.nivel_atividade,
    intoleranciaLactose: row.intolerancia_lactose === 1,
    intoleranciaGluten: row.intolerancia_gluten === 1,
    createdAt: row.created_at,
    menu: JSON.parse(row.menu_json),
  };
};

const getMenusByCpf = (cpf) => {
  const cleanCpf = sanitizeCpf(cpf);

  return db
    .prepare(
      `
      SELECT
        m.id,
        m.peso, m.altura, m.idade, m.objetivo, m.nivel_atividade,
        m.calorie_goal,
        m.created_at
      FROM menus m
      JOIN users u ON u.id = m.user_id
      WHERE u.cpf = ?
      ORDER BY m.created_at DESC
    `,
    )
    .all(cleanCpf);
};

export { saveMenu, getMenuById, getMenusByCpf, upsertUser };
