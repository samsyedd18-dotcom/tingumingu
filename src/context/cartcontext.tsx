import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Product = {
  id: number;
  name: string;
  price: string;
  currency: string;
  image: string;
  category?: string;
  rating?: string;
  description?: string;
};

type CartContextType = {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {

  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Product) => {

    setCart((prev) => [...prev, product]);

  };

  const removeFromCart = (id: number) => {

    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    );

  };

  const clearCart = () => {

    setCart([]);

  };

  return (

    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart
      }}
    >

      {children}

    </CartContext.Provider>

  );

}

export function useCart() {

  const context = useContext(CartContext);

  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider"
    );

  }

  return context;

}