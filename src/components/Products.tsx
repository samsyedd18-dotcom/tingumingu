
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";
import { useSearch } from "../context/SearchContext";

function Products() {
  const { addToCart } = useCart();
  const { products: adminProducts } = useProducts();
  const { category } = useParams();
  const { search } = useSearch();

  const filteredProducts = adminProducts.filter((product) => {
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
          {filteredProducts.map((product) => (
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
