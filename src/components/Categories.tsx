
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Category {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
}

const defaultCategories: Category[] = [
  {
    id: "default-toys",
    name: "Toys",
    description: "Explore our amazing toy collection",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600",
  },
  {
    id: "default-kids",
    name: "Kids",
    description: "Discover products for kids",
    image:
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600",
  },
  {
    id: "default-men",
    name: "Men",
    description: "Explore our men's collection",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
  },
  {
    id: "default-women",
    name: "Women",
    description: "Discover our women's collection",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
  },
  {
    id: "default-other",
    name: "Other",
    description: "Kitchen, Electronics, Accessories and more",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600",
  },
];

function Categories() {
  const [categories, setCategories] =
    useState<Category[]>(defaultCategories);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Unable to load categories");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const mergedCategories = [...defaultCategories];

          data.forEach((item: Category) => {
            if (!item.name) return;

            const existingIndex = mergedCategories.findIndex(
              (category) =>
                category.name.toLowerCase() ===
                item.name.toLowerCase()
            );

            if (existingIndex !== -1) {
              mergedCategories[existingIndex] = {
                ...mergedCategories[existingIndex],
                ...item,
                image:
                  item.image ||
                  mergedCategories[existingIndex].image,
              };
            } else {
              mergedCategories.push(item);
            }
          });

          setCategories(mergedCategories);
        }
      } catch (error) {
        console.error("Categories Error:", error);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="categories" id="categories">
      <h2>Shop By Category</h2>

      <p className="category-subtitle">
        Discover our premium collections
      </p>

      {loading && <p>Loading categories...</p>}

      <div className="category-grid">
        {categories.map((item) => {
          const isOther =
            item.name.toLowerCase() === "other";

          const categoryLink = isOther
            ? "/category/other"
            : "/category/" + encodeURIComponent(item.name);

          return (
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
                {item.description ||
                  "Explore our collection"}
              </p>

              <Link
                to={categoryLink}
                className="category-shop-button"
              >
                Shop Now
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;
