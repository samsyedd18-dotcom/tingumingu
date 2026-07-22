import { useCart } from "../context/cartcontext";

interface Props {
  open: boolean;
  close: () => void;
}


function CartDrawer({open, close}: Props) {

  const { cart } = useCart();


  const total = cart.reduce((sum, item)=>{
    return sum + Number(item.price.replace("$",""));
  },0);


  return (

    <div className={open ? "cart-overlay active" : "cart-overlay"}>


      <div className="cart-drawer">


        <button 
          className="close-cart"
          onClick={close}
        >
          ✕
        </button>


        <h2>
          🛒 Your Cart
        </h2>


        {
          cart.length === 0 ? (

            <p>
              Cart is empty
            </p>

          ) : (

            cart.map((product,index)=>(

              <div 
                className="drawer-item"
                key={index}
              >

                <img 
                  src={product.image}
                  alt={product.name}
                />


                <div>

                  <h4>
                    {product.name}
                  </h4>

                  <p>
                    {product.price}
                  </p>

                </div>


              </div>

            ))

          )
        }


        <div className="drawer-total">

          <h3>
            Total: ${total}
          </h3>


          <button>
            Checkout
          </button>

        </div>


      </div>


    </div>

  );

}


export default CartDrawer;