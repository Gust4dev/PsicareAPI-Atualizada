import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// rotas
import alunoRoutes from "./routes/aluno";
import consultaRoutes from "./routes/consulta";
import pacienteRoutes from "./routes/paciente";
import professorRoutes from "./routes/professor";
import secretarioRouter from "./routes/secretario";
import relatoriorouter from "./routes/relatorio";
import gerenciarouter from "./routes/gerencia";
import userRouter from "./routes/user";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const { DB_USER, DB_PASSWORD, DB_CLUSTER_INFO, DB_NAME } = process.env;
// uri mongodb
const dbURI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CLUSTER_INFO}/${DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Conexão com o MongoDB Atlas estabelecida com sucesso!");
  })
  .catch((error: Error) => {
    console.error("Erro ao conectar ao MongoDB Atlas:", error);
  });

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "PsicareApi",
      version: "1.0.0",
      description: "API do sistema para o curso de Psicologia da UniEvangélica",
    },
  },
  apis: ["./routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/aluno", alunoRoutes);
app.use("/consulta", consultaRoutes);
app.use("/paciente", pacienteRoutes);
app.use("/professor", professorRoutes);
app.use("/user", userRouter);
app.use("/secretario", secretarioRouter);
app.use("/relatorio", relatoriorouter);
app.use("/gerencia", gerenciarouter);

// Escutar servidor na porta especificada
app.listen(port, () => {
  console.log(`App está rodando na porta ${port}`);
});
