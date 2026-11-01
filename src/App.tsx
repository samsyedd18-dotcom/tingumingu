
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import Wishlist from "./components/Wishlist";
import CartDrawer from "./components/CartDrawer";

import Login from "./components/Login";
import Register from "./components/Register";

import ProductDetails from "./pages/ProductDetails";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";

import ScrollToTop from "./components/ScrollToTop";
import { useCart } from "./context/cartcontext";

import "./App.css";

interface ThemeProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

function Home({ theme, toggleTheme }: ThemeProps) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className={`storefront theme-${theme}`}>
      <Header
        openCart={() => setCartOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <Hero />
      <Products />
      <Wishlist />

      <Cart />
      <Footer />

      <CartDrawer
        open={cartOpen}
        close={() => setCartOpen(false)}
      />
    </div>
  );
}

function CategoryPage({ theme, toggleTheme }: ThemeProps) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className={`storefront theme-${theme}`}>
      <Header
        openCart={() => setCartOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <Products />

      <Cart />
      <Footer />

      <CartDrawer
        open={cartOpen}
        close={() => setCartOpen(false)}
      />
    </div>
  );
}

function App() {
  const { toast } = useCart();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("store-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("store-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  };

  const themeProps = { theme, toggleTheme };

  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home {...themeProps} />} />

        <Route
          path="/category/:category"
          element={<CategoryPage {...themeProps} />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            maxWidth: "calc(100vw - 40px)",
            background: "#ffffff",
            color: "#222222",
            borderLeft: `5px solid ${toast.type === "success" ? "#16a34a" : "#dc2626"
              }`,
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            fontWeight: 600,
            animation: "cartToastIn 0.3s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              color: toast.type === "success" ? "#16a34a" : "#dc2626",
            }}
          >
            {toast.type === "success" ? "✓" : "!"}
          </span>

          <span>{toast.message}</span>
        </div>
      )}

      <style>
        {`
          @keyframes cartToastIn {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  );
}

export default App;
