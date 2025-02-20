import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// rotas
import alunoRoutes from "./src/routes/aluno";
import consultaRoutes from "./src/routes/consulta";
import pacienteRoutes from "./src/routes/paciente";
import professorRoutes from "./src/routes/professor";
import secretarioRouter from "./src/routes/secretario";
import relatoriorouter from "./src/routes/relatorio";
import gerenciarouter from "./src/routes/gerencia";
import userRouter from "./src/routes/user";

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
const swaggerDocument = require('./swagger-output.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
