export function configuration() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    shopify: {
      apiKey: process.env.SHOPIFY_API_KEY || '',
      apiSecret: process.env.SHOPIFY_API_SECRET || '',
      scopes: process.env.SHOPIFY_SCOPES || 'read_products',
      hostName: process.env.SHOPIFY_HOST_NAME || 'localhost',
    },
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '',
      name: process.env.DATABASE_NAME || 'shopify_app',
      ssl: process.env.DATABASE_SSL === 'true',
    },
    encryptionSecret: process.env.ENCRYPTION_SECRET || 'default-dev-secret-change-in-prod',
    encryptionSalt: process.env.ENCRYPTION_SALT || 'shopify-app-salt',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  };
}
