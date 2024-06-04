import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Importe as rotas individuais
import alunoRoutes from "./routes/aluno";
import consultaRoutes from "./routes/consulta";
import pacienteRoutes from "./routes/paciente";
import professorRoutes from "./routes/professor";
import { userRouter } from "./routes/user";
import { secretarioRouter } from "./routes/secretario";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Variáveis de ambiente
const { DB_USER, DB_PASSWORD, DB_CLUSTER_INFO, JWT_SECRET } = process.env;
const server = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CLUSTER_INFO}`;

// Conexão com o BD
mongoose.connect(server).then(
  () => {
    console.log("Database connection successful!");
  },
  (e: Error) => console.error(e)
);

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

// Escutar servidor na porta especificada
app.listen(port, () => {
  console.log(`App está rodando na porta ${port}`);
});
