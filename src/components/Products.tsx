function Products() {

  const products = [
    {
      name: "Teddy Bear",
      price: "$15",
      image: "🧸"
    },
    {
      name: "Toy Car",
      price: "$20",
      image: "🚗"
    },
    {
      name: "Doll House",
      price: "$25",
      image: "🏠"
    },
    {
      name: "Puzzle Game",
      price: "$10",
      image: "🧩"
    }
  ]


  return (
    <section className="products">

      <h2>Featured Toys</h2>

      <div className="product-container">

        {products.map((product, index) => (

          <div className="product-card" key={index}>

            <div className="product-image">
              {product.image}
            </div>

            <h3>
              {product.name}
            </h3>

            <p>
              {product.price}
            </p>

            <button>
              Add To Cart
            </button>

          </div>

        ))}

      </div>

    </section>
  )
}

export default Products