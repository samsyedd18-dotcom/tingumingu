
import { createContext, useContext, useEffect, useState } from "react";
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

type Toast = {
  message: string;
  type: "success" | "error";
} | null;

type CartContextType = {
  cart: Product[];
  appliedCoupons: Record<number, AppliedCoupon>;
  toast: Toast;
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
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const addToCart = (product: Omit<Product, "quantity">) => {
    const existing = cart.find((item) => item.id === product.id);
    const availableStock = Number(product.stock ?? 0);

    if (availableStock <= 0) {
      setToast({
        message: "This product is out of stock!",
        type: "error",
      });
      return;
    }

    if (existing && existing.quantity >= availableStock) {
      setToast({
        message: "Available stock limit reached!",
        type: "error",
      });
      return;
    }

    setCart((prev) => {
      const currentItem = prev.find((item) => item.id === product.id);

      if (currentItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    setToast({
      message: `${product.name} added to cart!`,
      type: "success",
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
          setToast({
            message: "Available stock limit reached!",
            type: "error",
          });
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
        toast,
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
