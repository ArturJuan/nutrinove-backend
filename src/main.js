import express from "express";
import cors from "cors";
import helloWorldRouter from "./routes/hello-world.js";
import menuRouter from "./routes/menu.js";
import runMigrations from "./database/migrations.js";
import runSeeds from "./database/seeds.js";

const app = express();
const port = process.env.PORT || 3000;

runMigrations();
runSeeds();

app.use(cors());
app.use(express.json());
app.use("/", helloWorldRouter);
app.use("/menu", menuRouter);

app.listen(port, () => {
  console.log(`App listening in http://localhost:${port}`);
});
