
import { useState, useEffect } from "react";
import { useProducts } from "../context/productcontext";

interface AdminPanelProps {
  activePage: string;
}

function AdminPanel({ activePage }: AdminPanelProps) {
  const { addProduct, products, deleteProduct } = useProducts();

  const [orders, setOrders] = useState<any[]>([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [currency, setCurrency] = useState("PKR");
  const [loading, setLoading] = useState(false);

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Orders error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ADD PRODUCT
  const handleAddProduct = async () => {
    if (!productName.trim() || !price || !category || !image) {
      alert("Please fill all fields");
      return;
    }

    if (Number(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "tingu-mingu");

      const cloudResponse = await fetch(
        "https://api.cloudinary.com/v1_1/zp3cvkzu/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudData = await cloudResponse.json();

      if (!cloudResponse.ok || !cloudData.secure_url) {
        throw new Error(
          cloudData.error?.message || "Image upload failed"
        );
      }

      // Save product to database
      await addProduct({
        id: 0,
        name: productName.trim(),
        price,
        image: cloudData.secure_url,
        category,
        description: "",
        currency,
        images: [cloudData.secure_url],
        rating: "⭐⭐⭐⭐⭐",
      });

      // SUCCESS MESSAGE
      alert("Product Added Successfully!");

      // Reset form only after successful save
      setProductName("");
      setPrice("");
      setCategory("");
      setImage(null);
      setCurrency("PKR");

      const fileInput = document.getElementById(
        "product-image"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {
      console.error("Product error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Product add failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      alert("Product Deleted Successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Product delete failed");
    }
  };

  // DASHBOARD
  const renderDashboard = () => {
    const revenue = orders.reduce(
      (sum: number, order: any) =>
        sum + Number(order.total || 0),
      0
    );

    return (
      <section className="admin-panel">
        <div className="admin-content">
          <h2>👑 Admin Dashboard</h2>

          <section className="dashboard-cards">
            <div className="dashboard-card revenue">
              <h3>💰 Revenue</h3>
              <h2>PKR {revenue}</h2>
              <p>Total Revenue</p>
            </div>

            <div className="dashboard-card products">
              <h3>📦 Products</h3>
              <h2>{products.length}</h2>
              <p>Total Products</p>
            </div>

            <div className="dashboard-card orders">
              <h3>🛒 Orders</h3>
              <h2>{orders.length}</h2>
              <p>Total Orders</p>
            </div>

            <div className="dashboard-card customers">
              <h3>👥 Customers</h3>
              <h2>
                {
                  new Set(
                    orders.map((order: any) => order.email)
                  ).size
                }
              </h2>
              <p>Total Customers</p>
            </div>
          </section>

          <div className="dashboard-sections">
            <div className="dashboard-box">
              <h2>🕒 Recent Orders</h2>

              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No Orders Found
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((order: any) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customer_name}</td>
                        <td>PKR {order.total}</td>
                        <td className="pending">Pending</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-box">
                <h2>🔥 Top Selling Products</h2>
                <p>Sales information will appear here.</p>
              </div>

              <div className="dashboard-box">
                <h2>⚠️ Low Stock Products</h2>
                <p>Stock information will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // PRODUCTS PAGE
  const renderProducts = () => {
    return (
      <section className="admin-panel">
        <div className="admin-content">
          <h2>📦 Products</h2>

          <div className="add-product">
            <h2>➕ Add Product</h2>

            <input
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />

            <input
              placeholder="Price"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="PKR">🇵🇰 PKR</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="GBP">🇬🇧 GBP</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Toys">Toys</option>
            </select>

            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImage(file);
              }}
            />

            <button
              onClick={handleAddProduct}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Add Product"}
            </button>
          </div>

          <h2>📋 Products List</h2>

          <div className="products-list">
            {products.length === 0 ? (
              <p>No Products Found</p>
            ) : (
              products.map((product: any) => (
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
                    <h3>{product.name}</h3>
                    <p>
                      {product.currency || "PKR"} {product.price}
                    </p>
                    <p>Category: {product.category}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  };

  // ORDERS PAGE
  const renderOrders = () => {
    return (
      <section className="admin-panel">
        <div className="admin-content">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h2>🛒 Orders</h2>
            <button onClick={fetchOrders}>🔄 Refresh Orders</button>
          </div>

          {orders.length === 0 ? (
            <div className="dashboard-box">
              <h3>No Orders Found</h3>
              <p>Orders placed from checkout will appear here.</p>
            </div>
          ) : (
            <div className="dashboard-box">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.phone}</td>
                      <td>{order.email}</td>
                      <td>{order.address}</td>
                      <td>{order.payment_method}</td>
                      <td>PKR {order.total}</td>
                      <td className="pending">Pending</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
  };

  // CUSTOMERS PAGE
  const renderCustomers = () => {
    const customers = orders.reduce(
      (unique: any[], order: any) => {
        const exists = unique.find(
          (customer) => customer.email === order.email
        );

        if (!exists) unique.push(order);
        return unique;
      },
      []
    );

    return (
      <section className="admin-panel">
        <div className="admin-content">
          <h2>👥 Customers</h2>

          <div className="dashboard-box">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                </tr>
              </thead>

              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      No Customers Found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer: any) => (
                    <tr key={customer.id}>
                      <td>{customer.customer_name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email}</td>
                      <td>{customer.address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  // OTHER PAGES
  const renderOtherPage = () => {
    const titles: Record<string, string> = {
      categories: "🏷️ Categories",
      reviews: "⭐ Reviews",
      coupons: "🎟️ Coupons",
      analytics: "📊 Analytics",
      settings: "⚙️ Settings",
    };

    return (
      <section className="admin-panel">
        <div className="admin-content">
          <h2>{titles[activePage] || "Admin Panel"}</h2>

          <div className="dashboard-box">
            <h3>{titles[activePage] || "Admin Panel"}</h3>
            <p>This section is ready for the next step.</p>
          </div>
        </div>
      </section>
    );
  };

  // PAGE SWITCHING
  if (activePage === "dashboard") return renderDashboard();
  if (activePage === "products") return renderProducts();
  if (activePage === "orders") return renderOrders();
  if (activePage === "customers") return renderCustomers();

  return renderOtherPage();
}

export default AdminPanel;
