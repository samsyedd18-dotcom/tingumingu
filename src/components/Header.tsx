
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/cartcontext";
import { useWishlist } from "../context/wishlistcontext";
import { useSearch } from "../context/SearchContext";

import logo from "../assets/tingu-mingu-logo.png";

interface HeaderProps {
  openCart: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

function Header({ openCart, theme, toggleTheme }: HeaderProps) {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { search, setSearch } = useSearch();
  const { user } = useAuth();

  const navigate = useNavigate();

  const goWishlist = () => {
    if (window.location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById("wishlist")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else {
      document.getElementById("wishlist")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged Out Successfully");
      navigate("/");
    } catch {
      alert("Logout Failed");
    }
  };

  return (
    <header>
      <div className="topbar">
        <Link
          to="/"
          className="logo"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="Tingu Mingu Toys"
            className="logo-image"
          />
        </Link>

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
            className="theme-header-btn"
            onClick={toggleTheme}
            title={theme === "light" ? "Dark Mode" : "Light Mode"}
          >
            {theme === "light" ? "🌙" : "☀️"}
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>

          <button className="wishlist-btn" onClick={goWishlist}>
            ❤️ {wishlist.length}
          </button>

          {user ? (
            <>
              <span className="header-user">
                👋 {user.email}
              </span>

              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>

              <Link to="/register">
                <button className="login-btn">Register</button>
              </Link>
            </>
          )}

          <button className="cart-btn" onClick={openCart}>
            🛒 {cart.length}
          </button>
        </div>
      </div>

      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/#products">Shop</Link>
        <Link to="/category/Men">Men</Link>
        <Link to="/category/Women">Women</Link>
        <Link to="/category/Kids">Kids</Link>
        <Link to="/category/Toys">Toys</Link>
        <Link to="/#footer">Contact</Link>
      </nav>
    </header>
  );
}

export default Header;
