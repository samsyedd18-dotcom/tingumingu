import crypto from "node:crypto";

const TOKEN_TTL_SECONDS = 12 * 60 * 60;

let pool;
async function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!pool) {
    const { Pool } = await import("pg");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createToken(secret) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token, secret) {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isFinite(data.exp) && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function sendError(res, error, message) {
  console.error(message, error);
  return res.status(500).json({ error: message });
}

export default async function handler(req, res) {
  const path = new URL(req.url || "/", "https://tingumingu-tau.vercel.app")
    .pathname.replace(/\\/+$/, "") || "/";
  const method = (req.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(204).end();
  }

  if (path === "/api/admin/login" && method === "POST") {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const suppliedPassword = req.body && typeof req.body === "object" ? req.body.password : undefined;
    if (!configuredPassword) return res.status(500).json({ error: "Admin authentication is not configured on the server." });
    if (typeof suppliedPassword !== "string" || !safeEqual(suppliedPassword, configuredPassword)) {
      return res.status(401).json({ error: "Invalid admin password." });
    }
    return res.status(200).json({ token: createToken(process.env.ADMIN_TOKEN_SECRET || configuredPassword) });
  }

  if (path === "/api/admin/check" && method === "GET") {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredPassword) return res.status(500).json({ error: "Admin authentication is not configured on the server." });
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!verifyToken(token, process.env.ADMIN_TOKEN_SECRET || configuredPassword)) {
      return res.status(401).json({ error: "Admin session is invalid or expired." });
    }
    return res.status(200).json({ authenticated: true });
  }

  if (path === "/api/admin/logout" && method === "POST") {
    return res.status(200).json({ message: "Logged out." });
  }

  if (path === "/api/reviews" && method === "POST") {
    const { product_id, customer_name, rating, comment = "" } = req.body || {};
    const id = Number(product_id);
    const stars = Number(rating);
    if (!Number.isInteger(id) || id <= 0 || typeof customer_name !== "string" || !customer_name.trim()) {
      return res.status(400).json({ error: "Invalid review details" });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    try {
      const result = await (await getPool()).query(
        `INSERT INTO reviews (product_id, customer_name, rating, comment, status)
         VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
        [id, customer_name.trim(), stars, String(comment).trim()]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      return sendError(res, error, "Review add failed");
    }
  }

  if (path === "/api" || path === "/api/health") {
    return res.status(200).json({ message: "Tingu Mingu API is running." });
  }

  return res.status(404).json({ error: "API route not implemented yet.", path });
}
