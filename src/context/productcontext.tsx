import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";


export interface Product{

  id:number;
  name:string;
  price:string;
  currency:string;
  category?:string;
  image:string;
  images?: string[];
  rating?:string;
  description?:string;

}


interface ProductContextType {

  products:Product[];
  addProduct:(product:Product)=>void;
  deleteProduct:(id:number)=>void;

}



const ProductContext = createContext<ProductContextType | undefined>(undefined);



export function ProductProvider({children}:{children:ReactNode}){


  const [products,setProducts] = useState<Product[]>(()=>{


    const saved = localStorage.getItem("products");


    return saved ? JSON.parse(saved) : [];


  });



  const addProduct = (product:Product)=>{


    const updatedProducts = [

      ...products,

      product

    ];


    setProducts(updatedProducts);



    localStorage.setItem(

      "products",

      JSON.stringify(updatedProducts)

    );


  };




  const deleteProduct = (id:number)=>{


    const updatedProducts = products.filter(

      (product)=> product.id !== id

    );



    setProducts(updatedProducts);



    localStorage.setItem(

      "products",

      JSON.stringify(updatedProducts)

    );


  };




  return(

    <ProductContext.Provider

      value={{

        products,

        addProduct,

        deleteProduct

      }}

    >

      {children}

    </ProductContext.Provider>

  );


}





export function useProducts(){


  const context = useContext(ProductContext);



  if(!context){


    throw new Error(

      "useProducts must be inside ProductProvider"

    );


  }



  return context;


}