
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";
import { useWishlist } from "../context/wishlistcontext";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { products: adminProducts } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

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

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(product?.image || "");
  }, [id, product?.image]);

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

        {/* REVIEWS */}
        <div className="reviews">

          <h3>⭐ Customer Reviews</h3>

          <div className="review-card">
            <h4>Ali ⭐⭐⭐⭐⭐</h4>
            <p>Excellent quality. Highly recommended.</p>
          </div>

          <div className="review-card">
            <h4>Ahmed ⭐⭐⭐⭐</h4>
            <p>Delivery was fast and product quality is very good.</p>
          </div>

          <div className="review-card">
            <h4>Sara ⭐⭐⭐⭐⭐</h4>
            <p>Amazing product. Will definitely buy again.</p>
          </div>

        </div>

        {/* RELATED PRODUCTS */}
        <div className="related-products">

          <h3>🔥 Related Products</h3>

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

                    <img
                      src={item.image}
                      alt={item.name}
                    />

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
