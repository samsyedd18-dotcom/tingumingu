
import { useState } from "react";
import { Link } from "react-router-dom";

function Footer() {
  const [popup, setPopup] = useState<"contact" | "support" | null>(null);

  return (
    <footer className="footer" id="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-section footer-brand">
          <h2> Tingu Mingu Toys</h2>
          <p>
            Making kids happy with amazing toys.
            Discover fun, creativity and happiness
            with our wonderful collection.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/#products">Shop</Link>
          <Link to="/#categories">Categories</Link>
          <Link to="/login">My Account</Link>
        </div>

        {/* CUSTOMER SUPPORT */}
        <div className="footer-section">
          <h3>Customer Support</h3>

          <button
            type="button"
            className="footer-action-link"
            onClick={() => setPopup("contact")}
          >
            Contact Us
          </button>

          <button
            type="button"
            className="footer-action-link"
            onClick={() => setPopup("support")}
          >
            Help & Support
          </button>

          <p>We are here to help you.</p>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="footer-section">
          <h3>Contact Information</h3>
          <p>✉️ tingumingutoys@gmail.com</p>
          <p> Pakistan</p>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Tingu Mingu Toys.
          All Rights Reserved.
        </p>
        <p>Made with ❤️ for happy kids</p>
      </div>

      {/* POPUP */}
      {popup && (
        <div
          className="footer-popup-overlay"
          onClick={() => setPopup(null)}
        >
          <div
            className="footer-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="footer-popup-close"
              onClick={() => setPopup(null)}
              aria-label="Close popup"
            >
              ×
            </button>

            {popup === "contact" ? (
              <>
                <h2>Contact Us</h2>
                <p>For any questions, contact us at:</p>
                <strong>tingumingutoys@gmail.com</strong>
              </>
            ) : (
              <>
                <h2>Help & Support</h2>
                <p>
                  Need help with Tingu Mingu Toys?
                </p>
                <p>
                  For assistance and questions, reach us at:
                </p>
                <strong>tingumingutoys@gmail.com</strong>
                <p className="footer-support-note">
                  We will be happy to assist you.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;
