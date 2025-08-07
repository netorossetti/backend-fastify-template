import { env } from "./core/env";
import { app } from "./infra/http/app";

app.listen({ port: env.PORT, host: env.HOST }).then(() => {
  console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}/docs`);
});
