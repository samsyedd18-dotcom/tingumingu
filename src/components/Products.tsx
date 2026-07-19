import men from "../assets/images/men.jpg"
import women from "../assets/images/women.jpg"
import kids from "../assets/images/kids.jpg"
import toys from "../assets/images/toys.jpg"

import { useCart } from "../context/cartcontext"


function Products() {

  const { addToCart } = useCart()


  const products = [
    {
      name: "Men Collection",
      price: "$50",
      image: men
    },
    {
      name: "Women Collection",
      price: "$50",
      image: women
    },
    {
      name: "Kids Collection",
      price: "$30",
      image: kids
    },
    {
      name: "Toys Collection",
      price: "$20",
      image: toys
    }
  ]


  return (
    <section className="products">

      <h2>Featured Collection</h2>

      <div className="product-container">

        {products.map((product, index) => (

          <div className="product-card" key={index}>

            <div className="product-image">
              <img 
                src={product.image}
                alt={product.name}
              />
            </div>

            <h3>
              {product.name}
            </h3>

            <p>
              {product.price}
            </p>

           <button
  onClick={() => {
    console.log("Clicked");
    addToCart(product);
  }}
>
  Add To Cart
</button>
          </div>

        ))}

      </div>

    </section>
  )
}

export default Products