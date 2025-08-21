import { swagger } from "@elysiajs/swagger";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { connectRedis, redis } from "./config/redis";
import { db, testConnection } from "./db/connection";
import { products } from "./db/schema";

// Initialize connections
async function initializeServices() {
  console.log('🔄 Initializing services...');

  const dbConnected = await testConnection();
  const redisConnected = await connectRedis();

  if (!dbConnected || !redisConnected) {
    console.error('❌ Failed to connect to required services');
    process.exit(1);
  }

  console.log('✅ All services initialized successfully');
}

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Metropolitan App API',
        version: '1.0.0',
        description: 'Metropolitan App Backend API Documentation'
      },
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Products', description: 'Product management endpoints' }
      ]
    }
  }))
  .get("/", () => ({
    message: "Metropolitan App Backend API",
    version: "1.0.0",
    status: "running"
  }), {
    detail: {
      tags: ['Health'],
      summary: 'API Root',
      description: 'Get API information'
    }
  })
  .get("/health", async () => {
    try {
      // Test database connection
      await db.select().from(products).limit(1);

      // Test Redis connection
      await redis.ping();

      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "connected",
          redis: "connected"
        }
      };
    } catch (error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service connection failed"
      };
    }
  })
  .group("/api/v1", (app) =>
    app
      .get("/products", async () => {
        const allProducts = await db.select().from(products);
        return { products: allProducts };
      })
      .get("/products/:id", async ({ params: { id } }) => {
        const product = await db.select().from(products).where(eq(products.id, id));
        return { product: product[0] || null };
      })
      .post("/products", async ({ body }) => {
        const newProduct = await db.insert(products).values(body).returning();
        return { created: true, product: newProduct[0] };
      })
  )
  .listen(3000);

// Initialize services and start server
initializeServices().then(() => {
  console.log(
    `🦊 Metropolitan Backend is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
