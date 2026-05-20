const activityMultipliers = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
};

const applyActivityFactor = (basalCost, activityLevel) => {
  const multiplier = activityMultipliers[activityLevel];
  if (!multiplier) {
    throw new Error(`Nível de atividade inválido: ${activityLevel}`);
  }
  return basalCost * multiplier;
};

export default applyActivityFactor;
