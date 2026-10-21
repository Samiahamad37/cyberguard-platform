import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "analyst" | "viewer";
  twoFactorEnabled: boolean;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* Postgres (Neon) — used whenever DATABASE_URL is set. Durable.        */
/* ------------------------------------------------------------------ */

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

declare global {
  // eslint-disable-next-line no-var
  var __cgUsersTableReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __cgUsersCache: { users: StoredUser[] } | undefined;
}

function ensureTable() {
  if (!sql) return Promise.resolve();
  if (!globalThis.__cgUsersTableReady) {
    globalThis.__cgUsersTableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS cyberguard_users (
          id                 TEXT PRIMARY KEY,
          name               TEXT NOT NULL,
          email              TEXT NOT NULL UNIQUE,
          password_hash      TEXT NOT NULL,
          role               TEXT NOT NULL DEFAULT 'analyst',
          two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
          created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
    })().catch((err) => {
      globalThis.__cgUsersTableReady = undefined;
      throw err;
    });
  }
  return globalThis.__cgUsersTableReady;
}

type Row = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: StoredUser["role"];
  two_factor_enabled: boolean;
  created_at: string | Date;
};

function fromRow(r: Row | undefined): StoredUser | null {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    role: r.role,
    twoFactorEnabled: r.two_factor_enabled,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* JSON file fallback — local dev only (ephemeral on Vercel).           */
/* ------------------------------------------------------------------ */

type DbShape = { users: StoredUser[] };

function dbPath() {
  if (process.env.VERCEL) return path.join("/tmp", "cyberguard-users.json");
  return path.join(process.cwd(), "data", "users.json");
}

async function readDb(): Promise<DbShape> {
  if (globalThis.__cgUsersCache) return globalThis.__cgUsersCache;
  try {
    const parsed = JSON.parse(await fs.readFile(dbPath(), "utf8")) as DbShape;
    globalThis.__cgUsersCache = parsed;
    return parsed;
  } catch {
    const empty: DbShape = { users: [] };
    globalThis.__cgUsersCache = empty;
    return empty;
  }
}

async function writeDb(db: DbShape) {
  globalThis.__cgUsersCache = db;
  const file = dbPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export async function findUserByEmail(email: string) {
  const e = email.toLowerCase();
  if (sql) {
    await ensureTable();
    const rows = (await sql`SELECT * FROM cyberguard_users WHERE email = ${e} LIMIT 1`) as Row[];
    return fromRow(rows[0]);
  }
  const db = await readDb();
  return db.users.find((u) => u.email === e) ?? null;
}

export async function findUserById(id: string) {
  if (sql) {
    await ensureTable();
    const rows = (await sql`SELECT * FROM cyberguard_users WHERE id = ${id} LIMIT 1`) as Row[];
    return fromRow(rows[0]);
  }
  const db = await readDb();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const email = input.email.toLowerCase();
  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: input.passwordHash,
    role: "analyst",
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  };

  if (sql) {
    await ensureTable();
    try {
      await sql`
        INSERT INTO cyberguard_users (id, name, email, password_hash, role, two_factor_enabled, created_at)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.role}, ${user.twoFactorEnabled}, ${user.createdAt})`;
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === "23505") throw new Error("EMAIL_EXISTS");
      throw err;
    }
    return user;
  }

  const db = await readDb();
  if (db.users.some((u) => u.email === email)) throw new Error("EMAIL_EXISTS");
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<StoredUser, "twoFactorEnabled" | "name">>
) {
  if (sql) {
    await ensureTable();
    const rows = (await sql`
      UPDATE cyberguard_users SET
        name = COALESCE(${patch.name ?? null}, name),
        two_factor_enabled = COALESCE(${patch.twoFactorEnabled ?? null}, two_factor_enabled)
      WHERE id = ${id}
      RETURNING *`) as Row[];
    return fromRow(rows[0]);
  }
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  db.users[idx] = { ...db.users[idx], ...patch };
  await writeDb(db);
  return db.users[idx];
}
