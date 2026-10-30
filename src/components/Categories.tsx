
import { Link } from "react-router-dom";

function Categories() {
  const categories = [
    {
      title: "Men",
      description: "Latest fashion collection",
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600"
    },
    {
      title: "Women",
      description: "Trending styles & accessories",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
    },
    {
      title: "Kids",
      description: "Cute & comfortable collection",
      image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600"
    },
    {
      title: "Toys",
      description: "Fun toys for every age",
      image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600"
    }
  ];

  return (
    <section className="categories" id="categories">
      <h2>Shop By Category</h2>

      <p className="category-subtitle">
        Discover our premium collections
      </p>

      <div className="category-grid">
        {categories.map((item) => (
          <div className="category-card" key={item.title}>
            <div className="category-placeholder">
              <img
                src={item.image}
                alt={item.title}
                className="category-image"
                loading="lazy"
              />
            </div>

            <h3>{item.title}</h3>
            <p>{item.description}</p>

            <Link
              to={`/category/${item.title}`}
              className="category-shop-button"
            >
              Shop Now
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
