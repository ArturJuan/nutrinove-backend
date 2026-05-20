/*
    Estrutura esperada do body da requisicao:
    {
        nome: 'Artur Juan',
        cpf: '00000000000',
        peso: 72.1, // em kg
        altura: 178, // em centrimetros
        idade: 22,
        sexo: 'masculino',
        objetivo: 'emagrecimento', ["hipertrofia", "emagrecimento", "manutencao"]
        nivelAtividade: 'sedentario', ["sedentario", "leve", "moderado", "intenso"]
        "intoleranciaLactose": false,
        "intoleranciaGluten": false
    }
*/

import express from "express";
import createMenu from "../functions/complex/createMenu.js";
import createMeal from "../functions/complex/createMeal.js";
import generateMenuPdf from "../functions/pdf/generateMenuPdf.js";

const menuRouter = express.Router();

const sanitizeFilename = (name) =>
  String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

menuRouter.post("/", async (req, res) => {
  try {
    const data = req.body;

    const menu = await createMenu(data);
    const pdfBuffer = await generateMenuPdf(menu);

    const filename = `plano-alimentar-${sanitizeFilename(data.nome)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

menuRouter.get("/test", async (req, res) => {
  try {
    const testData = {
      nome: "João Silva",
      peso: 75,
      altura: 178,
      idade: 28,
      sexo: "masculino",
      objetivo: "emagrecimento",
      nivelAtividade: "sedentario",
      intoleranciaLactose: false,
      intoleranciaGluten: false,
    };

    const menu = await createMenu(testData);
    const pdfBuffer = await generateMenuPdf(menu);

    const filename = `plano-alimentar-${sanitizeFilename(testData.nome)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// menuRouter.get("/create-meal", async (req, res) => {
//   try {
//     const meal = await createMeal(
//       {
//         protein: 35,
//         carbohydrate: 50,
//         fat: 12,
//         calories: 448,
//       },
//       "dinner",
//     );

//     res.json(meal);
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       error: error.message,
//     });
//   }
// });

export default menuRouter;
