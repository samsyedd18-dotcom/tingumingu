const crypto = require("node:crypto");

const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createToken(secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString("base64url");
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
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isFinite(decoded.exp) && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  const path = new URL(req.url || "/", "https://tingumingu-tau.vercel.app").pathname
    .replace(/\\/+$/, "") || "/";
  const method = (req.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(204).end();
  }

  if (path === "/api/admin/login" && method === "POST") {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const suppliedPassword = req.body && typeof req.body === "object"
      ? req.body.password
      : undefined;

    if (!configuredPassword) {
      return res.status(500).json({ error: "Admin authentication is not configured on the server." });
    }

    if (typeof suppliedPassword !== "string" || !safeEqual(suppliedPassword, configuredPassword)) {
      return res.status(401).json({ error: "Invalid admin password." });
    }

    const secret = process.env.ADMIN_TOKEN_SECRET || configuredPassword;
    return res.status(200).json({ token: createToken(secret) });
  }

  if (path === "/api/admin/check" && method === "GET") {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredPassword) {
      return res.status(500).json({ error: "Admin authentication is not configured on the server." });
    }

    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const secret = process.env.ADMIN_TOKEN_SECRET || configuredPassword;

    if (!verifyToken(token, secret)) {
      return res.status(401).json({ error: "Admin session is invalid or expired." });
    }

    return res.status(200).json({ authenticated: true });
  }

  if (path === "/api/admin/logout" && method === "POST") {
    return res.status(200).json({ message: "Logged out." });
  }

  if (path === "/api" || path === "/api/health") {
    return res.status(200).json({ message: "Tingu Mingu API is running." });
  }

  return res.status(404).json({
    error: "API route not implemented yet.",
    path,
  });
};
