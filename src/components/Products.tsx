
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
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { category } = useParams();
  const { search } = useSearch();

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // LOAD ACTIVE COUPONS
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetch("/api/coupons");

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

  // FILTER ACTIVE AND VALID COUPONS
  const activeCoupons = coupons.filter((coupon) => {
    if (!coupon.active) return false;

    if (coupon.expiry_date) {
      return new Date(coupon.expiry_date).getTime() > Date.now();
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

            return (
              <div className="product-card" key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <h3>
                    {product.currency || "PKR"} {product.price}
                  </h3>
                </Link>

                <p>
                  {outOfStock ? "Out of Stock" : `Stock: ${stock}`}
                </p>

                {/* ACTIVE COUPONS */}
                {activeCoupons.length > 0 && (
                  <div className="product-coupons">
                    <p>🎟️ Available Offers</p>

                    {activeCoupons.map((coupon) => (
                      <div
                        className="product-coupon"
                        key={coupon.id}
                      >
                        <strong>
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% OFF`
                            : `${product.currency || "PKR"} ${coupon.discount_value} OFF`}
                        </strong>

                        <p>
                          Code: <strong>{coupon.code}</strong>
                        </p>
                      </div>
                    ))}
                  </div>
                )}

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
    </section>
  );
}

export default Products;
