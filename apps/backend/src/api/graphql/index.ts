import { yoga } from '@elysiajs/graphql-yoga';
import { Elysia } from 'elysia';
import { adminResolvers, adminTypeDefs } from './admin/schema';
import { storeResolvers, storeTypeDefs } from './store/schema';

// Store GraphQL endpoint
export const storeGraphQL = new Elysia({ prefix: '/graphql/store' })
  .use(
    yoga({
      typeDefs: storeTypeDefs,
      resolvers: storeResolvers,
    })
  );

// Admin GraphQL endpoint
export const adminGraphQL = new Elysia({ prefix: '/graphql/admin' })
  .use(
    yoga({
      typeDefs: adminTypeDefs,
      resolvers: adminResolvers,
    })
  );
