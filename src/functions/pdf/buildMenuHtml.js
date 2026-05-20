const MEAL_LABEL = {
  cafeDaManha: { name: "Café da manhã", desc: "Primeira refeição" },
  almoco: { name: "Almoço", desc: "Refeição principal" },
  cafeDaTarde: { name: "Café da tarde", desc: "Lanche intermediário" },
  jantar: { name: "Jantar", desc: "Última refeição" },
};

const CATEGORY_LABEL = {
  proteina: "Proteínas",
  lacticinios: "Laticínios",
  carboidrato: "Carboidratos",
  fruta: "Frutas",
  graos: "Grãos e leguminosas",
  gordura: "Gorduras boas",
  sementes_fibras: "Sementes e fibras",
  legumes_verduras: "Legumes",
  folhas: "Folhas verdes",
};

const MACRO_LABEL = {
  protein: "proteína",
  carbohydrate: "carboidrato",
  fat: "gordura",
};

const fmtNum = (n) => {
  if (typeof n !== "number") return n;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(/\.0$/, "");
};

const escapeHtml = (str) => {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const optionsTableHtml = (opcoes) => {
  const rows = opcoes
    .map((opt) => {
      const qty = `${fmtNum(opt.quantidade)} ${opt.unidade_medida}`;
      return `
        <tr>
          <td class="food-name">${escapeHtml(opt.nome)}</td>
          <td>${escapeHtml(qty)}</td>
          <td>${opt.macros.protein.toFixed(1)}g</td>
          <td>${opt.macros.carbohydrate.toFixed(1)}g</td>
          <td>${opt.macros.fat.toFixed(1)}g</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table class="options">
      <thead>
        <tr>
          <th>Alimento</th>
          <th>Quantidade</th>
          <th>Proteína</th>
          <th>Carbo</th>
          <th>Gordura</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const categoryHtml = (cat) => {
  const label = CATEGORY_LABEL[cat.categoria] || cat.categoria;
  let hint;
  if (cat.meta_macro !== null && cat.macro_principal) {
    const macro = MACRO_LABEL[cat.macro_principal] || cat.macro_principal;
    hint = `Escolha 1 opção · meta: ~${fmtNum(cat.meta_macro)}g de ${macro}`;
  } else {
    hint = "Escolha 1 ou combine livremente · acompanha o prato";
  }

  return `
    <section class="category">
      <h3>${escapeHtml(label)}</h3>
      <p class="hint">${escapeHtml(hint)}</p>
      ${optionsTableHtml(cat.opcoes)}
    </section>
  `;
};

const mealHtml = (mealKey, meal) => {
  const label = MEAL_LABEL[mealKey];
  const meta = meal.metas;
  const categories = meal.categorias.map(categoryHtml).join("");

  return `
    <section class="meal">
      <header class="meal-header">
        <div>
          <h2>${escapeHtml(label.name)}</h2>
          <p class="meal-desc">${escapeHtml(label.desc)}</p>
        </div>
        <div class="meal-macros">
          <strong>${Math.round(meta.calories)}</strong> kcal ·
          P <strong>${fmtNum(meta.protein)}</strong>g ·
          C <strong>${fmtNum(meta.carbohydrate)}</strong>g ·
          G <strong>${fmtNum(meta.fat)}</strong>g
        </div>
      </header>
      ${categories}
    </section>
  `;
};

const coverHtml = (menuData) => {
  const { macros, basalMetabolicCost, tdee, calorieGoal, menu } = menuData;

  const mealRows = Object.entries(menu)
    .map(([key, meal]) => {
      const label = MEAL_LABEL[key];
      const m = meal.metas;
      return `
        <tr>
          <td class="meal-name">${escapeHtml(label.name)}</td>
          <td>${Math.round(m.calories)} kcal</td>
          <td>${fmtNum(m.protein)}g</td>
          <td>${fmtNum(m.carbohydrate)}g</td>
          <td>${fmtNum(m.fat)}g</td>
        </tr>
      `;
    })
    .join("");

  return `
    <section class="cover">
      <h1>Plano Alimentar Personalizado</h1>
      <p class="subtitle">Suas refeições do dia, com opções para variar a cada prato</p>

      <div class="pills">
        <div class="pill pill-dark">
          <div class="pill-value">${Math.round(macros.calories)}</div>
          <div class="pill-label">CALORIAS</div>
        </div>
        <div class="pill pill-primary">
          <div class="pill-value">${Math.round(macros.protein)}g</div>
          <div class="pill-label">PROTEÍNA</div>
        </div>
        <div class="pill pill-green">
          <div class="pill-value">${Math.round(macros.carbohydrate)}g</div>
          <div class="pill-label">CARBO</div>
        </div>
        <div class="pill pill-accent">
          <div class="pill-value">${Math.round(macros.fat)}g</div>
          <div class="pill-label">GORDURA</div>
        </div>
        <div class="pill pill-blue">
          <div class="pill-value">${Math.round(macros.water)}ml</div>
          <div class="pill-label">ÁGUA</div>
        </div>
      </div>

      <h2 class="section-title">Como usar este plano</h2>
      <p class="intro">
        Você verá quatro refeições ao longo do dia. Em cada uma há grupos de alimentos
        (proteínas, carboidratos, etc), e dentro de cada grupo, várias opções com a
        <strong>quantidade já calculada</strong> para atingir sua meta de macronutrientes.
      </p>
      <p class="intro">
        Em grupos como <strong>legumes</strong> e <strong>folhas verdes</strong>, combine
        mais de uma opção à vontade — eles têm pouquíssimas calorias e fazem parte do prato.
        Nos demais grupos, escolha <strong>uma opção por refeição</strong>.
      </p>

      <h2 class="section-title">Resumo do dia</h2>
      <table class="summary">
        <thead>
          <tr>
            <th>Refeição</th>
            <th>Calorias</th>
            <th>Proteína</th>
            <th>Carbo</th>
            <th>Gordura</th>
          </tr>
        </thead>
        <tbody>
          ${mealRows}
          <tr class="total">
            <td>TOTAL</td>
            <td>${Math.round(macros.calories)} kcal</td>
            <td>${Math.round(macros.protein)}g</td>
            <td>${Math.round(macros.carbohydrate)}g</td>
            <td>${Math.round(macros.fat)}g</td>
          </tr>
        </tbody>
      </table>

      <p class="footnote">
        Gasto basal: <strong>${Math.round(basalMetabolicCost)} kcal/dia</strong> ·
        Gasto total estimado: <strong>${Math.round(tdee)} kcal/dia</strong> ·
        Meta diária: <strong>${Math.round(calorieGoal)} kcal/dia</strong> ·
        Hidratação: <strong>${Math.round(macros.water)} ml/dia</strong>
      </p>
    </section>
  `;
};

const buildMenuHtml = (menuData) => {
  const mealOrder = ["cafeDaManha", "almoco", "cafeDaTarde", "jantar"];
  const meals = mealOrder
    .filter((key) => menuData.menu[key])
    .map((key) => mealHtml(key, menuData.menu[key]))
    .join('<div class="page-break"></div>');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Plano Alimentar</title>
      <style>${pdfStyles}</style>
    </head>
    <body>
      ${coverHtml(menuData)}
      <div class="page-break"></div>
      ${meals}
    </body>
    </html>
  `;
};

const pdfStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #2C2C2C;
    line-height: 1.5;
    font-size: 10pt;
  }

  .page-break { page-break-after: always; }

  .cover {
    padding: 1cm 0;
    text-align: center;
  }

  .cover h1 {
    font-size: 26pt;
    color: #1B4D38;
    margin-bottom: 4pt;
  }

  .subtitle {
    color: #6B6B6B;
    font-size: 11pt;
    margin-bottom: 24pt;
  }

  .pills {
    display: flex;
    gap: 8pt;
    justify-content: center;
    margin-bottom: 24pt;
  }

  .pill {
    flex: 1;
    max-width: 100pt;
    padding: 12pt 6pt;
    border-radius: 8pt;
    color: white;
    text-align: center;
  }

  .pill-dark { background: #1B4D38; }
  .pill-primary { background: #2E7D5B; }
  .pill-green { background: #5B8C5A; }
  .pill-accent { background: #C9622F; }
  .pill-blue { background: #4A90A4; }

  .pill-value {
    font-size: 16pt;
    font-weight: bold;
    margin-bottom: 2pt;
  }

  .pill-label {
    font-size: 8pt;
    letter-spacing: 0.5pt;
  }

  .section-title {
    font-size: 13pt;
    color: #1B4D38;
    margin: 16pt 0 8pt;
    text-align: left;
  }

  .intro {
    font-size: 10pt;
    color: #2C2C2C;
    margin-bottom: 6pt;
    text-align: justify;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6pt;
  }

  .summary, .options {
    border: 0.5pt solid #D6CFC2;
  }

  .summary thead th, .options thead th {
    background: #1B4D38;
    color: white;
    padding: 7pt 10pt;
    font-size: 9pt;
    font-weight: bold;
    text-align: center;
  }

  .summary thead th:first-child, .options thead th:first-child {
    text-align: left;
  }

  .summary td, .options td {
    padding: 6pt 10pt;
    text-align: center;
    font-size: 9.5pt;
    border-bottom: 0.3pt solid #D6CFC2;
  }

  .summary td:first-child, .options td:first-child {
    text-align: left;
  }

  .summary tr:nth-child(even) td, .options tr:nth-child(even) td {
    background: #F4F1EB;
  }

  .summary .total td {
    background: #F4F1EB;
    font-weight: bold;
    border-top: 1pt solid #D6CFC2;
  }

  .footnote {
    color: #6B6B6B;
    font-style: italic;
    font-size: 9pt;
    margin-top: 14pt;
    text-align: center;
  }

  .meal {
    margin-bottom: 12pt;
  }

  .meal-header {
    background: #2E7D5B;
    color: white;
    padding: 12pt 16pt;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8pt;
  }

  .meal-header h2 {
    font-size: 18pt;
    margin-bottom: 2pt;
  }

  .meal-desc {
    font-size: 9pt;
    opacity: 0.9;
  }

  .meal-macros {
    font-size: 10pt;
    text-align: right;
  }

  .category {
    page-break-inside: avoid;
    margin-bottom: 10pt;
  }

  .category h3 {
    color: #1B4D38;
    font-size: 12pt;
    margin: 10pt 0 4pt;
  }

  .hint {
    color: #6B6B6B;
    font-style: italic;
    font-size: 9pt;
    margin-bottom: 6pt;
  }

  .food-name {
    font-weight: 500;
  }
`;

export default buildMenuHtml;
