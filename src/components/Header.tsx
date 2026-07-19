import { useCart } from "../context/cartcontext"


function Header() {

  const { cart } = useCart() 
  console.log("Header:", cart);

console.log("Cart Count:", cart.length);

  return (
    <header className="header">

      <div className="logo">
        Tingu Mingu Toys
      </div>


      <nav>
        <a href="#">Home</a>
        <a href="#">Toys</a>
        <a href="#">Mens</a>
        <a href="#">Womens</a>
        <a href="#">Others</a>
      </nav>


      <div className="actions">

        <input
          type="text"
          placeholder="Search products..."
        />


        <button>
          🛒 Cart ({cart.length})
        </button>

      </div>


    </header>
  )
}


export default Header