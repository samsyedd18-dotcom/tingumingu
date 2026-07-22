import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/cartcontext";
import { useProducts } from "../context/productcontext";
import { useWishlist } from "../context/wishlistcontext";

import men from "../assets/images/men.jpg";
import women from "../assets/images/women.jpg";
import kids from "../assets/images/kids.jpg";
import toys from "../assets/images/toy.jpg";

function ProductDetails() {

    const { id } = useParams();

    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { products: adminProducts } = useProducts();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    

    const defaultProducts = [

        {
            id: 1,
            name: "Men Collection",
            price: "50",
            currency: "PKR",
            image: men,
            rating: "⭐⭐⭐⭐⭐",
            description: "Premium quality products with modern style."
        },
        {
            id: 2,
            name: "Women Collection",
            price: "60",
            currency: "PKR",
            image: women,
            rating: "⭐⭐⭐⭐⭐",
            description: "Elegant fashion for every occasion."
        },
        {
            id: 3,
            name: "Kids Collection",
            price: "35",
            currency: "PKR",
            image: kids,
            rating: "⭐⭐⭐⭐",
            description: "Comfortable and colorful kids collection."
        },
        {
            id: 4,
            name: "Toy Collection",
            price: "25",
            currency: "PKR",
            image: toys,
            rating: "⭐⭐⭐⭐⭐",
            description: "Safe and fun toys for children."
        }
    ];

    const allProducts = [...defaultProducts, ...adminProducts];

   const product = allProducts.find(
    (p) => p.id === Number(id)
);

if (!product) {
    return <h2>Product Not Found</h2>;
}


useEffect(() => {

    if(product.images && product.images.length > 0){
        setSelectedImage(product.images[0]);
    }else{
        setSelectedImage(product.image);
    }

}, [product]);

    return (

        <section className="product-details">

           <div className="details-image">

    <div className="main-image">

        <img
            src={selectedImage || product.image}
            alt={product.name}
        />

    </div>


    <div className="thumbnail-images">

{
    product.images?.map((img, index) => (

        <img
            key={index}
            src={img}
            alt="thumbnail"
            onClick={() => setSelectedImage(img)}
        />

    ))
}

</div>

</div>

            <div className="details-info">

                <h1>{product.name}</h1>

                <p className="rating">
                    {product.rating || "⭐⭐⭐⭐⭐"}
                </p>

                <h2>
                    {product.currency} {product.price}
                </h2>

                <p>
                    {product.description || "Premium quality product."}
                </p>

              <div className="total-price">

    <h3>
        Total:
        {" "}
        {product.currency}{" "}
        {Number(product.price) * quantity}
    </h3>

</div>


<div className="quantity">

    <button
        onClick={() =>
            quantity > 1 &&
            setQuantity(quantity - 1)
        }
    >
        -
    </button>

    <span>{quantity}</span>

    <button
        onClick={() =>
            setQuantity(quantity + 1)
        }
    >
        +
    </button>

</div>


<button
    className="buy-btn"
    onClick={() => addToCart(product)}
>
    🛒 Add To Cart
</button>
                <div className="details-buttons">

                    <button
                        className="wishlist-detail-btn"
                        onClick={() => toggleWishlist(product)}
                    >
                        {isWishlisted(product.id)
                            ? "❤️ Wishlisted"
                            : "🤍 Add to Wishlist"}
                    </button>

                </div>

                <div className="delivery-box">

                    <h3>🚚 Delivery Information</h3>


                    <p>📦 Estimated Delivery: 3 - 5 Business Days</p>

                    <p>↩️ 7 Days Easy Return Policy</p>

                    <p>🔒 100% Secure Payment</p>

                </div>

                <div className="specifications">

                    <h3>📋 Product Specifications</h3>

                    <ul>

                        <li>Premium Quality Material</li>

                        <li>Original Brand Product</li>

                        <li>Available in Multiple Sizes</li>

                        <li>Lightweight & Comfortable</li>

                        <li>High Durability</li>

                        <li>Secure Packaging</li>

                    </ul>

                </div>

                {/* Customer Reviews */}

                <div className="reviews">

                    <h3>⭐ Customer Reviews</h3>

                    <div className="review-card">
                        <h4>Ali ⭐⭐⭐⭐⭐</h4>
                        <p>Excellent quality. Highly recommended.</p>
                    </div>

                    <div className="review-card">
                        <h4>Ahmed ⭐⭐⭐⭐</h4>
                        <p>Delivery was fast and product quality is very good.</p>
                    </div>

                    <div className="review-card">
                        <h4>Sara ⭐⭐⭐⭐⭐</h4>
                        <p>Amazing product. Will definitely buy again.</p>
                    </div>

                </div>

                {/* Related Products */}

                <div className="related-products">

                    <h3>🔥 Related Products</h3>

                    <div className="related-grid">

                        {
                            allProducts
                                .filter((p) => p.id !== product.id)
                                .slice(0, 3)
                                .map((item) => (

                                    <Link
                                        key={item.id}
                                        to={`/product/${item.id}`}
                                        style={{
                                            textDecoration: "none",
                                            color: "inherit"
                                        }}
                                    >

                                        <div className="related-card">

                                            <img
                                                src={item.image}
                                                alt={item.name}
                                            />

                                            <h4>{item.name}</h4>

                                            <p>
                                                {item.currency} {item.price}
                                            </p>

                                        </div>

                                    </Link>

                                ))
                        }

                    </div>

                </div>

            </div>

        </section>

    );

}

export default ProductDetails;