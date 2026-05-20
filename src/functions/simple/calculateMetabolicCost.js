const calculateMetabolicCost = (height, weight, sex, age) => {
  const sexData = {
    masculino: {
      base: 88.362,
      kgMultiplier: 13.397,
      heightMultiplier: 4.799,
      ageMultiplier: 5.677,
    },
    feminino: {
      base: 447.593,
      kgMultiplier: 9.247,
      heightMultiplier: 3.098,
      ageMultiplier: 4.33,
    },
  };

  const { base, kgMultiplier, heightMultiplier, ageMultiplier } = sexData[sex];

  return (
    base +
    kgMultiplier * weight +
    heightMultiplier * height -
    ageMultiplier * age
  );
};

export default calculateMetabolicCost;
