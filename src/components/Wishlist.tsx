import { useWishlist } from "../context/wishlistcontext";
import { useCart } from "../context/cartcontext";

function Wishlist() {

  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();


  return (

   <section 
  className="wishlist-page"
  id="wishlist"
>

      <h2>❤️ My Wishlist</h2>


      {
        wishlist.length === 0 ? (

          <p>Your wishlist is empty.</p>

        ) : (


          <div className="wishlist-grid">


            {
              wishlist.map((product) => (

                <div className="wishlist-card" key={product.id}>


                  <img
                    src={product.image}
                    alt={product.name}
                  />


                  <h3>
                    {product.name}
                  </h3>


                <p>
  {product.currency} {product.price}
</p>


                  <button
                    onClick={() => addToCart(product)}
                  >
                    Add To Cart
                  </button>


                  <button
                    className="remove-btn"
                    onClick={() => toggleWishlist(product)}
                  >
                    Remove
                  </button>


                </div>

              ))
            }


          </div>

        )
      }


    </section>

  );

}


export default Wishlist;