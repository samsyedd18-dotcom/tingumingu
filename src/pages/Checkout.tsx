
import { useEffect, useState } from "react";
import { useCart } from "../context/cartcontext";

function Checkout() {
  const { cart, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Cash On Delivery");
  const [loading, setLoading] = useState(false);

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const API_URL = import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api";

  // LOAD DELIVERY FEE
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);

        if (!response.ok) {
          throw new Error("Settings could not be loaded");
        }

        const settings = await response.json();

        const fee = Number(settings.delivery_fee ?? 0);

        setDeliveryFee(
          Number.isFinite(fee) && fee >= 0 ? fee : 0
        );
      } catch (error) {
        console.error("Settings Error:", error);
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // CALCULATE SUBTOTAL
  const subtotal = cart.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  const currency =
    cart.length > 0 ? cart[0].currency || "PKR" : "PKR";

  const hasMixedCurrencies = cart.some(
    (item) => (item.currency || "PKR") !== currency
  );

  const total = subtotal + deliveryFee;

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (hasMixedCurrencies) {
      alert("Please order products in the same currency.");
      return;
    }

    if (settingsLoading) {
      alert("Please wait while checkout settings load.");
      return;
    }

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !country ||
      !province ||
      !city ||
      !postalCode.trim() ||
      !address.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          country,
          province,
          city,
          postal_code: postalCode.trim(),
          address: address.trim(),
          payment_method: payment,
          items: orderItems,
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const errorText = await response.text();

        console.error("Server Response:", errorText);

        throw new Error(
          `Invalid server response. Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      alert(
        `🎉 Order Placed Successfully!\nOrder Total: ${data.total ?? total
        } ${currency}`
      );

      // CLEAR CART AFTER SUCCESSFUL ORDER
      clearCart();

      // RESET FORM
      setName("");
      setPhone("");
      setEmail("");
      setCountry("Pakistan");
      setProvince("");
      setCity("");
      setPostalCode("");
      setAddress("");
      setPayment("Cash On Delivery");

    } catch (error) {
      console.error("Order Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Order Failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="checkout">
      <div className="checkout-left">
        <h2>📍 Shipping Address</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="Pakistan">Pakistan</option>
          <option value="UAE">UAE</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
          <option value="Qatar">Qatar</option>
        </select>

        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        >
          <option value="">Select Province</option>
          <option value="Sindh">Sindh</option>
          <option value="Punjab">Punjab</option>
          <option value="KPK">KPK</option>
          <option value="Balochistan">Balochistan</option>
          <option value="Gilgit Baltistan">Gilgit Baltistan</option>
          <option value="AJK">AJK</option>
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Select City</option>
          <option value="Karachi">Karachi</option>
          <option value="Lahore">Lahore</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Rawalpindi">Rawalpindi</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Multan">Multan</option>
          <option value="Faisalabad">Faisalabad</option>
          <option value="Peshawar">Peshawar</option>
          <option value="Quetta">Quetta</option>
        </select>

        <input
          type="text"
          placeholder="Postal Code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />

        <textarea
          placeholder="Complete Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
        >
          <option value="Cash On Delivery">
            Cash On Delivery
          </option>
          <option value="PayPal">PayPal</option>
          <option value="Credit / Debit Card">
            Credit / Debit Card
          </option>
        </select>
      </div>

      <div className="checkout-right">
        <h2>🛒 Order Summary</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div className="checkout-item" key={item.id}>
              <img
                src={item.image}
                alt={item.name}
                width="70"
              />

              <div>
                <h4>{item.name}</h4>

                <p>
                  {item.currency || "PKR"} {item.price}
                </p>

                <p>Quantity: {item.quantity}</p>

                <p>
                  Item Total: {currency}{" "}
                  {(
                    Number(item.price) * item.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}

        <hr />

        <div className="checkout-total">
          <p>
            Subtotal: {currency} {subtotal.toFixed(2)}
          </p>

          <p>
            Delivery Fee: {currency}{" "}
            {deliveryFee.toFixed(2)}
          </p>

          <hr />

          <h3>
            Total: {currency} {total.toFixed(2)}
          </h3>
        </div>

        <button
          className="place-order"
          onClick={handlePlaceOrder}
          disabled={
            loading ||
            cart.length === 0 ||
            settingsLoading ||
            hasMixedCurrencies
          }
        >
          {loading
            ? "Placing Order..."
            : settingsLoading
              ? "Loading Checkout..."
              : "✅ Place Order"}
        </button>
      </div>
    </section>
  );
}

export default Checkout;
