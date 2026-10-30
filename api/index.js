
import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// DATABASE CONNECTION
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Tingu Mingu Backend Running!");
});

// GET ALL PRODUCTS
app.get("/products", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM products ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Products fetch failed" });
    }
});

// ADD PRODUCT
app.post("/products", async (req, res) => {
    const { name, price, image, category, description } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO products
      (name, price, image, category, description)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
            [name, price, image, category, description]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Product add failed" });
    }
});

// DELETE PRODUCT
app.delete("/products/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM products WHERE id=$1",
            [req.params.id]
        );

        res.json({ message: "Product Deleted Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Product delete failed" });
    }
});

// PLACE ORDER
app.post("/orders", async (req, res) => {
    const {
        customer_name, phone, email, country,
        province, city, postal_code, address,
        payment_method, total
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO orders
      (customer_name, phone, email, country,
      province, city, postal_code, address,
      payment_method, total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
            [
                customer_name, phone, email, country,
                province, city, postal_code, address,
                payment_method, total
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Order failed" });
    }
});

// GET ALL ORDERS
app.get("/orders", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM orders ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Orders fetch failed" });
    }
});

export default app;
