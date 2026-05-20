import db from "../../database/connection.js";

/*
period:
- breakfast
- lunch
- afternoon
- dinner
*/

const getFoodsByPeriod = (period) => {
  return new Promise((resolve, reject) => {
    const validPeriods = {
      breakfast: "cafe_da_manha",
      lunch: "almoco",
      afternoon: "cafe_da_tarde",
      dinner: "jantar",
    };

    const databaseColumn = validPeriods[period];

    if (!databaseColumn) {
      reject(new Error("Período inválido."));
      return;
    }

    db.all(
      `
      SELECT *
      FROM foods
      WHERE ${databaseColumn} = 1
      ORDER BY prioridade_${databaseColumn} DESC
      `,
      [],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(rows);
      },
    );
  });
};

export default getFoodsByPeriod;
