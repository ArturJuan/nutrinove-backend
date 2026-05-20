const calculateCaloriesGoal = (tdee, objective) => {
  const objectives = {
    emagrecimento: -400,
    manutencao: 0,
    hipertrofia: 300,
  };

  return tdee + objectives[objective];
};

export default calculateCaloriesGoal;
