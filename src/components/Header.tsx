import { useState } from "react";
import { useCart } from "../context/cartcontext";
import { useWishlist } from "../context/wishlistcontext";
import { useSearch } from "../context/SearchContext";

interface HeaderProps {
  openCart: () => void;
}

function Header({ openCart }: HeaderProps) {

  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const { search, setSearch } = useSearch();

  const [menuOpen, setMenuOpen] = useState(false);

  const goWishlist = () => {

    document.getElementById("wishlist")?.scrollIntoView({
      behavior: "smooth",
    });

  };

  const goLogin = () => {

    document.getElementById("login")?.scrollIntoView({
      behavior: "smooth",
    });

  };

  return (

    <header>

      <div className="topbar">

        <div className="logo">
          🧸 Tingu Mingu
        </div>

        <div className="search-box">

          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="header-icons">

          <button
            className="wishlist-btn"
            onClick={goWishlist}
          >
            ❤️ {wishlist.length}
          </button>

          <button
            className="login-btn"
            onClick={goLogin}
          >
            Login
          </button>

          <button
            className="cart-btn"
            onClick={openCart}
          >
            🛒 {cart.length}
          </button>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

        </div>

      </div>

      <nav className={menuOpen ? "navbar active" : "navbar"}>

        <a href="#">Home</a>
        <a href="#">Shop</a>
        <a href="#">Men</a>
        <a href="#">Women</a>
        <a href="#">Kids</a>
        <a href="#">Toys</a>
        <a href="#">Contact</a>

      </nav>

    </header>

  );

}

export default Header;