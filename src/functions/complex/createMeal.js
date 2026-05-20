/*
Data = (
    macros = {
        protein: number,
        carbohydrate: number,
        fat: number,
        calories: number,
    },
    period = ['breakfast', 'lunch', 'afternoon', 'dinner']
*/

import mealCategoryMap from "../config/mealCategoryMap.js";
import getFoodsByPeriod from "../simple/getFoodsByPeriod.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const periodPriorityFieldMap = {
  breakfast: "prioridade_cafe_da_manha",
  lunch: "prioridade_almoco",
  afternoon: "prioridade_cafe_da_tarde",
  dinner: "prioridade_jantar",
};

const categoryMacroMap = {
  proteina: { macro: "protein", defaultShare: 1.0 },
  lacticinios: { macro: "protein", defaultShare: 0.5 },
  carboidrato: { macro: "carbohydrate", defaultShare: 1.0 },
  fruta: { macro: "carbohydrate", defaultShare: 0.6 },
  graos: { macro: "carbohydrate", defaultShare: 0.4 },
  gordura: { macro: "fat", defaultShare: 1.0 },
  sementes_fibras: { macro: "fat", defaultShare: 0.3 },
  legumes_verduras: { macro: null, defaultShare: 0 },
  folhas: { macro: null, defaultShare: 0 },
};

const fixedPortionDefaults = {
  legumes_verduras: 80,
  folhas: 30,
  sementes_fibras: 15,
  graos: 70,
};

const computeMacroShares = (requiredCategories, categoryConfig) => {
  const groupedByMacro = {};
  for (const category of requiredCategories) {
    const config = categoryConfig[category] || categoryMacroMap[category];
    if (!config?.macro) continue;
    if (!groupedByMacro[config.macro]) groupedByMacro[config.macro] = [];
    groupedByMacro[config.macro].push({
      category,
      weight: config.share ?? categoryMacroMap[category]?.defaultShare ?? 1,
    });
  }

  const shares = {};
  for (const macro of Object.keys(groupedByMacro)) {
    const totalWeight = groupedByMacro[macro].reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    for (const item of groupedByMacro[macro]) {
      shares[item.category] = totalWeight > 0 ? item.weight / totalWeight : 0;
    }
  }
  return shares;
};

const calculateQuantityForFood = (food, category, macroTargets) => {
  const macrosPerGram = {
    protein: food.proteina / food.quantidade_base,
    carbohydrate: food.carboidrato / food.quantidade_base,
    fat: food.gordura / food.quantidade_base,
  };

  const config = categoryMacroMap[category];
  let rawQuantity = 0;

  if (!config?.macro) {
    rawQuantity = food.porcao_sugerida ?? fixedPortionDefaults[category] ?? 50;
  } else {
    const target = macroTargets[category];
    const perGram = macrosPerGram[config.macro];
    if (
      !Number.isFinite(target) ||
      target <= 0 ||
      !Number.isFinite(perGram) ||
      perGram <= 0
    ) {
      rawQuantity = food.porcao_sugerida ?? fixedPortionDefaults[category] ?? 0;
    } else {
      rawQuantity = target / perGram;
    }
  }

  const minLimit = food.min_porcao ?? 20;
  const maxLimit = food.max_porcao ?? 9999;
  const suggested = food.porcao_sugerida ?? 0;

  if (rawQuantity < minLimit && suggested > 0) rawQuantity = suggested;

  let finalQuantity = clamp(rawQuantity, minLimit, maxLimit);
  const step = food.passo_arredondamento ?? 5;

  if (food.permite_fracao === 0) {
    finalQuantity = Math.round(finalQuantity);
  } else {
    finalQuantity = Math.round(finalQuantity / step) * step;
  }

  return {
    finalQuantity,
    macrosDelivered: {
      protein: macrosPerGram.protein * finalQuantity,
      carbohydrate: macrosPerGram.carbohydrate * finalQuantity,
      fat: macrosPerGram.fat * finalQuantity,
    },
  };
};

const validateMacros = (macros) => {
  if (!macros || typeof macros !== "object") {
    throw new TypeError("createMeal: 'macros' deve ser um objeto.");
  }
  const carbohydrate = macros.carbohydrate ?? macros.carbohydrates;
  const normalized = {
    protein: macros.protein,
    carbohydrate,
    fat: macros.fat,
  };
  const missing = Object.entries(normalized)
    .filter(([, value]) => !Number.isFinite(value) || value < 0)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new TypeError(
      `createMeal: macro(s) ausente(s) ou inválido(s): ${missing.join(", ")}. Esperado números >= 0.`,
    );
  }
  return normalized;
};

const MIN_MACRO_RATIO = 0.5;
const MAX_MACRO_RATIO = 2.0;

const isWithinMacroTolerance = (delivered, target) => {
  if (!Number.isFinite(target) || target <= 0) return true;
  const ratio = delivered / target;
  return ratio >= MIN_MACRO_RATIO && ratio <= MAX_MACRO_RATIO;
};

const createMeal = async (macros, period, options = {}) => {
  const { maxOptionsPerCategory = 10 } = options;
  const targets = validateMacros(macros);
  const allFoods = await getFoodsByPeriod(period);
  const requiredCategories =
    mealCategoryMap[period]?.categories || mealCategoryMap[period] || [];
  const categoryConfig = mealCategoryMap[period]?.config || {};
  const priorityField =
    periodPriorityFieldMap[period] || `prioridade_${period}`;

  const shares = computeMacroShares(requiredCategories, categoryConfig);

  const macroTargets = {};
  for (const category of requiredCategories) {
    const config = categoryMacroMap[category];
    if (!config?.macro) {
      macroTargets[category] = 0;
      continue;
    }
    macroTargets[category] = targets[config.macro] * (shares[category] ?? 0);
  }

  const result = [];

  for (const category of requiredCategories) {
    const foodsInCategory = allFoods
      .filter((f) => f.categoria === category)
      .sort((a, b) => (b[priorityField] || 0) - (a[priorityField] || 0));

    if (foodsInCategory.length === 0) continue;

    const categoryMacro = categoryMacroMap[category]?.macro ?? null;
    const targetForCategory = macroTargets[category];

    const mealOptions = [];
    for (const food of foodsInCategory) {
      const { finalQuantity, macrosDelivered } = calculateQuantityForFood(
        food,
        category,
        macroTargets,
      );
      if (finalQuantity <= 0) continue;

      if (categoryMacro) {
        const deliveredMain = macrosDelivered[categoryMacro];
        if (!isWithinMacroTolerance(deliveredMain, targetForCategory)) continue;
      }

      mealOptions.push({
        id: food.id,
        nome: food.nome,
        quantidade: finalQuantity,
        unidade_medida: food.unidade_medida,
        prioridade: food[priorityField] ?? 0,
        macros: {
          protein: Number(macrosDelivered.protein.toFixed(2)),
          carbohydrate: Number(macrosDelivered.carbohydrate.toFixed(2)),
          fat: Number(macrosDelivered.fat.toFixed(2)),
        },
      });
    }

    if (mealOptions.length === 0) continue;

    const limitedOptions =
      maxOptionsPerCategory > 0
        ? mealOptions.slice(0, maxOptionsPerCategory)
        : mealOptions;

    result.push({
      categoria: category,
      macro_principal: categoryMacro,
      meta_macro: categoryMacro ? Number(targetForCategory.toFixed(2)) : null,
      opcoes: limitedOptions,
    });
  }

  return {
    periodo: period,
    metas: {
      protein: targets.protein,
      carbohydrate: targets.carbohydrate,
      fat: targets.fat,
      calories: macros.calories,
    },
    categorias: result,
  };
};

export default createMeal;
