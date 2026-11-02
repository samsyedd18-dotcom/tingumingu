import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";
import { useWishlist } from "../context/wishlistcontext";

const API_URL = "/api";

type Media = { type: "image" | "video"; src: string };

function Stars({ value }: { value: number }) {
  return (
    <span className="pd-stars" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "on" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { products: adminProducts } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [media, setMedia] = useState<Media | null>(null);
  const [tab, setTab] = useState<"details" | "reviews">("details");
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  // REVIEW STATES
  const [reviews, setReviews] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const allProducts = [...adminProducts];
  const product = allProducts.find((p) => p.id === Number(id));

  const mediaItems: Media[] = useMemo(() => {
    if (!product) return [];
    const images = Array.from(
      new Set([product.image, ...(product.images || [])].filter(Boolean))
    ) as string[];
    const items: Media[] = images.map((src) => ({ type: "image", src }));
    if (product.video) items.push({ type: "video", src: product.video });
    return items;
  }, [product]);

  const stock = Number(product?.stock ?? 0);
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  // FETCH APPROVED REVIEWS
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews`);
      if (!response.ok) throw new Error("Reviews load nahi ho sake.");
      const data = await response.json();
      setReviews(
        data.filter(
          (review: any) =>
            Number(review.product_id) === Number(id) &&
            review.status === "Approved"
        )
      );
    } catch (error) {
      console.error("Review Fetch Error:", error);
    }
  };

  useEffect(() => {
    setQuantity(1);
    setTab("details");
    setMedia(product?.image ? { type: "image", src: product.image } : null);
    window.scrollTo({ top: 0 });
  }, [id, product?.image]);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  if (!product) {
    return (
      <section className="pd pd-empty">
        <h2>We couldn't find this product</h2>
        <p>It may have been removed or the link is incorrect.</p>
        <Link to="/" className="pd-btn pd-btn-primary">
          Back to shop
        </Link>
      </section>
    );
  }

  const currency = product.currency || "PKR";
  const price = Number(product.price);
  const activeMedia = media || mediaItems[0];

  const handleAddToCart = () => {
    if (outOfStock) return;
    for (let i = 0; i < quantity; i++) addToCart(product);
  };

  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // SUBMIT CUSTOMER REVIEW
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMessage("");
    setReviewError("");

    if (!customerName.trim() || !reviewComment.trim()) {
      setReviewError("Please enter your name and your review.");
      return;
    }

    setReviewLoading(true);

    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: customerName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Review could not be submitted.");
      }

      setCustomerName("");
      setReviewRating(5);
      setReviewComment("");
      setReviewMessage("Thank you! Your review will appear once it is approved.");
    } catch (error: any) {
      setReviewError(error.message || "Something went wrong.");
    } finally {
      setReviewLoading(false);
    }
  };

  // RELATED: same category first, then others
  const related = [
    ...allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    ),
    ...allProducts.filter(
      (p) => p.id !== product.id && p.category !== product.category
    ),
  ].slice(0, 4);

  return (
    <section className="pd">
      <nav className="pd-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        {product.category && (
          <>
            <span>{product.category}</span>
            <span>/</span>
          </>
        )}
        <strong>{product.name}</strong>
      </nav>

      <div className="pd-main">
        {/* ---------- GALLERY ---------- */}
        <div className="pd-gallery">
          <div
            className={`pd-stage ${zoom && activeMedia?.type === "image" ? "zooming" : ""}`}
            onMouseMove={activeMedia?.type === "image" ? handleZoom : undefined}
            onMouseLeave={() => setZoom(null)}
          >
            {activeMedia?.type === "video" ? (
              <video
                key={activeMedia.src}
                src={activeMedia.src}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={activeMedia?.src}
                alt={product.name}
                style={
                  zoom
                    ? { transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            )}

            {outOfStock ? (
              <span className="pd-sticker pd-sticker-out">Sold out</span>
            ) : (
              lowStock && (
                <span className="pd-sticker">Only {stock} left</span>
              )
            )}
          </div>

          {mediaItems.length > 1 && (
            <div className="pd-thumbs">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={`pd-thumb ${activeMedia?.src === item.src ? "active" : ""}`}
                  onClick={() => setMedia(item)}
                  aria-label={
                    item.type === "video"
                      ? "Play product video"
                      : `View image ${index + 1}`
                  }
                >
                  {item.type === "video" ? (
                    <span className="pd-thumb-video">▶</span>
                  ) : (
                    <img src={item.src} alt="" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------- BUY PANEL ---------- */}
        <div className="pd-info">
          {product.category && (
            <span className="pd-chip">{product.category}</span>
          )}

          <h1>{product.name}</h1>

          <button
            type="button"
            className="pd-rating"
            onClick={() => setTab("reviews")}
          >
            {reviews.length > 0 ? (
              <>
                <Stars value={average} />
                <span>
                  {average.toFixed(1)} ({reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span>No reviews yet</span>
            )}
          </button>

          <div className="pd-price">
            <small>{currency}</small>
            <span>{price.toLocaleString()}</span>
          </div>

          <p className="pd-lead">
            {product.description || "A well-made toy picked for little hands."}
          </p>

          <div
            className={`pd-stock ${outOfStock ? "out" : lowStock ? "low" : "in"}`}
          >
            <i />
            {outOfStock
              ? "Out of stock"
              : lowStock
                ? `Hurry, only ${stock} left`
                : "In stock and ready to ship"}
          </div>

          <div className="pd-buy">
            <div className="pd-qty" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || outOfStock}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                disabled={quantity >= stock || outOfStock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="pd-btn pd-btn-primary pd-add"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              {outOfStock
                ? "Out of stock"
                : `Add to cart · ${currency} ${(price * quantity).toLocaleString()}`}
            </button>

            <button
              type="button"
              className={`pd-wish ${isWishlisted(product.id) ? "on" : ""}`}
              onClick={() => toggleWishlist(product)}
              aria-pressed={isWishlisted(product.id)}
              aria-label={
                isWishlisted(product.id)
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              {isWishlisted(product.id) ? "❤️" : "🤍"}
            </button>
          </div>

          <ul className="pd-trust">
            <li>
              <b>🚚</b>
              <div>
                <strong>Delivery in 3–5 days</strong>
                <span>Across Pakistan</span>
              </div>
            </li>
            <li>
              <b>↩️</b>
              <div>
                <strong>7-day easy returns</strong>
                <span>If it isn't right</span>
              </div>
            </li>
            <li>
              <b>🔒</b>
              <div>
                <strong>Secure payment</strong>
                <span>Your details stay safe</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="pd-tabs">
        <div className="pd-tablist" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "details"}
            className={tab === "details" ? "active" : ""}
            onClick={() => setTab("details")}
          >
            Details
          </button>
          <button
            role="tab"
            aria-selected={tab === "reviews"}
            className={tab === "reviews" ? "active" : ""}
            onClick={() => setTab("reviews")}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {tab === "details" ? (
          <div className="pd-panel">
            <h3>About this toy</h3>
            <p>
              {product.description ||
                "A well-made toy picked for little hands."}
            </p>
            <dl className="pd-facts">
              {product.category && (
                <div>
                  <dt>Category</dt>
                  <dd>{product.category}</dd>
                </div>
              )}
              <div>
                <dt>Availability</dt>
                <dd>{outOfStock ? "Out of stock" : `${stock} in stock`}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>
                  {currency} {price.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>3–5 business days</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="pd-panel pd-reviews">
            <div className="pd-reviews-top">
              <div className="pd-score">
                <strong>{reviews.length ? average.toFixed(1) : "–"}</strong>
                <Stars value={average} />
                <span>
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              <div className="pd-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(
                    (r) => Number(r.rating) === star
                  ).length;
                  const pct = reviews.length
                    ? (count / reviews.length) * 100
                    : 0;
                  return (
                    <div key={star} className="pd-bar">
                      <span>{star}★</span>
                      <div>
                        <i style={{ width: `${pct}%` }} />
                      </div>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pd-review-list">
              {reviews.length === 0 ? (
                <p className="pd-muted">
                  No reviews yet. Be the first to share how it went.
                </p>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="pd-review">
                    <div className="pd-avatar">
                      {String(review.customer_name || "?")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <header>
                        <strong>{review.customer_name}</strong>
                        <Stars value={Number(review.rating)} />
                      </header>
                      <p>{review.comment}</p>
                    </div>
                  </article>
                ))
              )}
            </div>

            <form className="pd-form" onSubmit={handleReviewSubmit}>
              <h3>Write a review</h3>

              <label htmlFor="pd-name">Your name</label>
              <input
                id="pd-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ayesha"
                maxLength={80}
                required
              />

              <label>Your rating</label>
              <div className="pd-rate">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    aria-label={`Rate ${star} stars`}
                    className={star <= reviewRating ? "on" : ""}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label htmlFor="pd-comment">Your review</label>
              <textarea
                id="pd-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did your little one think?"
                rows={4}
                maxLength={1000}
                required
              />

              {reviewError && <p className="pd-msg err">{reviewError}</p>}
              {reviewMessage && <p className="pd-msg ok">{reviewMessage}</p>}

              <button
                type="submit"
                className="pd-btn pd-btn-primary"
                disabled={reviewLoading}
              >
                {reviewLoading ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ---------- RELATED ---------- */}
      {related.length > 0 && (
        <div className="pd-related">
          <h2>You may also like</h2>
          <div className="pd-related-grid">
            {related.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="pd-rcard">
                <div className="pd-rimg">
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
                <h4>{item.name}</h4>
                <p>
                  {item.currency || "PKR"} {Number(item.price).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---------- MOBILE BUY BAR ---------- */}
      <div className="pd-bar-mobile">
        <div>
          <small>{currency}</small>
          <strong>{(price * quantity).toLocaleString()}</strong>
        </div>
        <button
          type="button"
          className="pd-btn pd-btn-primary"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </section>
  );
}

export default ProductDetails;