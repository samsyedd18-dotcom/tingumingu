
import express from "express";
import cors from "cors";
import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;
const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const router = express.Router();

const COOKIE_NAME = "tingu_admin_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

const getId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const errorResponse = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

// ================= ADMIN SESSION AUTHENTICATION =================

const signSession = (payload) => {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const signature = crypto
        .createHmac("sha256", process.env.ADMIN_PASSWORD)
        .update(body)
        .digest("base64url");

    return `${body}.${signature}`;
};

const verifySession = (session) => {
    if (!session || !process.env.ADMIN_PASSWORD) return false;

    try {
        const [body, signature] = session.split(".");

        if (!body || !signature) return false;

        const expected = crypto
            .createHmac("sha256", process.env.ADMIN_PASSWORD)
            .update(body)
            .digest();

        const received = Buffer.from(signature, "base64url");

        if (
            received.length !== expected.length ||
            !crypto.timingSafeEqual(received, expected)
        ) {
            return false;
        }

        const data = JSON.parse(
            Buffer.from(body, "base64url").toString("utf8")
        );

        return (
            data.role === "admin" &&
            Number.isFinite(data.exp) &&
            data.exp > Date.now()
        );
    } catch {
        return false;
    }
};

const getCookie = (req, name) => {
    const cookies = req.headers.cookie || "";

    const cookie = cookies
        .split(";")
        .map(item => item.trim())
        .find(item => item.startsWith(`${name}=`));

    return cookie
        ? decodeURIComponent(cookie.substring(name.length + 1))
        : null;
};

const verifyAdmin = (req, res, next) => {
    const session = getCookie(req, COOKIE_NAME);

    if (!verifySession(session)) {
        return res.status(401).json({
            error: "Admin login required"
        });
    }

    next();
};

// ADMIN LOGIN
router.post("/admin/login", (req, res) => {
    const { password } = req.body || {};

    if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).json({
            error: "ADMIN_PASSWORD is not configured"
        });
    }

    if (
        typeof password !== "string" ||
        password.length === 0 ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({
            error: "Wrong password"
        });
    }

    const session = signSession({
        role: "admin",
        exp: Date.now() + SESSION_DURATION
    });

    res.cookie(COOKIE_NAME, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_DURATION
    });

    res.json({
        message: "Admin login successful"
    });
});

// ADMIN LOGOUT
router.post("/admin/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });

    res.json({
        message: "Admin logged out"
    });
});

// CHECK ADMIN SESSION
router.get("/admin/check", verifyAdmin, (req, res) => {
    res.json({ authenticated: true });
});

// PUBLIC ROUTES; ALL OTHER ROUTES REQUIRE ADMIN SESSION
router.use((req, res, next) => {
    const publicRoutes = [
        ["GET", "/"],
        ["GET", "/products"],
        ["GET", "/categories"],
        ["POST", "/orders"],
        ["POST", "/reviews"],
        ["GET", "/reviews"],
        ["GET", "/coupons"],
        ["GET", "/settings"],
    ];

    const isPublic = publicRoutes.some(
        ([method, path]) =>
            req.method === method && req.path === path
    );

    if (isPublic) return next();

    return verifyAdmin(req, res, next);
});

// ================= TEST =================

router.get("/", (req, res) => {
    res.send("Tingu Mingu Backend Running!");
});

// ================= PRODUCTS =================

router.get("/products", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM products ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (error) {
        errorResponse(res, error, "Products fetch failed");
    }
});

router.post("/products", async (req, res) => {
    const {
        name, price, image, category,
        description, currency = "PKR", stock = 0,
    } = req.body;

    if (!name || !price || !image || !category) {
        return res.status(400).json({
            error: "Required fields are missing"
        });
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({ error: "Invalid product price" });
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({ error: "Invalid stock quantity" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO products
            (name, price, image, category, description, currency, stock)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [name, price, image, category, description || "", currency, stock]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Product add failed");
    }
});

router.patch("/products/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid product ID" });
    }

    const {
        name, price, image, category,
        description, currency, stock
    } = req.body;

    if (
        price !== undefined &&
        (!Number.isFinite(Number(price)) || Number(price) <= 0)
    ) {
        return res.status(400).json({ error: "Invalid price" });
    }

    if (
        stock !== undefined &&
        (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    ) {
        return res.status(400).json({ error: "Invalid stock" });
    }

    try {
        const result = await pool.query(
            `UPDATE products SET
            name = COALESCE($1, name),
            price = COALESCE($2, price),
            image = COALESCE($3, image),
            category = COALESCE($4, category),
            description = COALESCE($5, description),
            currency = COALESCE($6, currency),
            stock = COALESCE($7, stock)
            WHERE id = $8 RETURNING *`,
            [
                name ?? null,
                price ?? null,
                image ?? null,
                category ?? null,
                description ?? null,
                currency ?? null,
                stock ?? null,
                id,
            ]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Product update failed");
    }
});

router.delete("/products/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid product ID" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING *",
            [id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        errorResponse(res, error, "Product delete failed");
    }
});

// ================= ORDERS =================

// PUBLIC CUSTOMER CHECKOUT
router.post("/orders", async (req, res) => {
    const {
        customer_name, phone, email, country, province,
        city, postal_code, address, payment_method, total,
    } = req.body;

    if (!customer_name || !phone || !address || !payment_method) {
        return res.status(400).json({
            error: "Required order fields are missing"
        });
    }

    if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
        return res.status(400).json({ error: "Invalid order total" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO orders
            (customer_name, phone, email, country, province, city,
            postal_code, address, payment_method, total)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [
                customer_name, phone, email, country, province,
                city, postal_code, address, payment_method, total,
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Order failed");
    }
});

// ADMIN: GET ORDERS
router.get("/orders", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM orders ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        errorResponse(res, error, "Orders fetch failed");
    }
});

// ADMIN: UPDATE ORDER STATUS
router.patch("/orders/:id/status", async (req, res) => {
    const id = getId(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
        "Pending", "Processing", "Shipped", "Delivered", "Cancelled",
    ];

    if (!id) {
        return res.status(400).json({ error: "Invalid order ID" });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
    }

    try {
        const result = await pool.query(
            "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Order status update failed");
    }
});

// ADMIN: DELETE ORDER
router.delete("/orders/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid order ID" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM orders WHERE id = $1 RETURNING id",
            [id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        errorResponse(res, error, "Order delete failed");
    }
});

// ================= CATEGORIES =================

router.get("/categories", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM categories ORDER BY id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        errorResponse(res, error, "Categories fetch failed");
    }
});

router.post("/categories", async (req, res) => {
    const { name, description = "", image = "" } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({
            error: "Category name is required"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO categories (name, description, image)
            VALUES ($1,$2,$3) RETURNING *`,
            [name.trim(), description, image]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Category already exists"
            });
        }

        errorResponse(res, error, "Category add failed");
    }
});

router.patch("/categories/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    const { name, description, image } = req.body;

    try {
        const result = await pool.query(
            `UPDATE categories SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            image = COALESCE($3, image)
            WHERE id = $4 RETURNING *`,
            [name ?? null, description ?? null, image ?? null, id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Category update failed");
    }
});

router.delete("/categories/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM categories WHERE id = $1 RETURNING *",
            [id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        errorResponse(res, error, "Category delete failed");
    }
});

// ================= REVIEWS =================

// PUBLIC: APPROVED REVIEWS ONLY
router.get("/reviews", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT reviews.*, products.name AS product_name
            FROM reviews
            LEFT JOIN products ON products.id = reviews.product_id
            WHERE reviews.status = 'Approved'
            ORDER BY reviews.id DESC`
        );

        res.json(result.rows);
    } catch (error) {
        errorResponse(res, error, "Reviews fetch failed");
    }
});

// PUBLIC: CUSTOMER SUBMITS REVIEW
router.post("/reviews", async (req, res) => {
    const {
        product_id, customer_name, rating, comment = ""
    } = req.body;

    if (!getId(product_id) || !customer_name?.trim()) {
        return res.status(400).json({
            error: "Invalid review details"
        });
    }

    if (
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
    ) {
        return res.status(400).json({
            error: "Rating must be between 1 and 5"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO reviews (product_id, customer_name, rating, comment)
            VALUES ($1,$2,$3,$4) RETURNING *`,
            [product_id, customer_name.trim(), rating, comment]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Review add failed");
    }
});

// ADMIN: ALL REVIEWS
router.get("/admin/reviews", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT reviews.*, products.name AS product_name
            FROM reviews
            LEFT JOIN products ON products.id = reviews.product_id
            ORDER BY reviews.id DESC`
        );

        res.json(result.rows);
    } catch (error) {
        errorResponse(res, error, "Reviews fetch failed");
    }
});

// ADMIN: UPDATE REVIEW STATUS
router.patch("/reviews/:id/status", async (req, res) => {
    const id = getId(req.params.id);
    const { status } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Invalid review ID" });
    }

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid review status" });
    }

    try {
        const result = await pool.query(
            "UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Review not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Review update failed");
    }
});

// ADMIN: DELETE REVIEW
router.delete("/reviews/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid review ID" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM reviews WHERE id = $1 RETURNING *",
            [id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Review not found" });
        }

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        errorResponse(res, error, "Review delete failed");
    }
});

// ================= COUPONS =================

// PUBLIC: ACTIVE COUPONS
router.get("/coupons", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM coupons WHERE active = true ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        errorResponse(res, error, "Coupons fetch failed");
    }
});

// ADMIN: ALL COUPONS
router.get("/admin/coupons", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM coupons ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        errorResponse(res, error, "Coupons fetch failed");
    }
});

// ADMIN: ADD COUPON
router.post("/coupons", async (req, res) => {
    const {
        code, discount_type, discount_value,
        expiry_date = null, usage_limit = null,
    } = req.body;

    if (!code?.trim() || !["percentage", "fixed"].includes(discount_type)) {
        return res.status(400).json({ error: "Invalid coupon details" });
    }

    if (
        !Number.isFinite(Number(discount_value)) ||
        Number(discount_value) <= 0
    ) {
        return res.status(400).json({ error: "Invalid discount value" });
    }

    if (discount_type === "percentage" && Number(discount_value) > 100) {
        return res.status(400).json({
            error: "Percentage cannot exceed 100"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO coupons
            (code, discount_type, discount_value, expiry_date, usage_limit)
            VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [
                code.trim().toUpperCase(),
                discount_type,
                discount_value,
                expiry_date,
                usage_limit,
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Coupon code already exists"
            });
        }

        errorResponse(res, error, "Coupon add failed");
    }
});

// ADMIN: UPDATE COUPON
router.patch("/coupons/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid coupon ID" });
    }

    const { active, discount_value, expiry_date, usage_limit } = req.body;

    try {
        const result = await pool.query(
            `UPDATE coupons SET
            active = COALESCE($1, active),
            discount_value = COALESCE($2, discount_value),
            expiry_date = COALESCE($3, expiry_date),
            usage_limit = COALESCE($4, usage_limit)
            WHERE id = $5 RETURNING *`,
            [
                active ?? null,
                discount_value ?? null,
                expiry_date ?? null,
                usage_limit ?? null,
                id
            ]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Coupon update failed");
    }
});

// ADMIN: DELETE COUPON
router.delete("/coupons/:id", async (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid coupon ID" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM coupons WHERE id = $1 RETURNING *",
            [id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        errorResponse(res, error, "Coupon delete failed");
    }
});

// ================= ANALYTICS =================

router.get("/analytics", async (req, res) => {
    try {
        const [summary, topProducts, lowStock] = await Promise.all([
            pool.query(`
                SELECT COUNT(*) AS total_orders,
                COALESCE(SUM(total), 0) AS total_revenue
                FROM orders WHERE status <> 'Cancelled'
            `),

            pool.query(`
                SELECT id, name, price, sales_count, stock
                FROM products ORDER BY sales_count DESC LIMIT 10
            `),

            pool.query(`
                SELECT id, name, stock FROM products
                WHERE stock <= 5 ORDER BY stock ASC
            `),
        ]);

        res.json({
            summary: summary.rows[0],
            topProducts: topProducts.rows,
            lowStock: lowStock.rows,
        });
    } catch (error) {
        errorResponse(res, error, "Analytics fetch failed");
    }
});

// ================= STORE SETTINGS =================

// PUBLIC: STOREFRONT SETTINGS
router.get("/settings", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT setting_key, setting_value FROM store_settings ORDER BY id"
        );

        const settings = {};

        result.rows.forEach((row) => {
            settings[row.setting_key] = row.setting_value;
        });

        res.json(settings);
    } catch (error) {
        errorResponse(res, error, "Settings fetch failed");
    }
});

// ADMIN: UPDATE SETTINGS
router.put("/settings", async (req, res) => {
    const entries = Object.entries(req.body || {});

    if (entries.length === 0) {
        return res.status(400).json({
            error: "No settings provided"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const [key, value] of entries) {
            await client.query(
                `INSERT INTO store_settings (setting_key, setting_value)
                VALUES ($1,$2)
                ON CONFLICT (setting_key)
                DO UPDATE SET setting_value = EXCLUDED.setting_value`,
                [key, String(value)]
            );
        }

        await client.query("COMMIT");

        res.json({ message: "Settings saved successfully" });
    } catch (error) {
        await client.query("ROLLBACK");
        errorResponse(res, error, "Settings save failed");
    } finally {
        client.release();
    }
});

// ================= ROUTER MOUNT =================

app.use("/api", router);
app.use("/", router);

export default app;
