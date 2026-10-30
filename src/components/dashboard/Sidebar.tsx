import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaTags,
  FaStar,
  FaTicketAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

function Sidebar({
  activePage,
  setActivePage,
}: SidebarProps) {

  return (

    <aside className="sidebar">

      <div className="logo">
        🛍️ Tingu Mingu
      </div>

      <ul>

        <li
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => setActivePage("dashboard")}
        >
          <FaHome />
          <span>Dashboard</span>
        </li>

        <li
          className={activePage === "products" ? "active" : ""}
          onClick={() => setActivePage("products")}
        >
          <FaBoxOpen />
          <span>Products</span>
        </li>

       <li
  className={activePage === "orders" ? "active" : ""}
  onClick={() => {
    console.log("Orders clicked");
    setActivePage("orders");
  }}
>
  <FaShoppingCart />
  <span>Orders</span>
</li>

        <li
          className={activePage === "customers" ? "active" : ""}
          onClick={() => setActivePage("customers")}
        >
          <FaUsers />
          <span>Customers</span>
        </li>

        <li
          className={activePage === "categories" ? "active" : ""}
          onClick={() => setActivePage("categories")}
        >
          <FaTags />
          <span>Categories</span>
        </li>

        <li
          className={activePage === "reviews" ? "active" : ""}
          onClick={() => setActivePage("reviews")}
        >
          <FaStar />
          <span>Reviews</span>
        </li>

        <li
          className={activePage === "coupons" ? "active" : ""}
          onClick={() => setActivePage("coupons")}
        >
          <FaTicketAlt />
          <span>Coupons</span>
        </li>

        <li
          className={activePage === "analytics" ? "active" : ""}
          onClick={() => setActivePage("analytics")}
        >
          <FaChartBar />
          <span>Analytics</span>
        </li>

        <li
          className={activePage === "settings" ? "active" : ""}
          onClick={() => setActivePage("settings")}
        >
          <FaCog />
          <span>Settings</span>
        </li>

      </ul>

      <button className="logout-btn">
        <FaSignOutAlt />
        Logout
      </button>

    </aside>

  );

}

export default Sidebar;