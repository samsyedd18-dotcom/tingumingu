
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/cartcontext";
import { useWishlist } from "../context/wishlistcontext";
import { useSearch } from "../context/SearchContext";

import logo from "../assets/tingu-mingu-logo.png";

interface Category {
  id: string | number;
  name: string;
}

interface HeaderProps {
  openCart: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

function Header({ openCart, theme, toggleTheme }: HeaderProps) {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { search, setSearch } = useSearch();
  const { user, loading } = useAuth();

  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Unable to load categories");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCategories(
            data.filter(
              (item: Category) =>
                item.name &&
                item.name.trim().toLowerCase() !== "other"
            )
          );
        }
      } catch (error) {
        console.error("Header categories error:", error);
      }
    };

    fetchCategories();
  }, []);

  const goWishlist = () => {
    if (window.location.pathname !== "/") {
      navigate("/");

      window.setTimeout(() => {
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
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
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

          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <span className="header-user">
                👋 {user.displayName || user.email}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>

              <Link to="/register" className="login-btn">
                Register
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

        <div
          className="categories-dropdown"
          onMouseEnter={() => setCategoriesOpen(true)}
          onMouseLeave={() => setCategoriesOpen(false)}
        >
          <button
            type="button"
            className="categories-dropdown-btn"
            onClick={() => setCategoriesOpen((prev) => !prev)}
          >
            Categories ▼
          </button>

          {categoriesOpen && (
            <div className="categories-dropdown-menu">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id || category.name}
                    to={`/category/${encodeURIComponent(category.name)}`}
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <span className="no-categories">
                  No categories available
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="contact-btn"
          onClick={() => {
            setContactOpen((prev) => !prev);
            setCategoriesOpen(false);
          }}
        >
          Contact
        </button>
      </nav>

      {contactOpen && (
        <div className="contact-popup">
          <button
            type="button"
            className="contact-close"
            onClick={() => setContactOpen(false)}
            aria-label="Close contact popup"
          >
            ×
          </button>

          <h3>Contact Us</h3>
          <p>tingumingutoys@gmail.com</p>
        </div>
      )}
    </header>
  );
}

export default Header;
