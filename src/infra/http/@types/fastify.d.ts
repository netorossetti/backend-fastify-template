import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    getAutorizationBearerToken(): Promise<string>;
  }
}
