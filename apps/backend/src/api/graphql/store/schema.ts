export const storeTypeDefs = `
  type Query {
    health: HealthStatus
    version: ApiVersion
  }

  type HealthStatus {
    status: String!
    service: String!
    timestamp: String!
  }

  type ApiVersion {
    version: String!
    instance: String!
    uptime: Int!
  }
`;

export const storeResolvers = {
  Query: {
    health: (): { status: string; service: string; timestamp: string } => ({
      status: 'healthy',
      service: 'store-graphql',
      timestamp: new Date().toISOString()
    }),
    version: (): { version: string; instance: string; uptime: number } => ({
      version: process.env.API_VERSION ?? '1.0.0',
      instance: process.env.INSTANCE_ID ?? 'local',
      uptime: Math.floor(process.uptime())
    })
  }
};
