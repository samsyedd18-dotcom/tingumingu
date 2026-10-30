import { useCart } from "../context/cartcontext";

function Cart() {
  const { cart } = useCart();

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price.replace("$", ""));
  }, 0);

  return (
    <section className="cart">

      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((product, index) => (
            <div className="cart-item" key={index}>

              <img
                src={product.image}
                alt={product.name}
              />

              <div>
                <h4>{product.name}</h4>
                <p>{product.price}</p>
              </div>

            </div>
          ))}

          <div className="cart-total">
            <h3>Total: ${total}</h3>

            <button>
              Checkout
            </button>
          </div>
        </>
      )}

    </section>
  );
}

export default Cart;