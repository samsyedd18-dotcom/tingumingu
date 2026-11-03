
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

export interface Product {
  id: number;
  name: string;
  price: string;
  currency?: string;
  oldPrice?: string;
  category?: string;
  image: string;
  images?: string[];
  video?: string;
  rating?: string;
  description?: string;
  stock?: number;
}

interface ProductContextType {
  products: Product[];
  refreshProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

const ProductContext = createContext<
  ProductContextType | undefined
>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "/api";

export function ProductProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  // LOAD / REFRESH PRODUCTS
  const refreshProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      console.log("API URL:", `${API_URL}/products`);
      if (!response.ok) {
        throw new Error("Products fetch failed");
      }

      const data: Product[] = await response.json();

      setProducts(data);
    } catch (error) {
      console.error("Products load error:", error);
      throw error;
    }
  };

  useEffect(() => {
    refreshProducts().catch(() => {
      // Error is already logged inside refreshProducts.
    });
  }, []);

  // ADD PRODUCT
  const addProduct = async (product: Product) => {
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...product,
        images: product.images || [],
        video: product.video || "",
        description: product.description || "",
        stock: product.stock ?? 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Product upload failed");
    }

    await refreshProducts();
  };

  // DELETE PRODUCT
  const deleteProduct = async (id: number) => {
    const response = await fetch(
      `${API_URL}/products/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Product delete failed");
    }

    setProducts((prev) =>
      prev.filter((product) => product.id !== id)
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        refreshProducts,
        addProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error(
      "useProducts must be inside ProductProvider"
    );
  }

  return context;
}
