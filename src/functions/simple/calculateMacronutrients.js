const proteinPerKgByGoal = {
  manutencao: 1.8,
  hipertrofia: 2.0,
  emagrecimento: 2.2,
};

const fatPerKg = 0.9;

const calculateMacronutrients = (weightInKg, calorieGoal, objetivo) => {
  const proteinPerKg = proteinPerKgByGoal[objetivo];
  if (!proteinPerKg) {
    throw new Error(`Objetivo inválido: ${objetivo}`);
  }

  const protein = proteinPerKg * weightInKg;
  const fat = fatPerKg * weightInKg;

  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const remainingCalories = calorieGoal - proteinCalories - fatCalories;

  if (remainingCalories < 0) {
    throw new Error(
      `Meta calórica (${calorieGoal}) muito baixa para o peso. ` +
        `Proteína e gordura mínimas já consomem ${proteinCalories + fatCalories} kcal.`,
    );
  }

  const carbohydrate = remainingCalories / 4;
  const water = 35 * weightInKg;

  return {
    protein: Math.round(protein),
    carbohydrate: Math.round(carbohydrate),
    fat: Math.round(fat),
    water: Math.round(water),
    calories: Math.round(calorieGoal),
  };
};

export default calculateMacronutrients;
