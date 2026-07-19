function Header() {
  return (
    <header className="header">
      <div className="logo">
        Tingu Mingu Toys
      </div>

      <nav>
        <a href="#">Home</a>
        <a href="#">Toys</a>
        <a href="#">Kids</a>
        <a href="#">Offers</a>
      </nav>

      <div className="actions">
        <input 
          type="text" 
          placeholder="Search toys..."
        />
        <button>🛒 Cart</button>
      </div>
    </header>
  )
}

export default Header