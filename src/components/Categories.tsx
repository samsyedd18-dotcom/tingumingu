
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Category {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
}

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Unable to load categories");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCategories(
            data.filter(
              (item: Category) =>
                item.name &&
                item.name.trim().toLowerCase() !== "other"
            )
          );
        }
      } catch (error) {
        console.error("Categories Error:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return null;

  return (
    <section className="categories" id="categories">
      {categories.length > 0 && (
        <>
          <h2>Shop By Category</h2>

          <p className="category-subtitle">
            Discover our premium collections
          </p>

          <div className="category-grid">
            {categories.map((item) => (
              <div
                className="category-card"
                key={item.id || item.name}
              >
                <div className="category-placeholder">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="category-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="category-image">
                      🛍️
                    </div>
                  )}
                </div>

                <h3>{item.name}</h3>

                <p>
                  {item.description || "Explore our collection"}
                </p>

                <Link
                  to={`/category/${encodeURIComponent(item.name)}`}
                  className="category-shop-button"
                >
                  Shop Now
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Categories;
