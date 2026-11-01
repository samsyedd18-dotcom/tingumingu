
import { useCart } from "../context/cartcontext";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  close: () => void;
}

function CartDrawer({ open, close }: Props) {
  const navigate = useNavigate();

  const { cart, updateQuantity, removeFromCart } = useCart();

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  return (
    <div className={open ? "cart-overlay active" : "cart-overlay"}>
      <div className="cart-drawer">

        <button className="close-cart" onClick={close}>
          ✕
        </button>

        <h2>🛒 Your Cart</h2>

        {cart.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          cart.map((product) => {
            const stock = Number(product.stock ?? 0);
            const lineTotal = Number(product.price) * product.quantity;

            return (
              <div className="drawer-item" key={product.id}>
                <img src={product.image} alt={product.name} />

                <div className="drawer-item-details">
                  <h4>{product.name}</h4>

                  <p>
                    {product.currency || "PKR"} {product.price}
                  </p>

                  <p>
                    Item Total: {product.currency || "PKR"}{" "}
                    {lineTotal.toFixed(2)}
                  </p>

                  <div className="cart-quantity-controls">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(product.id, product.quantity - 1)
                      }
                      disabled={product.quantity <= 1}
                    >
                      −
                    </button>

                    <span>{product.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(product.id, product.quantity + 1)
                      }
                      disabled={product.quantity >= stock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-cart-item"
                    onClick={() => removeFromCart(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="drawer-total">
          <h3>Grand Total: PKR {total.toFixed(2)}</h3>

          <button
            disabled={cart.length === 0}
            onClick={() => {
              close();
              navigate("/checkout");
            }}
          >
            Checkout
          </button>
        </div>

      </div>
    </div>
  );
}

export default CartDrawer;
