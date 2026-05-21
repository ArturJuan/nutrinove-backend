const validateMenuData = (data) => {
  const expectedData = {
    cpf: "string",
    nome: "string",
    peso: "number",
    altura: "number",
    idade: "number",
    sexo: "string",
    objetivo: "string",
    nivelAtividade: "string",
    intoleranciaLactose: "boolean",
    intoleranciaGluten: "boolean",
  };

  for (const field of Object.keys(expectedData)) {
    if (!(field in data)) {
      throw new Error(`O campo ${field} é obrigatório.`);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (!Object.keys(expectedData).includes(key)) {
      throw new Error(`O campo ${key} não é válido.`);
    }
    if (typeof value !== expectedData[key]) {
      throw new Error(
        `O tipo de ${key} não é válido. É esperado o tipo ${expectedData[key]}.`,
      );
    }
  }

  if (!["masculino", "feminino"].includes(data.sexo)) {
    throw new Error("Sexo inválido.");
  }
  if (!["hipertrofia", "emagrecimento", "manutencao"].includes(data.objetivo)) {
    throw new Error("Objetivo inválido.");
  }
  if (
    !["sedentario", "leve", "moderado", "intenso"].includes(data.nivelAtividade)
  ) {
    throw new Error("Nível de atividade inválido.");
  }
  if (data.peso <= 0) throw new Error("Peso inválido.");
  if (data.altura <= 0) throw new Error("Altura inválida.");
  if (data.idade <= 0) throw new Error("Idade inválida.");

  const cpfDigits = data.cpf.replace(/\D/g, "");
  if (cpfDigits.length !== 11) {
    throw new Error("CPF inválido. Deve conter 11 dígitos.");
  }
};

export default validateMenuData;
