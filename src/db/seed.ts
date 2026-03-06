import { createInterface } from "node:readline/promises";
import { hash } from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function promptPassword(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let password = "";
    const onData = (char: string) => {
      if (char === "\r" || char === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
      } else if (char === "\u0003") {
        process.stdout.write("\n");
        process.exit(1);
      } else if (char === "\u007f" || char === "\b") {
        password = password.slice(0, -1);
      } else {
        password += char;
      }
    };

    process.stdin.on("data", onData);
  });
}

async function seed() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const email = await rl.question("Email: ");
  rl.close();

  if (!email) {
    console.error("Email cannot be empty");
    process.exit(1);
  }

  const password = await promptPassword("Password: ");
  if (!password) {
    console.error("Password cannot be empty");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  const passwordHash = await hash(password, 12);

  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      name: "Admin",
      passwordHash,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { passwordHash },
    })
    .returning();

  console.log(`\nUpserted user: ${user.email} (${user.id})`);

  await client.end();
}

seed();
