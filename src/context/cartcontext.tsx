
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  currency?: string;
  category?: string;
  description?: string;
  stock?: number;
  quantity: number;
}

type CartContextType = {
  cart: Product[];
  addToCart: (product: Omit<Product, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Omit<Product, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      const availableStock = Number(product.stock ?? 0);

      if (existing) {
        if (existing.quantity >= availableStock) {
          alert("Available stock limit reached!");
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (availableStock <= 0) {
        alert("This product is out of stock!");
        return prev;
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (item.stock !== undefined && quantity > item.stock) {
          alert("Available stock limit reached!");
          return item;
        }

        return { ...item, quantity };
      })
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
