
import { Link } from "react-router-dom";

const subcategories = [
    {
        name: "Kitchen",
        description: "Kitchen tools and appliances",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700",
    },
    {
        name: "Electronics",
        description: "Gadgets and electronic products",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700",
    },
    {
        name: "Accessories",
        description: "Everyday accessories and essentials",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
    },
    {
        name: "Home & Living",
        description: "Make your home beautiful",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=700",
    },
    {
        name: "Beauty & Personal Care",
        description: "Beauty and personal care products",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700",
    },
    {
        name: "Sports & Outdoors",
        description: "Sports and outdoor essentials",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=700",
    },
    {
        name: "Stationery",
        description: "School and office supplies",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700",
    },
    {
        name: "Other Items",
        description: "Explore more interesting products",
        image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=700",
    },
];

function OtherCategory() {
    return (
        <section className="categories other-categories">
            <Link to="/" className="back-to-home">
                ← Back to Home
            </Link>

            <h2>Explore Other Categories</h2>

            <p className="category-subtitle">
                Discover more products for your everyday needs
            </p>

            <div className="category-grid">
                {subcategories.map((category) => (
                    <div className="category-card" key={category.name}>
                        <div className="category-placeholder other-category-image">
                            <img
                                src={category.image}
                                alt={category.name}
                                loading="lazy"
                            />
                        </div>

                        <h3>{category.name}</h3>
                        <p>{category.description}</p>

                        <Link
                            to={`/category/other/${encodeURIComponent(category.name)}`}
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

export default OtherCategory;
