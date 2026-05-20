import express from "express";
import db from "../database/connection.js";

const helloWorldRouter = express.Router();

helloWorldRouter.get("/", (req, res) => {
  db.all("SELECT * FROM foods", [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      foods: rows,
    });
  });
});

export default helloWorldRouter;
