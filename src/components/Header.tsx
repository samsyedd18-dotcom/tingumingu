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

  const goWishlist = () => {
    document.getElementById("wishlist")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleLogout = async () => {

    try {

      await signOut(auth);

      alert("Logged Out Successfully");

      navigate("/");

    } catch (error) {

      alert("Logout Failed");

    }

  };

  return (

    <header>

      <div className="topbar">

        {/* LOGO */}
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


        {/* SEARCH */}
        <div className="search-box">

          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        {/* HEADER ICONS */}
        <div className="header-icons">

          <button
            className="wishlist-btn"
            onClick={goWishlist}
          >
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

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </>

          ) : (

            <>

              <Link to="/login">

                <button className="login-btn">
                  Login
                </button>

              </Link>

              <Link to="/register">

                <button className="login-btn">
                  Register
                </button>

              </Link>

            </>

          )}


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


      {/* NAVBAR */}
      <nav className={menuOpen ? "navbar active" : "navbar"}>

        <Link to="/">Home</Link>

        <a href="#products">Shop</a>

        <a href="#categories">Men</a>

        <a href="#categories">Women</a>

        <a href="#categories">Kids</a>

        <a href="#categories">Toys</a>

        <a href="#footer">Contact</a>

      </nav>

    </header>

  );

}

export default Header;