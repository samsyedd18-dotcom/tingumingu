function Categories() {

  const categories = [
    {
      name: "Toys",
      image: "🧸"
    },
    {
      name: "Cars",
      image: "🚗"
    },
    {
      name: "Dolls",
      image: "👧"
    },
    {
      name: "Educational Toys",
      image: "🧩"
    }
  ]


  return (
    <section className="categories">

      <h2>Shop By Category</h2>

      <div className="category-container">

        {categories.map((category, index) => (
          <div 
            className="category-card" 
            key={index}
          >

            <div className="category-image">
              {category.image}
            </div>

            <h3>
              {category.name}
            </h3>

            <button>
              Explore
            </button>

          </div>
        ))}

      </div>

    </section>
  )
}

export default Categories