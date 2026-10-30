const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "tingumingu",
  password: "smdbtoys@15",
  port: 5432,
});

// ======================
// DATABASE CONNECTION
// ======================

pool.query("SELECT NOW()", (err, result) => {

  if (err) {

    console.log("Database connection failed:", err);

  } else {

    console.log("Database connected:", result.rows);

  }

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

    res.status(500).json({
      error: error.message,
    });

  }

});

// ======================
// ADD PRODUCT
// ======================

app.post("/products", async (req, res) => {

  console.log("Received Product:", req.body);

  const {
    name,
    price,
    image,
    category,
    description,
  } = req.body;

  try {

    const result = await pool.query(

      `INSERT INTO products
      (name, price, image, category, description)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,

      [
        name,
        price,
        image,
        category,
        description,
      ]

    );

    res.json(result.rows[0]);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

});

// ======================
// DELETE PRODUCT
// ======================

app.delete("/products/:id", async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(
      "DELETE FROM products WHERE id=$1",
      [id]
    );

    res.json({
      message: "Product Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

});

// ======================
// PLACE ORDER
// ======================

app.post("/orders", async (req, res) => {

  console.log("Received Order:", req.body);

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

      VALUES

      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)

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

    res.json(result.rows[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

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

    res.status(500).json({
      error: error.message,
    });

  }

});

// ======================
// SERVER
// ======================

app.listen(5000, () => {

  console.log("🚀 Server running on port 5000");

});