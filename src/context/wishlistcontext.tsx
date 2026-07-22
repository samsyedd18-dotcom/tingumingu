import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Product {

  id: number;
  name: string;
  price: string;
  currency: string;
  image: string;

  category?: string;
  rating?: string;
  description?: string;
  oldPrice?: string;

}

interface WishlistContextType {

  wishlist: Product[];

  toggleWishlist: (product: Product) => void;

  isWishlisted: (id: number) => boolean;

}

const WishlistContext =
  createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [wishlist, setWishlist] = useState<Product[]>([]);

  const toggleWishlist = (product: Product) => {

    const exists = wishlist.some(
      (item) => item.id === product.id
    );

    if (exists) {

      setWishlist((prev) =>
        prev.filter((item) => item.id !== product.id)
      );

    } else {

      setWishlist((prev) => [...prev, product]);

    }

  };

  const isWishlisted = (id: number) => {

    return wishlist.some(
      (item) => item.id === id
    );

  };

  return (

    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >

      {children}

    </WishlistContext.Provider>

  );

}

export function useWishlist() {

  const context = useContext(WishlistContext);

  if (!context) {

    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );

  }

  return context;

}