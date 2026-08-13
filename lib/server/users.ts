import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "analyst" | "viewer";
  twoFactorEnabled: boolean;
  createdAt: string;
};

type DbShape = { users: StoredUser[] };

declare global {
  // eslint-disable-next-line no-var
  var __cgUsersCache: DbShape | undefined;
}

function dbPath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "cyberguard-users.json");
  }
  return path.join(process.cwd(), "data", "users.json");
}

async function readDb(): Promise<DbShape> {
  if (globalThis.__cgUsersCache) return globalThis.__cgUsersCache;
  try {
    const raw = await fs.readFile(dbPath(), "utf8");
    const parsed = JSON.parse(raw) as DbShape;
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

export async function findUserByEmail(email: string) {
  const db = await readDb();
  return db.users.find((u) => u.email === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const db = await readDb();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const db = await readDb();
  const email = input.email.toLowerCase();
  if (db.users.some((u) => u.email === email)) {
    throw new Error("EMAIL_EXISTS");
  }
  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: input.passwordHash,
    role: "analyst",
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<StoredUser, "twoFactorEnabled" | "name">>
) {
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  db.users[idx] = { ...db.users[idx], ...patch };
  await writeDb(db);
  return db.users[idx];
}
