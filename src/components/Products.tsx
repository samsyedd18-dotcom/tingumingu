
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";
import { useSearch } from "../context/SearchContext";
import { useEffect, useState } from "react";

interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  active: boolean;
  expiry_date?: string | null;
}

function Products() {
  const { addToCart, appliedCoupons, applyCoupon, removeCoupon } = useCart();
  const { products } = useProducts();
  const { category } = useParams();
  const { search } = useSearch();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponInputs, setCouponInputs] = useState<Record<number, string>>({});
  const [couponMessages, setCouponMessages] = useState<Record<number, string>>({});

  const API_URL = import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://tingumingu-tau.vercel.app/api";

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetch(`${API_URL}/coupons`);

        if (!response.ok) {
          throw new Error("Coupons could not be loaded");
        }

        const data = await response.json();
        setCoupons(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Coupon loading error:", error);
      }
    };

    loadCoupons();
  }, []);

  const activeCoupons = coupons.filter((coupon) => {
    if (!coupon.active) return false;

    if (coupon.expiry_date) {
      const expiry = new Date(coupon.expiry_date);

      if (
        !Number.isNaN(expiry.getTime()) &&
        expiry.getTime() < Date.now()
      ) {
        return false;
      }
    }

    return true;
  });

  const filteredProducts = products.filter((product) => {
    const matchesCategory = category
      ? product.category?.toLowerCase() === category.toLowerCase()
      : true;

    const searchTerm = search.trim().toLowerCase();

    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
      : true;

    return matchesCategory && matchesSearch;
  });

  const calculateDiscountedPrice = (
    price: number,
    coupon: Coupon
  ) => {
    const discount =
      coupon.discount_type === "percentage"
        ? (price * coupon.discount_value) / 100
        : coupon.discount_value;

    return Math.max(0, price - discount);
  };

  const handleApplyCoupon = (productId: number) => {
    const code = (couponInputs[productId] || "").trim().toUpperCase();

    if (!code) {
      setCouponMessages((prev) => ({
        ...prev,
        [productId]: "Please enter a coupon code.",
      }));
      return;
    }

    const coupon = activeCoupons.find(
      (item) => item.code.trim().toUpperCase() === code
    );

    if (!coupon) {
      removeCoupon(productId);

      setCouponMessages((prev) => ({
        ...prev,
        [productId]: "Invalid or expired coupon code.",
      }));
      return;
    }

    if (
      !Number.isFinite(Number(coupon.discount_value)) ||
      Number(coupon.discount_value) <= 0 ||
      (coupon.discount_type === "percentage" &&
        Number(coupon.discount_value) > 100)
    ) {
      setCouponMessages((prev) => ({
        ...prev,
        [productId]: "This coupon has an invalid discount.",
      }));
      return;
    }

    applyCoupon(productId, {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
    });

    setCouponMessages((prev) => ({
      ...prev,
      [productId]: "Coupon applied successfully!",
    }));
  };

  return (
    <section className="products" id="products">
      <h2>
        {search.trim()
          ? `Search Results for "${search}"`
          : category
            ? `${category} Products`
            : "All Products"}
      </h2>

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const stock = Number(product.stock ?? 0);
            const outOfStock = stock <= 0;
            const originalPrice = Number(product.price);
            const appliedCoupon = appliedCoupons[product.id];

            const discountedPrice = appliedCoupon
              ? Math.max(
                0,
                originalPrice -
                (appliedCoupon.discount_type === "percentage"
                  ? (originalPrice * appliedCoupon.discount_value) / 100
                  : appliedCoupon.discount_value)
              )
              : originalPrice;

            return (
              <div className="product-card" key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>

                  {appliedCoupon ? (
                    <div>
                      <p style={{ textDecoration: "line-through", color: "#888" }}>
                        {product.currency || "PKR"} {originalPrice.toFixed(2)}
                      </p>

                      <h3 style={{ color: "#16a34a" }}>
                        {product.currency || "PKR"} {discountedPrice.toFixed(2)}
                      </h3>
                    </div>
                  ) : (
                    <h3>
                      {product.currency || "PKR"} {product.price}
                    </h3>
                  )}
                </Link>

                <p>
                  {outOfStock ? "Out of Stock" : `Stock: ${stock}`}
                </p>

                <div className="product-coupon-input">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInputs[product.id] || ""}
                    onChange={(e) =>
                      setCouponInputs((prev) => ({
                        ...prev,
                        [product.id]: e.target.value,
                      }))
                    }
                  />

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon(product.id);
                        setCouponMessages((prev) => ({
                          ...prev,
                          [product.id]: "Coupon removed.",
                        }));
                      }}
                    >
                      Remove Coupon
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(product.id)}
                    >
                      Apply
                    </button>
                  )}

                  {couponMessages[product.id] && (
                    <p
                      className={
                        appliedCoupon
                          ? "coupon-success-message"
                          : "coupon-error-message"
                      }
                    >
                      {couponMessages[product.id]}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={outOfStock}
                >
                  {outOfStock ? "Out of Stock" : "Add To Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeCoupons.length > 0 && (
        <div className="product-coupons">
          <h2>🎟️ Available Offers & Coupons</h2>

          <div className="coupon-grid">
            {activeCoupons.map((coupon) => (
              <div className="product-coupon" key={coupon.id}>
                <h3>
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}% OFF`
                    : `PKR ${coupon.discount_value} OFF`}
                </h3>

                <p>Use this code:</p>
                <strong>{coupon.code}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Products;
