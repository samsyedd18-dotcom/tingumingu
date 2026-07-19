import hero from "../assets/images/hero.jpg";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <span className="tag">
          ⭐ New Collection 2026
        </span>

        <h1>
          Discover Amazing <br />
          Toys For Every Child
        </h1>

        <p>
          Premium quality toys, fashion and accessories for
          Men, Women, Kids and Families.
        </p>

        <div className="hero-buttons">
          <button className="shopBtn">
            Shop Now
          </button>

          <button className="exploreBtn">
            Explore
          </button>
        </div>

      </div>

      <div className="hero-image">
        <img src={hero} alt="Hero" />
      </div>

    </section>
  );
}

export default Hero;