
import { useState, useEffect } from "react";
import { useProducts } from "../context/productcontext";

interface AdminPanelProps {
  activePage: string;
}

const API = "/api";

async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`Invalid server response (${response.status})`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function AdminPanel({ activePage }: AdminPanelProps) {
  const { addProduct, products, deleteProduct } = useProducts();

  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    store_name: "Tingu Mingu Toys",
    store_email: "",
    store_phone: "",
    currency: "PKR",
    store_address: "",
  });

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [currency, setCurrency] = useState("PKR");
  const [loading, setLoading] = useState(false);

  // CATEGORY FORM
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  // COUPON FORM
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  // COMMON MESSAGE
  const [message, setMessage] = useState("");

  const showError = (error: unknown) => {
    console.error(error);
    alert(error instanceof Error ? error.message : "Something went wrong");
  };

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const data = await apiRequest("/orders");
      setOrders(data);
    } catch (error) {
      showError(error);
    }
  };

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const data = await apiRequest("/categories");
      setCategories(data);
    } catch (error) {
      showError(error);
    }
  };

  // FETCH REVIEWS
  const fetchReviews = async () => {
    try {
      const data = await apiRequest("/reviews");
      setReviews(data);
    } catch (error) {
      showError(error);
    }
  };

  // FETCH COUPONS
  const fetchCoupons = async () => {
    try {
      const data = await apiRequest("/coupons");
      setCoupons(data);
    } catch (error) {
      showError(error);
    }
  };

  // FETCH ANALYTICS
  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest("/analytics");
      setAnalytics(data);
    } catch (error) {
      showError(error);
    }
  };

  // FETCH SETTINGS
  const fetchSettings = async () => {
    try {
      const data = await apiRequest("/settings");
      setSettings((previous: any) => ({
        ...previous,
        ...data,
      }));
    } catch (error) {
      showError(error);
    }
  };

  // LOAD SECTION DATA
  useEffect(() => {
    setMessage("");

    if (activePage === "dashboard" || activePage === "orders" || activePage === "customers") {
      fetchOrders();
    }

    if (activePage === "categories") fetchCategories();
    if (activePage === "reviews") fetchReviews();
    if (activePage === "coupons") fetchCoupons();
    if (activePage === "analytics") fetchAnalytics();
    if (activePage === "settings") fetchSettings();
  }, [activePage]);

  // ADD PRODUCT
  const handleAddProduct = async () => {
    if (!productName.trim() || !price || !category || !image) {
      alert("Please fill all fields");
      return;
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
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
        throw new Error(cloudData.error?.message || "Image upload failed");
      }

      await addProduct({
        id: 0,
        name: productName.trim(),
        price,
        image: cloudData.secure_url,
        category,
        description: "",
        currency,
        images: [cloudData.secure_url],
      });

      alert("Product Added Successfully!");

      setProductName("");
      setPrice("");
      setCategory("");
      setImage(null);
      setCurrency("PKR");

      const fileInput = document.getElementById(
        "product-image"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      alert("Product Deleted Successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // ADD CATEGORY
  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      alert("Enter category name");
      return;
    }

    try {
      await apiRequest("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription,
          image: categoryImage,
        }),
      });

      setCategoryName("");
      setCategoryDescription("");
      setCategoryImage("");
      setMessage("Category added successfully!");

      fetchCategories();
    } catch (error) {
      showError(error);
    }
  };

  // EDIT CATEGORY
  const handleEditCategory = async (item: any) => {
    const newName = window.prompt("Enter category name:", item.name);
    if (newName === null || !newName.trim()) return;

    const newDescription = window.prompt(
      "Enter description:",
      item.description || ""
    );
    if (newDescription === null) return;

    try {
      await apiRequest(`/categories/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription,
        }),
      });

      fetchCategories();
      setMessage("Category updated successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // DELETE CATEGORY
  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await apiRequest(`/categories/${id}`, {
        method: "DELETE",
      });

      fetchCategories();
      setMessage("Category deleted successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // UPDATE REVIEW STATUS
  const handleReviewStatus = async (id: number, status: string) => {
    try {
      await apiRequest(`/reviews/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      fetchReviews();
      setMessage(`Review ${status.toLowerCase()} successfully!`);
    } catch (error) {
      showError(error);
    }
  };

  // DELETE REVIEW
  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await apiRequest(`/reviews/${id}`, {
        method: "DELETE",
      });

      fetchReviews();
      setMessage("Review deleted successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // ADD COUPON
  const handleAddCoupon = async () => {
    if (!couponCode.trim() || !discountValue) {
      alert("Enter coupon code and discount value");
      return;
    }

    if (
      !Number.isFinite(Number(discountValue)) ||
      Number(discountValue) <= 0
    ) {
      alert("Enter a valid discount");
      return;
    }

    try {
      await apiRequest("/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          expiry_date: expiryDate
            ? new Date(expiryDate).toISOString()
            : null,
          usage_limit: usageLimit ? Number(usageLimit) : null,
        }),
      });

      setCouponCode("");
      setDiscountValue("");
      setExpiryDate("");
      setUsageLimit("");

      fetchCoupons();
      setMessage("Coupon created successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // TOGGLE COUPON
  const handleCouponToggle = async (coupon: any) => {
    try {
      await apiRequest(`/coupons/${coupon.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          active: !coupon.active,
        }),
      });

      fetchCoupons();
    } catch (error) {
      showError(error);
    }
  };

  // DELETE COUPON
  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm("Delete this coupon?")) return;

    try {
      await apiRequest(`/coupons/${id}`, {
        method: "DELETE",
      });

      fetchCoupons();
      setMessage("Coupon deleted successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // SAVE SETTINGS
  const handleSaveSettings = async () => {
    try {
      await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      setMessage("Store settings saved successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // UPDATE ORDER STATUS
  const handleOrderStatus = async (id: number, status: string) => {
    try {
      await apiRequest(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      fetchOrders();
      setMessage("Order status updated!");
    } catch (error) {
      showError(error);
    }
  };

  // DASHBOARD
  const renderDashboard = () => {
    const revenue = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const customers = new Set(orders.map((order) => order.email)).size;

    return (
      <section className="admin-panel">
        <div className="admin-content">
          <h2>👑 Admin Dashboard</h2>

          <section className="dashboard-cards">
            <div className="dashboard-card revenue">
              <h3>💰 Revenue</h3>
              <h2>PKR {revenue.toLocaleString()}</h2>
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
              <h2>{customers}</h2>
              <p>Total Customers</p>
            </div>
          </section>

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
                    <td colSpan={4}>No Orders Found</td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>PKR {order.total}</td>
                      <td>{order.status || "Pending"}</td>
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

  // PRODUCTS
  const renderProducts = () => (
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

          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Toys">Toys</option>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <button onClick={handleAddProduct} disabled={loading}>
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </div>

        <h2>📋 Products List</h2>

        <div className="products-list">
          {products.length === 0 ? (
            <p>No Products Found</p>
          ) : (
            products.map((product: any) => (
              <div key={product.id} className="admin-product">
                <img src={product.image} alt={product.name} width="80" />
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.currency || "PKR"} {product.price}</p>
                  <p>Category: {product.category}</p>
                  <p>Stock: {product.stock ?? 0}</p>
                </div>
                <button onClick={() => handleDeleteProduct(product.id)}>
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );

  // ORDERS
  const renderOrders = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>🛒 Orders</h2>
        <button onClick={fetchOrders}>🔄 Refresh Orders</button>

        <div className="dashboard-box">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
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
              {orders.length === 0 ? (
                <tr><td colSpan={8}>No Orders Found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.phone}</td>
                    <td>{order.email}</td>
                    <td>{order.address}</td>
                    <td>{order.payment_method}</td>
                    <td>{order.currency || "PKR"} {order.total}</td>
                    <td>
                      <select
                        value={order.status || "Pending"}
                        onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  // CUSTOMERS
  const renderCustomers = () => {
    const customers = orders.reduce((unique: any[], order: any) => {
      if (!unique.some((customer) => customer.email === order.email)) {
        unique.push(order);
      }
      return unique;
    }, []);

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
                  <tr><td colSpan={4}>No Customers Found</td></tr>
                ) : (
                  customers.map((customer) => (
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

  // CATEGORIES
  const renderCategories = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>🏷️ Categories Management</h2>

        {message && <p>{message}</p>}

        <div className="add-product">
          <h3>➕ Add New Category</h3>

          <input
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />

          <input
            placeholder="Category Description"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
          />

          <input
            placeholder="Category Image URL (optional)"
            value={categoryImage}
            onChange={(e) => setCategoryImage(e.target.value)}
          />

          <button onClick={handleAddCategory}>Add Category</button>
        </div>

        <div className="dashboard-box">
          <h3>All Categories ({categories.length})</h3>

          {categories.length === 0 ? (
            <p>No categories found. Add your first category above.</p>
          ) : (
            categories.map((item) => (
              <div className="admin-product" key={item.id}>
                {item.image && (
                  <img src={item.image} alt={item.name} width="70" />
                )}

                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>

                <button onClick={() => handleEditCategory(item)}>✏️ Edit</button>
                <button onClick={() => handleDeleteCategory(item.id)}>🗑 Delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );

  // REVIEWS
  const renderReviews = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>⭐ Customer Reviews</h2>

        {message && <p>{message}</p>}

        <button onClick={fetchReviews}>🔄 Refresh Reviews</button>

        {reviews.length === 0 ? (
          <div className="dashboard-box">
            <h3>No Reviews Found</h3>
            <p>Customer reviews will appear here when submitted.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div className="dashboard-box" key={review.id}>
              <h3>{review.customer_name}</h3>
              <p>Product: {review.product_name || "Product unavailable"}</p>
              <p>Rating: {"⭐".repeat(Number(review.rating) || 0)}</p>
              <p>{review.comment}</p>
              <p>Status: <strong>{review.status}</strong></p>

              <button onClick={() => handleReviewStatus(review.id, "Approved")}>
                ✅ Approve
              </button>

              <button onClick={() => handleReviewStatus(review.id, "Rejected")}>
                ❌ Reject
              </button>

              <button onClick={() => handleReviewStatus(review.id, "Pending")}>
                ↩ Pending
              </button>

              <button onClick={() => handleDeleteReview(review.id)}>
                🗑 Delete
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );

  // COUPONS
  const renderCoupons = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>🎟️ Coupons Management</h2>

        {message && <p>{message}</p>}

        <div className="add-product">
          <h3>➕ Create Coupon</h3>

          <input
            placeholder="Coupon Code (e.g. SAVE10)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />

          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="Discount Value"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />

          <label>Expiry Date (optional)</label>
          <input
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <input
            type="number"
            min="1"
            placeholder="Usage Limit (optional)"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
          />

          <button onClick={handleAddCoupon}>Create Coupon</button>
        </div>

        <div className="dashboard-box">
          <h3>All Coupons ({coupons.length})</h3>

          {coupons.length === 0 ? (
            <p>No coupons created yet.</p>
          ) : (
            coupons.map((coupon) => (
              <div className="admin-product" key={coupon.id}>
                <div>
                  <h3>{coupon.code}</h3>
                  <p>
                    Discount: {coupon.discount_value}
                    {coupon.discount_type === "percentage" ? "%" : " fixed"}
                  </p>
                  <p>Used: {coupon.used_count || 0}</p>
                  <p>
                    Status: {coupon.active ? "Active" : "Inactive"}
                  </p>
                  <p>
                    Expiry: {coupon.expiry_date
                      ? new Date(coupon.expiry_date).toLocaleString()
                      : "No expiry"}
                  </p>
                </div>

                <button onClick={() => handleCouponToggle(coupon)}>
                  {coupon.active ? "Deactivate" : "Activate"}
                </button>

                <button onClick={() => handleDeleteCoupon(coupon.id)}>
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );

  // ANALYTICS
  const renderAnalytics = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>📊 Store Analytics</h2>

        <button onClick={fetchAnalytics}>🔄 Refresh Analytics</button>

        {!analytics ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <section className="dashboard-cards">
              <div className="dashboard-card revenue">
                <h3>💰 Total Revenue</h3>
                <h2>
                  {Number(analytics.summary?.total_revenue || 0).toLocaleString()}
                </h2>
              </div>

              <div className="dashboard-card orders">
                <h3>🛒 Total Orders</h3>
                <h2>{analytics.summary?.total_orders || 0}</h2>
              </div>

              <div className="dashboard-card products">
                <h3>📦 Products</h3>
                <h2>{products.length}</h2>
              </div>

              <div className="dashboard-card customers">
                <h3>👥 Customers</h3>
                <h2>{new Set(orders.map((order) => order.email)).size}</h2>
              </div>
            </section>

            <div className="dashboard-box">
              <h3>🔥 Top Selling Products</h3>

              {(analytics.topProducts || []).length === 0 ? (
                <p>No product sales data available yet.</p>
              ) : (
                analytics.topProducts.map((item: any) => (
                  <div key={item.id} className="admin-product">
                    <div>
                      <strong>{item.name}</strong>
                      <p>Sales: {item.sales_count}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="dashboard-box">
              <h3>⚠️ Low Stock Products</h3>

              {(analytics.lowStock || []).length === 0 ? (
                <p>No low-stock products.</p>
              ) : (
                analytics.lowStock.map((item: any) => (
                  <div key={item.id} className="admin-product">
                    <strong>{item.name}</strong>
                    <p>Stock remaining: {item.stock}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );

  // SETTINGS
  const renderSettings = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>⚙️ Store Settings</h2>

        {message && <p>{message}</p>}

        <div className="add-product">
          <h3>Store Information</h3>

          <label>Store Name</label>
          <input
            value={settings.store_name || ""}
            onChange={(e) =>
              setSettings({ ...settings, store_name: e.target.value })
            }
            placeholder="Store Name"
          />

          <label>Store Email</label>
          <input
            type="email"
            value={settings.store_email || ""}
            onChange={(e) =>
              setSettings({ ...settings, store_email: e.target.value })
            }
            placeholder="Store Email"
          />

          <label>Store Phone</label>
          <input
            value={settings.store_phone || ""}
            onChange={(e) =>
              setSettings({ ...settings, store_phone: e.target.value })
            }
            placeholder="Store Phone"
          />

          <label>Store Address</label>
          <textarea
            value={settings.store_address || ""}
            onChange={(e) =>
              setSettings({ ...settings, store_address: e.target.value })
            }
            placeholder="Store Address"
          />

          <label>Default Currency</label>
          <select
            value={settings.currency || "PKR"}
            onChange={(e) =>
              setSettings({ ...settings, currency: e.target.value })
            }
          >
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          <button onClick={handleSaveSettings}>
            💾 Save Settings
          </button>
        </div>
      </div>
    </section>
  );

  if (activePage === "dashboard") return renderDashboard();
  if (activePage === "products") return renderProducts();
  if (activePage === "orders") return renderOrders();
  if (activePage === "customers") return renderCustomers();
  if (activePage === "categories") return renderCategories();
  if (activePage === "reviews") return renderReviews();
  if (activePage === "coupons") return renderCoupons();
  if (activePage === "analytics") return renderAnalytics();
  if (activePage === "settings") return renderSettings();

  return <section className="admin-panel"><h2>Page not found</h2></section>;
}

export default AdminPanel;
