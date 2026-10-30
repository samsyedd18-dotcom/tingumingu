import { Link } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";
// import { defaultProducts } from "../data/products";

function Products() {

  const { addToCart } = useCart();
  const { products: adminProducts } = useProducts();

  const allProducts = [
    // ...defaultProducts,
    ...adminProducts
  ];

  return (

    <section className="products">

      <h2>All Products</h2>

      <div className="product-grid">

        {allProducts.map((product) => (

          <div
            className="product-card"
            key={product.id}
          >

            

            <Link
              to={`/product/${product.id}`}
              style={{
                textDecoration: "none",
                color: "inherit"
              }}
            >

              <img
                src={product.image}
                alt={product.name}
              />

              <h3>{product.name}</h3>

              <p>{product.rating || "⭐⭐⭐⭐⭐"}</p>

              <h3>
                {product.currency} {product.price}
              </h3>

            </Link>

            <button
              onClick={() => addToCart(product)}
            >
              Add To Cart
            </button>

          </div>

        ))}

      </div>

    </section>

  );

}

export default Products;