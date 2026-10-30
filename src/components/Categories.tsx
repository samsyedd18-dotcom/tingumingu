function Categories() {
  const categories = [
    {
      title: "Men",
      description: "Latest fashion collection"
    },
    {
      title: "Women",
      description: "Trending styles & accessories"
    },
    {
      title: "Kids",
      description: "Cute & comfortable collection"
    },
    {
      title: "Toys",
      description: "Fun toys for every age"
    }
  ];

  return (
    <section className="categories">

      <h2>Shop By Category</h2>

      <p className="category-subtitle">
        Discover our premium collections
      </p>

      <div className="category-grid">

        {categories.map((item, index) => (

          <div className="category-card" key={index}>

            <div className="category-placeholder">
              Image
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <button>
              Shop Now
            </button>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Categories;