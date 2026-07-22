import { useState } from "react";
import { useProducts } from "../context/productcontext";


function AdminPanel(){

  const { addProduct, products, deleteProduct } = useProducts();


  const [productName,setProductName] = useState("");
  const [price,setPrice] = useState("");
  const [category,setCategory] = useState("");
  const [image,setImage] = useState("");
const [currency,setCurrency] = useState("PKR");
const [images,setImages] = useState<string[]>([]);


  const handleAddProduct = () => {


    if(!productName || !price || !category || !image){

      alert("Please fill all fields");
      return;

    }


    addProduct({

  id: Date.now(),

  name: productName,

  price,

  currency,

  category,

 image,
images:[
  image,
  ...images
],
rating:"⭐⭐⭐⭐⭐"

});



    alert("Product Added Successfully");


    setProductName("");
    setPrice("");
    setCategory("");
    setImage("");
    setImages([]);

  };



  return(

    <section className="admin-panel">


      <div className="admin-layout">


        {/* SIDEBAR */}

        <aside className="admin-sidebar">

          <h2>
            🧸 Tingu Mingu
          </h2>


          <button>
            📊 Dashboard
          </button>


          <button>
            📦 Products
          </button>


          <button>
            🛒 Orders
          </button>


          <button>
            👥 Customers
          </button>


        </aside>



        {/* MAIN CONTENT */}

        <div className="admin-content">


          <h2>
            👑 Admin Dashboard
          </h2>



          {/* STATS */}


          <div className="admin-stats">


            <div className="stat-card">

              <h3>
                📦 Total Products
              </h3>

              <span>
                {products.length}
              </span>

            </div>



            <div className="stat-card">

              <h3>
                🧸 Toys
              </h3>

              <span>
                {
                  products.filter(
                    (p)=>p.category==="Toys"
                  ).length
                }
              </span>

            </div>



            <div className="stat-card">

              <h3>
                👕 Other Items
              </h3>

              <span>
                {
                  products.filter(
                    (p)=>p.category!=="Toys"
                  ).length
                }
              </span>

            </div>


          </div>




          {/* ADD PRODUCT */}


          <div className="add-product">


          <h2>
            ➕ Add Product
          </h2>


          <input
            placeholder="Product Name"
            value={productName}
            onChange={(e)=>setProductName(e.target.value)}
          />


          <input
            placeholder="Price"
            type="number"
            value={price}
            onChange={(e)=>setPrice(e.target.value)}
          />
<select
  value={currency}
  onChange={(e)=>setCurrency(e.target.value)}
>

  <option value="PKR">🇵🇰 PKR (₨)</option>

  <option value="USD">🇺🇸 USD ($)</option>

  <option value="EUR">🇪🇺 EUR (€)</option>

  <option value="GBP">🇬🇧 GBP (£)</option>

  <option value="AED">🇦🇪 AED (د.إ)</option>

  <option value="SAR">🇸🇦 SAR (﷼)</option>

</select>

          <select
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
          >

            <option value="">
              Select Category
            </option>

            <option value="Men">
              Men
            </option>

            <option value="Women">
              Women
            </option>

            <option value="Kids">
              Kids
            </option>

            <option value="Toys">
              Toys
            </option>


          </select>


<input

type="file"

accept="image/*"

multiple

onChange={(e)=>{

const files = e.target.files;

console.log(files);

if(files){

const imageArray = Array.from(files).map(
(file)=>URL.createObjectURL(file)
);

console.log(imageArray);

setImage(imageArray[0]);
setImages(imageArray);

}

}}

/>



         {
images.length > 0 && (

<div style={{display:"flex",gap:"10px"}}>

{
images.map((img,index)=>(

<img

key={index}

src={img}

alt="preview"

width="100"

/>

))

}

</div>

)
}


          <button onClick={handleAddProduct}>
            Add Product
          </button>


          </div>





          {/* PRODUCTS LIST */}



          <h2>
            📦 Products List
          </h2>



          {
            products.map((product)=>(


              <div
                key={product.id}
                className="admin-product"
              >


                <img

                  src={product.image}

                  alt={product.name}

                  width="80"

                />


                <div>

                  <h3>
                    {product.name}
                  </h3>

                 <p>
  {product.currency} {product.price}
</p>
                  <p>
                    {product.category}
                  </p>


                </div>



                <button

                  onClick={()=>{

                    if(
                      window.confirm(
                        "Delete this product?"
                      )
                    ){

                      deleteProduct(product.id);

                    }

                  }}

                >

                  🗑 Delete

                </button>



              </div>


            ))
          }





          {/* ORDERS SECTION */}



          <section className="orders-section">


            <h2>
              🛒 Orders
            </h2>



            <div className="order-card">


              <h3>
                Order #1001
              </h3>


              <p>
                Customer: Ali
              </p>


              <p>
                Product: Toy Car
              </p>


              <p>
                Status: Pending
              </p>



              <button>
                Update Status
              </button>



            </div>



          </section>



        </div>


      </div>


    </section>

  );

}


export default AdminPanel;