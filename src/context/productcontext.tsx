
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
  rating?: string;
  description?: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

const ProductContext = createContext<
  ProductContextType | undefined
>(undefined);

// Vercel backend API
const API_URL = "/api";

export function ProductProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  // Load Products
  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Products fetch failed");
      }

      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error("Products load error:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Add Product
  const addProduct = async (product: Product) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Product upload failed"
        );
      }

      const newProduct = await response.json();

      setProducts((prev) => [...prev, newProduct]);

      alert("Product Added Successfully");
    } catch (error) {
      console.error("Product add error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Product upload failed"
      );
    }
  };

  // Delete Product
  const deleteProduct = async (id: number) => {
    try {
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

      alert("Product Deleted Successfully");
    } catch (error) {
      console.error("Product delete error:", error);
      alert("Delete failed");
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
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
