
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";
import { useWishlist } from "../context/wishlistcontext";

const API_URL = "/api";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { products: adminProducts } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  // REVIEW STATES
  const [reviews, setReviews] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const allProducts = [...adminProducts];

  const product = allProducts.find(
    (p) => p.id === Number(id)
  );

  const galleryImages = product
    ? Array.from(
      new Set([product.image, ...(product.images || [])].filter(Boolean))
    )
    : [];

  const stock = Number(product?.stock ?? 0);
  const outOfStock = stock <= 0;

  // FETCH APPROVED REVIEWS
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews`);

      if (!response.ok) {
        throw new Error("Reviews load nahi ho sake.");
      }

      const data = await response.json();

      const productReviews = data.filter(
        (review: any) =>
          Number(review.product_id) === Number(id) &&
          review.status === "Approved"
      );

      setReviews(productReviews);
    } catch (error) {
      console.error("Review Fetch Error:", error);
    }
  };

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(product?.image || "");
  }, [id, product?.image]);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  if (!product) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          color: "white",
        }}
      >
        <h2>Product Not Found</h2>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (outOfStock) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  // SUBMIT CUSTOMER REVIEW
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setReviewMessage("");
    setReviewError("");

    if (!customerName.trim() || !reviewComment.trim()) {
      setReviewError("Name aur review dono enter karein.");
      return;
    }

    setReviewLoading(true);

    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: customerName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Review submit nahi ho saka.");
      }

      setCustomerName("");
      setReviewRating(5);
      setReviewComment("");

      setReviewMessage(
        "Thank you! Your review have been submitted."
      );
    } catch (error: any) {
      setReviewError(error.message || "Something went wrong.");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <section className="product-details">

      {/* PRODUCT IMAGES */}
      <div className="details-image">
        <div className="main-image">
          <img
            src={selectedImage || product.image}
            alt={product.name}
          />
        </div>

        <div className="thumbnail-images">
          {galleryImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${product.name} image ${index + 1}`}
              onClick={() => setSelectedImage(img)}
              style={{
                cursor: "pointer",
                border:
                  selectedImage === img
                    ? "2px solid #ff9800"
                    : "2px solid transparent",
              }}
            />
          ))}
        </div>

        {/* PRODUCT VIDEO */}
        {product.video && (
          <div className="product-video">
            <h3>🎬 Product Video</h3>
            <video
              src={product.video}
              controls
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                maxWidth: "600px",
                borderRadius: "12px",
              }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="details-info">
        <h1>{product.name}</h1>

        <p className="rating">
          {product.rating || "⭐⭐⭐⭐⭐"}
        </p>

        <h2>
          {product.currency || "PKR"} {product.price}
        </h2>

        <p>
          {product.description || "Premium quality product."}
        </p>

        {/* STOCK */}
        <div className="product-stock">
          {outOfStock ? (
            <p style={{ color: "red", fontWeight: "bold" }}>
              ❌ Out of Stock
            </p>
          ) : (
            <p style={{ color: "green", fontWeight: "bold" }}>
              ✅ In Stock
            </p>
          )}
        </div>

        {/* TOTAL PRICE */}
        <div className="total-price">
          <h3>
            Total: {product.currency || "PKR"}{" "}
            {(Number(product.price) * quantity).toLocaleString()}
          </h3>
        </div>

        {/* QUANTITY */}
        <div className="quantity">
          <button
            onClick={() =>
              setQuantity((previous) => Math.max(1, previous - 1))
            }
            disabled={quantity <= 1 || outOfStock}
          >
            -
          </button>

          <span>{quantity}</span>

          <button
            onClick={() =>
              setQuantity((previous) =>
                Math.min(stock, previous + 1)
              )
            }
            disabled={quantity >= stock || outOfStock}
          >
            +
          </button>
        </div>

        {/* ADD TO CART */}
        <button
          className="buy-btn"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          {outOfStock ? "Out of Stock" : "🛒 Add To Cart"}
        </button>

        {/* WISHLIST */}
        <div className="details-buttons">
          <button
            className="wishlist-detail-btn"
            onClick={() => toggleWishlist(product)}
          >
            {isWishlisted(product.id)
              ? "❤️ Wishlisted"
              : "🤍 Add to Wishlist"}
          </button>
        </div>

        {/* DELIVERY */}
        <div className="delivery-box">
          <h3>🚚 Delivery Information</h3>
          <p>📦 Estimated Delivery: 3–5 Business Days</p>
          <p>↩️ 7 Days Easy Return Policy</p>
          <p>🔒 100% Secure Payment</p>
        </div>

        {/* SPECIFICATIONS */}
        <div className="specifications">
          <h3>📋 Product Specifications</h3>
          <ul>
            <li>Premium Quality Material</li>
            <li>Original Brand Product</li>
            <li>Available in Multiple Sizes</li>
            <li>Lightweight & Comfortable</li>
            <li>High Durability</li>
            <li>Secure Packaging</li>
          </ul>
        </div>

        {/* CUSTOMER REVIEWS */}
        <div className="reviews">
          <h2>⭐ Customer Reviews</h2>

          <p>
            {reviews.length} approved review(s)
          </p>

          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="customer-review"
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "15px 0",
                  marginBottom: "10px",
                }}
              >
                <h4>{review.customer_name}</h4>

                <p style={{ color: "#f5a623", fontSize: "20px" }}>
                  {"★".repeat(Number(review.rating))}
                  {"☆".repeat(5 - Number(review.rating))}
                </p>

                <p>{review.comment}</p>
              </div>
            ))
          )}

          {/* REVIEW FORM */}
          <div className="review-form">
            <h3>Write Your Review</h3>

            <form onSubmit={handleReviewSubmit}>
              <label>Your Name</label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={80}
                required
              />

              <label>Your Rating</label>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  margin: "10px 0",
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    aria-label={`Rate ${star} stars`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "28px",
                      color: star <= reviewRating ? "#f5a623" : "#aaa",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label>Your Review</label>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write your experience about this product..."
                rows={5}
                maxLength={1000}
                required
                style={{
                  display: "block",
                  width: "100%",
                  margin: "10px 0",
                  padding: "12px",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />

              {reviewError && (
                <p style={{ color: "red" }}>
                  {reviewError}
                </p>
              )}

              {reviewMessage && (
                <p style={{ color: "green" }}>
                  {reviewMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={reviewLoading}
                className="buy-btn"
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="related-products">
          <h3>Related Products</h3>

          <div className="related-grid">
            {allProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 3)
              .map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div className="related-card">
                    <img src={item.image} alt={item.name} />
                    <h4>{item.name}</h4>
                    <p>
                      {item.currency || "PKR"} {item.price}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
