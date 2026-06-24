import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: the CLI (migrate/introspect) connects using this URL only.
// Use the Supabase *direct* connection (port 5432) here — PgBouncer's
// transaction pooling mode doesn't support the DDL/advisory locks Migrate
// needs. The app's runtime PrismaClient (lib/prisma.ts) connects separately
// via a driver adapter using the *pooled* connection (port 6543).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
