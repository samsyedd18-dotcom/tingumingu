
import { useState } from "react";
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
}

function Header({ openCart }: HeaderProps) {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { search, setSearch } = useSearch();
  const { user } = useAuth();

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
    closeMenu();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged Out Successfully");
      navigate("/");
      closeMenu();
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
          onClick={closeMenu}
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
          <button className="wishlist-btn" onClick={goWishlist}>
            ❤️ {wishlist.length}
          </button>

          {user ? (
            <>
              <span
                style={{
                  color: "white",
                  fontWeight: "600",
                  marginRight: "10px",
                }}
              >
                👋 {user.email}
              </span>

              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                <button className="login-btn">Login</button>
              </Link>

              <Link to="/register" onClick={closeMenu}>
                <button className="login-btn">Register</button>
              </Link>
            </>
          )}

          <button className="cart-btn" onClick={openCart}>
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
        <Link to="/" onClick={closeMenu}>Home</Link>

        <Link to="/#products" onClick={closeMenu}>Shop</Link>

        <Link to="/category/Men" onClick={closeMenu}>Men</Link>

        <Link to="/category/Women" onClick={closeMenu}>Women</Link>

        <Link to="/category/Kids" onClick={closeMenu}>Kids</Link>

        <Link to="/category/Toys" onClick={closeMenu}>Toys</Link>

        <Link to="/#footer" onClick={closeMenu}>Contact</Link>
      </nav>
    </header>
  );
}

export default Header;
