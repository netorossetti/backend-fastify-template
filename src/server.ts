import * as z from "zod/v4";
import { env } from "./core/env";
import { app } from "./infra/http/app";

// configure English locale (default)
z.config(z.locales.pt());

app.listen({ port: env.PORT, host: env.HOST }).then(() => {
  let message = "🚀 Servidor rodando";
  if (env.NODE_ENV === "dev")
    message += ` em http://localhost:${env.PORT}/docs`;
  console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}/docs`);
});
