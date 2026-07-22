import { Link } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";

import men from "../assets/images/men.jpg";
import women from "../assets/images/women.jpg";
import kids from "../assets/images/kids.jpg";
import toys from "../assets/images/toy.jpg";
import type { Product } from "../context/productcontext";
function Products() {

  const { addToCart } = useCart();
  const { products: adminProducts } = useProducts();

  const defaultProducts: Product[] = [

    {
      id: 1,
      name: "Men Collection",
      price: "50",
      currency: "USD",
      image: men,
        images:[
    men
  ],
      rating: "⭐⭐⭐⭐⭐",
      description: "Premium quality men's collection."
    },

    {
      id: 2,
      name: "Women Collection",
      price: "60",
      currency: "USD",
      image: women,
        images:[
    women
  ],
      rating: "⭐⭐⭐⭐⭐",
      description: "Elegant women's fashion."
    },

    {
      id: 3,
      name: "Kids Collection",
      price: "35",
      currency: "USD",
      image: kids,
        images:[
    kids
  ],
      rating: "⭐⭐⭐⭐",
      description: "Comfortable kids collection."
    },

    {
      id: 4,
      name: "Toy Collection",
      price: "25",
      currency: "USD",
      image: toys,
        images:[
    toys
  ],
      rating: "⭐⭐⭐⭐⭐",
      description: "Safe and fun toys."
    }

  ];

  const allProducts = [
    ...defaultProducts,
    ...adminProducts
  ];

  return (

    <section className="products">

      <h2>
        Featured Products
      </h2>

      <div className="product-grid">

        {allProducts.map((product) => (

          <div
            className="product-card"
            key={product.id}
          >

            <span className="sale">
              SALE
            </span>

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