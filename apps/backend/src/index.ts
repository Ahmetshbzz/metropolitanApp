import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({
    message: "Metropolitan App Backend API",
    version: "1.0.0",
    status: "running"
  }))
  .get("/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString()
  }))
  .group("/api/v1", (app) =>
    app
      .get("/users", () => ({ users: [] }))
      .get("/users/:id", ({ params: { id } }) => ({ user: { id } }))
      .post("/users", ({ body }) => ({ created: true, user: body }))
  )
  .listen(3000);

console.log(
  `🦊 Metropolitan Backend is running at ${app.server?.hostname}:${app.server?.port}`
);
