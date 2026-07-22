import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import Wishlist from "./components/Wishlist";
import CartDrawer from "./components/CartDrawer";

import ProductDetails from "./pages/ProductDetails";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import "./App.css";


function Home() {

  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Header
        openCart={() => setCartOpen(true)}
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
    </>
  );

}


function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/product/:id"
        element={<ProductDetails />}
      />

      <Route
        path="/admin"
        element={<Admin />}
      />
      <Route
  path="/checkout"
  element={<Checkout />}
/>

    </Routes>

  );

}


export default App;