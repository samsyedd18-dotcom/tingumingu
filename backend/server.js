
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ======================
// DATABASE CONNECTION
// ======================

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "tingumingu",
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected:", result.rows[0].now);
  }
});

// ======================
// SERVER STATUS
// ======================

app.get("/", (req, res) => {
  res.json({
    message: "Tingu Mingu Toys API is running",
  });
});

// ======================
// GET ALL PRODUCTS
// ======================

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// ADD PRODUCT
// ======================

app.post("/products", async (req, res) => {
  const {
    name,
    price,
    image,
    category,
    description,
  } = req.body;

  if (!name || price === undefined || !image) {
    return res.status(400).json({
      error: "Name, price and image are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products
       (name, price, image, category, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name,
        price,
        image,
        category || null,
        description || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Add product error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// DELETE PRODUCT
// ======================

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// PLACE ORDER
// ======================

app.post("/orders", async (req, res) => {
  const {
    customer_name,
    phone,
    email,
    country,
    province,
    city,
    postal_code,
    address,
    payment_method,
    total,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO orders
       (
         customer_name,
         phone,
         email,
         country,
         province,
         city,
         postal_code,
         address,
         payment_method,
         total
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        customer_name,
        phone,
        email,
        country,
        province,
        city,
        postal_code,
        address,
        payment_method,
        total,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Place order error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// GET ALL ORDERS
// ======================

app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get orders error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// START SERVER
// ======================

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ======================
// GRACEFUL SHUTDOWN
// ======================

process.on("SIGINT", async () => {
  console.log("Closing server...");
  server.close();
  await pool.end();
  process.exit(0);
});
