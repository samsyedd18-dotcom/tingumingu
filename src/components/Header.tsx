import { useCart } from "../context/cartcontext";

function Header() {
  const { cart } = useCart();

  return (
    <header className="header">

      <div className="logo">
        🧸 Tingu Mingu
      </div>

      <nav className="nav">
        <a href="#">Home</a>
        <a href="#">Shop</a>
        <a href="#">Men</a>
        <a href="#">Women</a>
        <a href="#">Kids</a>
        <a href="#">Contact</a>
      </nav>

      <div className="right">

        <input
          className="search"
          type="text"
          placeholder="Search products..."
        />

        <button className="cartBtn">
          🛒 {cart.length}
        </button>

        <button className="loginBtn">
          Login
        </button>

      </div>

    </header>
  );
}

export default Header;