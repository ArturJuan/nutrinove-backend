/*
    Estrutura esperada do data:
    {
        nome: 'Artur Juan',
        cpf: '00000000000',
        peso: 72.1, // em kg
        altura: 178, // em centrimetros
        idade: 22,
        sexo: 'masculino',
        objetivo: 'emagrecimento',
        "intoleranciaLactose": false,
        "intoleranciaGluten": false
    }
*/

import calculateMacronutrients from "../simple/calculateMacronutrients.js";
import calculateMetabolicCost from "../simple/calculateMetabolicCost.js";
import applyActivityFactor from "../simple/applyActivityFactor.js";
import calculateCaloriesGoal from "../simple/calculateCaloriesGoal.js";
import createMeal from "./createMeal.js";
import divideMacrosPerMeal from "../simple/divideMacrosPerMeal.js";
import validateMenuData from "../validation/validateMenuData.js";

const createMenu = async (data) => {
  validateMenuData(data);

  const basalMetabolicCost = calculateMetabolicCost(
    data.altura,
    data.peso,
    data.sexo,
    data.idade,
  );

  const tdee = applyActivityFactor(basalMetabolicCost, data.nivelAtividade);
  const calorieGoal = calculateCaloriesGoal(tdee, data.objetivo);

  const macros = calculateMacronutrients(data.peso, calorieGoal, data.objetivo);

  const { water, ...macrosWithoutWater } = macros;
  const macrosPerMeal = divideMacrosPerMeal(macrosWithoutWater);

  const breakfast = await createMeal(macrosPerMeal["breakfast"], "breakfast");
  const lunch = await createMeal(macrosPerMeal["lunch"], "lunch");
  const afternoon = await createMeal(macrosPerMeal["afternoon"], "afternoon");
  const dinner = await createMeal(macrosPerMeal["dinner"], "dinner");

  return {
    basalMetabolicCost: Math.round(basalMetabolicCost),
    tdee: Math.round(tdee),
    calorieGoal: Math.round(calorieGoal),
    macros,
    menu: {
      cafeDaManha: breakfast,
      almoco: lunch,
      cafeDaTarde: afternoon,
      jantar: dinner,
    },
  };
};

export default createMenu;
