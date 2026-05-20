/*
Data = {
    protein: number,
    carbohydrate: number,
    fat: number,
    calories: number,
  }

========================================
type Macronutrients = {
  protein: number;
  carbohydrate: number;
  fat: number;
  calories: number;
};

type MealType =
  | 'breakfast'
  | 'lunch'
  | 'afternoon'
  | 'dinner';

type MacrosPerMeal = Record<MealType, Macronutrients>;

Retorno = {
  breakfast: {
    protein: number,
    carbohydrate: number,
    fat: number,
    calories: number,
  },

  lunch: {
    protein: number,
    carbohydrate: number,
    fat: number,
    calories: number,
  },

  afternoon: {
    protein: number,
    carbohydrate: number,
    fat: number,
    calories: number,
  },

  dinner: {
    protein: number,
    carbohydrate: number,
    fat: number,
    calories: number,
  },
}

=========================================
*/

const mealDistribution = {
  breakfast: 0.15,
  lunch: 0.35,
  afternoon: 0.15,
  dinner: 0.35,
};

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

const divideMacrosPerMeal = (macros) => {
  const result = {};
  for (const [meal, share] of Object.entries(mealDistribution)) {
    result[meal] = {
      protein: roundToOneDecimal(macros.protein * share),
      carbohydrate: roundToOneDecimal(macros.carbohydrate * share),
      fat: roundToOneDecimal(macros.fat * share),
      calories: Math.round(macros.calories * share),
    };
  }
  return result;
};

export default divideMacrosPerMeal;
