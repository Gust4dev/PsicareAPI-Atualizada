import "dotenv/config";
import cors from "cors";

const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");

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
app.use("/auth", authRoutes);

// Escutar servidor na porta 3000:
app.listen(port, () => {
  console.log(`App está rodando na porta ${port}`);
});
