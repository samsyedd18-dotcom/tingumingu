
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";

function Products() {
  const { addToCart } = useCart();
  const { products: adminProducts } = useProducts();
  const { category } = useParams();

  const filteredProducts = category
    ? adminProducts.filter(
      (product) =>
        product.category?.toLowerCase() === category.toLowerCase()
    )
    : adminProducts;

  return (
    <section className="products" id="products">
      <h2>
        {category ? `${category} Products` : "All Products"}
      </h2>

      {filteredProducts.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <Link
                to={`/product/${product.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                />

                <h3>{product.name}</h3>

                <h3>
                  {product.currency} {product.price}
                </h3>
              </Link>

              <button onClick={() => addToCart(product)}>
                Add To Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;
