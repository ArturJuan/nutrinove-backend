import express from "express";
import db from "../database/connection.js";

const helloWorldRouter = express.Router();

helloWorldRouter.get("/", (req, res) => {
  try {
    const foods = db.prepare("SELECT * FROM foods").all();

    res.json({
      success: true,
      foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default helloWorldRouter;
