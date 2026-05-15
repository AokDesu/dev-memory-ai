import { defineConfig } from '@prisma/client';

export default defineConfig({
  adapter: 'sqlite',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    },
  },
});
