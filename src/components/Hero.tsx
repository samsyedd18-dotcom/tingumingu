import hero from "../assets/tingu-mingu-logo.png";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-left">

        <span className="hero-badge">
          ⭐ New Collection 2026
        </span>

        <h1>
          Discover Amazing <br />
          Toys For Every Child
        </h1>

        <p>
          Explore premium quality toys, fashion and accessories for
          Men, Women, Kids and the whole family.
        </p>

        <div className="hero-buttons">
          <button className="shopBtn">Shop Now</button>
          <button className="exploreBtn">Explore</button>
        </div>

      </div>

      <div className="hero-right">

        <div className="discount-badge">
          🔥 50% OFF
        </div>

        <img
          src={hero}
          alt="Tingu Mingu Logo"
        />

      </div>

    </section>
  );
}

export default Hero;