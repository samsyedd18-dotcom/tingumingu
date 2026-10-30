
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
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

import "./App.css";

interface ThemeProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// HOME PAGE
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
      <Categories />
      <Products />
      <Wishlist />
      <Footer />
      <Cart />

      <CartDrawer
        open={cartOpen}
        close={() => setCartOpen(false)}
      />
    </div>
  );
}

// CATEGORY PAGE
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
      <Footer />
      <Cart />

      <CartDrawer
        open={cartOpen}
        close={() => setCartOpen(false)}
      />
    </div>
  );
}

// MAIN APP
function App() {
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

  const themeProps = {
    theme,
    toggleTheme,
  };

  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={<Home {...themeProps} />}
        />

        <Route
          path="/category/:category"
          element={<CategoryPage {...themeProps} />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
