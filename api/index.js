// CUSTOMER REVIEW
router.post("/reviews", async (req, res) => {
    const {
        product_id,
        customer_name,
        rating,
        comment = ""
    } = req.body || {};

    if (
        !getId(product_id) ||
        typeof customer_name !== "string" ||
        !customer_name.trim()
    ) {
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
            `INSERT INTO reviews
             (product_id, customer_name, rating, comment, status)
             VALUES ($1, $2, $3, $4, 'Pending')
             RETURNING *`,
            [
                Number(product_id),
                customer_name.trim(),
                Number(rating),
                String(comment).trim()
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        errorResponse(res, error, "Review add failed");
    }
});