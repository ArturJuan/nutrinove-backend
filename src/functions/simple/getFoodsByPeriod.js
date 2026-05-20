/*
period:
- breakfast
- lunch
- afternoon
- dinner
*/

import db from "../../database/connection.js";

const validPeriods = {
  breakfast: "cafe_da_manha",
  lunch: "almoco",
  afternoon: "cafe_da_tarde",
  dinner: "jantar",
};

const getFoodsByPeriod = (period) => {
  const databaseColumn = validPeriods[period];

  if (!databaseColumn) {
    throw new Error("Período inválido.");
  }

  const query = `
    SELECT *
    FROM foods
    WHERE ${databaseColumn} = 1
    ORDER BY prioridade_${databaseColumn} DESC
  `;

  return db.prepare(query).all();
};

export default getFoodsByPeriod;
