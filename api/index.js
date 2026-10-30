
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

// API ROUTER
const router = express.Router();

// TEST ROUTE
router.get("/", (req, res) => {
    res.send("Tingu Mingu Backend Running!");
});

// GET ALL PRODUCTS
router.get("/products", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM products ORDER BY id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Products fetch error:", error);
        res.status(500).json({ error: "Products fetch failed" });
    }
});

// ADD PRODUCT
router.post("/products", async (req, res) => {
    const { name, price, image, category, description } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO products
      (name, price, image, category, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
            [name, price, image, category, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Product add error:", error);
        res.status(500).json({ error: "Product add failed" });
    }
});

// DELETE PRODUCT
router.delete("/products/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product Deleted Successfully" });
    } catch (error) {
        console.error("Product delete error:", error);
        res.status(500).json({ error: "Product delete failed" });
    }
});

// PLACE ORDER
router.post("/orders", async (req, res) => {
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
        total
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO orders
      (customer_name, phone, email, country, province,
      city, postal_code, address, payment_method, total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
                total
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ error: "Order failed" });
    }
});

// GET ALL ORDERS
router.get("/orders", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM orders ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Orders fetch error:", error);
        res.status(500).json({ error: "Orders fetch failed" });
    }
});

// SUPPORT BOTH /api/... AND DIRECT ROUTES
app.use("/api", router);
app.use("/", router);

export default app;
