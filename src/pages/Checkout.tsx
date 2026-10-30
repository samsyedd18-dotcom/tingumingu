
import { useState } from "react";
import { useCart } from "../context/cartcontext";

function Checkout() {
  const { cart } = useCart();

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

  const total = cart.reduce((sum: number, item: any) => {
    return sum + Number(item.price);
  }, 0);

  const currency = cart.length > 0 ? cart[0].currency : "PKR";

  const API_URL = import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api";

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
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

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: name,
          phone,
          email,
          country,
          province,
          city,
          postal_code: postalCode,
          address,
          payment_method: payment,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      alert("🎉 Order Placed Successfully!");

      setName("");
      setPhone("");
      setEmail("");
      setProvince("");
      setCity("");
      setPostalCode("");
      setAddress("");

    } catch (error) {
      console.error("Order Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Order Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="checkout">
      <div className="checkout-left">
        <h2>📍 Shipping Address</h2>

        <input placeholder="Full Name" value={name}
          onChange={(e) => setName(e.target.value)} />

        <input placeholder="Phone Number" value={phone}
          onChange={(e) => setPhone(e.target.value)} />

        <input placeholder="Email Address" value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option>Pakistan</option>
          <option>UAE</option>
          <option>Saudi Arabia</option>
          <option>Qatar</option>
        </select>

        <select value={province} onChange={(e) => setProvince(e.target.value)}>
          <option value="">Select Province</option>
          <option>Sindh</option>
          <option>Punjab</option>
          <option>KPK</option>
          <option>Balochistan</option>
          <option>Gilgit Baltistan</option>
          <option>AJK</option>
        </select>

        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Select City</option>
          <option>Karachi</option>
          <option>Lahore</option>
          <option>Islamabad</option>
          <option>Rawalpindi</option>
          <option>Hyderabad</option>
          <option>Multan</option>
          <option>Faisalabad</option>
          <option>Peshawar</option>
          <option>Quetta</option>
        </select>

        <input placeholder="Postal Code" value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)} />

        <textarea placeholder="Complete Address" value={address}
          onChange={(e) => setAddress(e.target.value)} />

        <select value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option>Cash On Delivery</option>
          <option>PayPal</option>
          <option>Credit / Debit Card</option>
        </select>
      </div>

      <div className="checkout-right">
        <h2>🛒 Order Summary</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item: any) => (
            <div className="checkout-item" key={item.id}>
              <img src={item.image} alt={item.name} width="70" />

              <div>
                <h4>{item.name}</h4>
                <p>{item.currency} {item.price}</p>
              </div>
            </div>
          ))
        )}

        <hr />

        <div className="checkout-total">
          <h3>Total: {currency} {total}</h3>
        </div>

        <button
          className="place-order"
          onClick={handlePlaceOrder}
          disabled={loading || cart.length === 0}
        >
          {loading ? "Placing Order..." : "✅ Place Order"}
        </button>
      </div>
    </section>
  );
}

export default Checkout;
