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
import generateMenuPdf from "../functions/pdf/generateMenuPdf.js";
import {
  saveMenu,
  getMenuById,
  getMenusByCpf,
} from "../functions/complex/menuRepository.js";

const menuRouter = express.Router();

const sanitizeFilename = (name) =>
  String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

const sendPdfResponse = (res, pdfBuffer, nome) => {
  const filename = `plano-alimentar-${sanitizeFilename(nome)}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.end(Buffer.from(pdfBuffer));
};

menuRouter.post("/", async (req, res) => {
  try {
    const data = req.body;

    const menuResult = await createMenu(data);
    const menuId = saveMenu(data, menuResult);

    const pdfBuffer = await generateMenuPdf(menuResult);

    res.setHeader("X-Menu-Id", menuId);
    sendPdfResponse(res, pdfBuffer, data.nome);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

menuRouter.get("/:id/pdf", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const stored = getMenuById(id);
    if (!stored) {
      return res.status(404).json({ error: "Dieta não encontrada." });
    }

    const pdfBuffer = await generateMenuPdf(stored.menu);
    sendPdfResponse(res, pdfBuffer, stored.nome);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

menuRouter.get("/cpf/:cpf", (req, res) => {
  try {
    const menus = getMenusByCpf(req.params.cpf);
    res.json({ menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default menuRouter;
