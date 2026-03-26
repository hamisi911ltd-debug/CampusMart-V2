import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "campusmart-secret-2024";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "campusmart-salt").digest("hex");
}

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function extractUser(req: any): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const token = auth.slice(7);
    const payload = verify(token, JWT_SECRET) as any;
    return payload.userId;
  } catch {
    return null;
  }
}

router.post("/register", async (req, res) => {
  try {
    const { email, phone, username, password, campus } = req.body;
    if (!email || !username || !password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existing = await db.select().from(usersTable).where(
      or(eq(usersTable.email, email), eq(usersTable.username, username))
    ).limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "Email or username already exists" });
      return;
    }

    const id = generateId();
    const [user] = await db.insert(usersTable).values({
      id,
      email,
      phone: phone || null,
      username,
      passwordHash: hashPassword(password),
      campus: campus || null,
      role: "student",
    }).returning();

    const token = generateToken(user.id);
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      res.status(400).json({ error: "Missing credentials" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(
      or(eq(usersTable.email, emailOrPhone), eq(usersTable.phone, emailOrPhone))
    ).limit(1);

    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      campus: user.campus,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
