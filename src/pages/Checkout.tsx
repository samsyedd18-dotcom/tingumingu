import { useCart } from "../context/cartcontext";

function Checkout() {

  const { cart } = useCart();

  const total = cart.reduce((sum: number, item: any) => {
    return sum + Number(item.price);
  }, 0);

  const currency =
    cart.length > 0 ? cart[0].currency : "PKR";

  return (

    <section className="checkout">

      <div className="checkout-left">

        <h2>📍 Shipping Address</h2>

        <input placeholder="Full Name" />

        <input placeholder="Phone Number" />

        <input placeholder="Email" />

        <textarea placeholder="Complete Address"></textarea>

        <select>
          <option>Cash On Delivery</option>
          <option>PayPal</option>
          <option>Credit / Debit Card</option>
        </select>

      </div>

      <div className="checkout-right">

        <h2>🛒 Order Summary</h2>

        {

          cart.map((item) => (

            <div
              className="checkout-item"
              key={item.id}
            >

              <img
                src={item.image}
                alt={item.name}
                width="70"
              />

              <div>

                <h4>{item.name}</h4>

                <p>
                  {item.currency} {item.price}
                </p>

              </div>

            </div>

          ))

        }

        <hr />

        <h3>
          Total : {currency} {total}
        </h3>

        <button className="place-order">
          ✅ Place Order
        </button>

      </div>

    </section>

  );

}

export default Checkout;