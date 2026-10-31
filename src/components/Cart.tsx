
import { Link } from "react-router-dom";
import { useCart } from "../context/cartcontext";

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  const currency = cart.length > 0
    ? cart[0].currency || "PKR"
    : "PKR";

  return (
    <section className="cart">
      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((product) => (
            <div className="cart-item" key={product.id}>
              <img
                src={product.image}
                alt={product.name}
              />

              <div className="cart-item-details">
                <h4>{product.name}</h4>

                <p>
                  {product.currency || "PKR"} {product.price}
                </p>

                <p>
                  Available Stock: {product.stock ?? 0}
                </p>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      updateQuantity(
                        product.id,
                        product.quantity - 1
                      )
                    }
                    disabled={product.quantity <= 1}
                  >
                    -
                  </button>

                  <span>{product.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        product.id,
                        product.quantity + 1
                      )
                    }
                    disabled={
                      product.quantity >= Number(product.stock ?? 0)
                    }
                  >
                    +
                  </button>
                </div>

                <p>
                  Subtotal: {product.currency || "PKR"}{" "}
                  {(Number(product.price) * product.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(product.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <h3>
              Total: {currency} {total.toFixed(2)}
            </h3>

            <Link to="/checkout">
              <button>Checkout</button>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;
