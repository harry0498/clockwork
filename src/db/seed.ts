import { hash } from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

async function seed() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: bun run seed <password>");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  const hashed = await hash(password, 12);
  console.log("\nPassword hash (add to ADMIN_PASSWORD_HASH in .env.local):");
  console.log(hashed);

  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";

  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      name: "Admin",
    })
    .onConflictDoNothing()
    .returning();

  if (user) {
    console.log(`\nCreated user: ${user.email} (${user.id})`);
  } else {
    console.log(`\nUser ${email} already exists`);
  }

  await client.end();
}

seed();
