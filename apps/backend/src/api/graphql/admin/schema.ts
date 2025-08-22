export const adminTypeDefs = `
  type Query {
    health: HealthStatus
    version: ApiVersion
    systemStats: SystemStats
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

  type SystemStats {
    totalUsers: Int!
    activeConnections: Int!
    eventBusHealth: String!
  }
`;

export const adminResolvers = {
  Query: {
    health: () => ({
      status: 'healthy',
      service: 'admin-graphql',
      timestamp: new Date().toISOString()
    }),
    version: () => ({
      version: process.env.API_VERSION || '1.0.0',
      instance: process.env.INSTANCE_ID || 'local',
      uptime: Math.floor(process.uptime())
    }),
    systemStats: () => ({
      totalUsers: 0, // DB'den gelecek
      activeConnections: 0, // Redis'ten gelecek
      eventBusHealth: 'healthy' // EventBus'tan gelecek
    })
  }
};
