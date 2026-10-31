
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

export interface AppliedCoupon {
  code: string;
  discount_type: string;
  discount_value: number;
}

type CartContextType = {
  cart: Product[];
  appliedCoupons: Record<number, AppliedCoupon>;
  addToCart: (product: Omit<Product, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (productId: number, coupon: AppliedCoupon) => void;
  removeCoupon: (productId: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [appliedCoupons, setAppliedCoupons] =
    useState<Record<number, AppliedCoupon>>({});

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

    setAppliedCoupons((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
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

  const applyCoupon = (productId: number, coupon: AppliedCoupon) => {
    setAppliedCoupons((prev) => ({
      ...prev,
      [productId]: coupon,
    }));
  };

  const removeCoupon = (productId: number) => {
    setAppliedCoupons((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupons({});
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        appliedCoupons,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
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
