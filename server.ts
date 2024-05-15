import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

// Importe as rotas individuais
import * as alunoRoutes from "./routes/aluno";
import * as consultaRoutes from "./routes/consulta";
import * as pacienteRoutes from "./routes/paciente";
import * as professorRoutes from "./routes/professor";
import * as userRoutes from "./routes/user";
import * as secretarioRoutes from "./routes/secretario";

const app = express();
const port = 8080;

// Variáveis da documentação
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API-Psicologia-FTT",
      version: "1.0.0",
      description: "API do sistema para o curso de Psicologia da UniEvangélica",
    },
  },
  apis: ["server.ts", "./routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors());

// Valores de acesso em .env:
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const clusterInfo = process.env.DB_CLUSTER_INFO;
const server = `mongodb+srv://gustavosantos:admin123@db-psicare.qd3tyih.mongodb.net/`;

// Conexão com o BD:
mongoose.connect(server).then(
  () => {
    console.log("Database connection successfull!");
  },
  (e: Error) => console.error(e)
);

// Rotas:
app.use(express.json());
app.use("/aluno", alunoRoutes.router);
app.use("/consulta", consultaRoutes.router);
app.use("/paciente", pacienteRoutes.router);
app.use("/professor", professorRoutes.router);
app.use("/user", userRoutes.router);
app.use("/secretario", secretarioRoutes.router);

// Escutar servidor na porta 3000:
app.listen(port, () => {
  console.log(`App está rodando na porta ${port}`);
});
