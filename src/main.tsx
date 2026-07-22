import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";

import { CartProvider } from "./context/cartcontext.tsx";
import { WishlistProvider } from "./context/wishlistcontext.tsx";
import { ProductProvider } from "./context/productcontext.tsx";
import { SearchProvider } from "./context/SearchContext.tsx";

createRoot(document.getElementById("root")!).render(

  <StrictMode>

    <BrowserRouter>

      <SearchProvider>

        <WishlistProvider>

          <CartProvider>

            <ProductProvider>

              <App />

            </ProductProvider>

          </CartProvider>

        </WishlistProvider>

      </SearchProvider>

    </BrowserRouter>

  </StrictMode>

);