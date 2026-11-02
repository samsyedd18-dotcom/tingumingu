
import { useState, useEffect, useRef } from "react";
import { useProducts } from "../context/productcontext";

interface AdminPanelProps {
  activePage: string;
}

const API = "https://tingumingu-tau.vercel.app/api";

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  let data: any = null;

  if (contentType.includes("application/json") && responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("Backend returned invalid JSON.");
    }
  }

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("adminToken");
    throw new Error(
      data?.error ||
      `Admin authentication failed (${response.status}). Please login again.`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      responseText ||
      `Request failed (${response.status})`
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error("Backend did not return JSON.");
  }

  return data;
}

function AdminPanel({ activePage }: AdminPanelProps) {
  const { products, refreshProducts } = useProducts();

  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const knownOrderIds = useRef<Set<string> | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<any>(null);

  const [settings, setSettings] = useState<any>({
    store_name: "Tingu Mingu Toys",
    store_email: "",
    store_phone: "",
    currency: "PKR",
    store_address: "",
    delivery_fee: "0",
  });

  // PRODUCT STATES
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("0");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [currency, setCurrency] = useState("PKR");
  const [loading, setLoading] = useState(false);

  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [editingStock, setEditingStock] = useState("");

  // CATEGORY STATES
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");

  // COUPON STATES
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  // NOTIFICATIONS
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setNotification({ message, type });
  };

  const askConfirmation = (message: string): Promise<boolean> =>
    new Promise((resolve) => {
      setConfirmDialog({ message, resolve });
    });

  const closeConfirmation = (answer: boolean) => {
    confirmDialog?.resolve(answer);
    setConfirmDialog(null);
  };

  const showError = (error: unknown) => {
    console.error(error);
    showNotification(
      error instanceof Error ? error.message : "Something went wrong",
      "error"
    );
  };

  useEffect(() => {
    if (!notification) return;

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [notification]);

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);

      const data = await apiRequest("/orders");
      const latestOrders = Array.isArray(data) ? data : [];

      if (knownOrderIds.current === null) {
        knownOrderIds.current = new Set(
          latestOrders.map((order: any) => String(order.id))
        );
      } else {
        const newOrders = latestOrders.filter(
          (order: any) =>
            !knownOrderIds.current!.has(String(order.id))
        );

        if (newOrders.length > 0) {
          setNewOrderAlert(newOrders[0]);
        }

        latestOrders.forEach((order: any) => {
          knownOrderIds.current!.add(String(order.id));
        });
      }

      setOrders(latestOrders);
    } catch (error) {
      showError(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const data = await apiRequest("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error);
    }
  };

  // FETCH REVIEWS
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);

      const data = await apiRequest("/admin/reviews");
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // FETCH COUPONS
  const fetchCoupons = async () => {
    try {
      const data = await apiRequest("/admin/coupons");
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error);
    }
  };

  // FETCH ANALYTICS
  const fetchAnalytics = async () => {
    try {
      setAnalytics(await apiRequest("/analytics"));
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
        ...(data || {}),
      }));
    } catch (error) {
      showError(error);
    }
  };

  // PAGE DATA
  useEffect(() => {
    if (
      ["dashboard", "orders", "customers", "analytics"].includes(activePage)
    ) {
      fetchOrders();
    }

    if (["categories", "products"].includes(activePage)) {
      fetchCategories();
    }

    if (activePage === "reviews") fetchReviews();
    if (activePage === "coupons") fetchCoupons();

    if (activePage === "analytics") {
      fetchAnalytics();
    }

    if (activePage === "settings") {
      fetchSettings();
    }
  }, [activePage]);

  // ORDER POLLING
  useEffect(() => {
    fetchOrders();

    const interval = window.setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    fetch(`${API}/admin/logout`, {
      method: "POST",
      credentials: "include",
    })
      .catch((error) => console.error("Logout error:", error))
      .finally(() => {
        window.location.replace("/");
      });
  };

  // CLOUDINARY UPLOAD
  const uploadToCloudinary = async (
    file: File,
    resourceType: "image" | "video"
  ): Promise<string> => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "tingu-mingu");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/zp3cvkzu/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(
        data.error?.message || `${resourceType} upload failed`
      );
    }

    return data.secure_url;
  };

  // ADD PRODUCT
  const handleAddProduct = async () => {
    if (
      !productName.trim() ||
      !price ||
      !category ||
      images.length === 0
    ) {
      showNotification(
        "Enter product name, price, category and at least one image",
        "warning"
      );
      return;
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      showNotification("Enter a valid price", "warning");
      return;
    }

    if (
      !Number.isFinite(Number(deliveryCharge)) ||
      Number(deliveryCharge) < 0
    ) {
      showNotification("Enter valid delivery charges", "warning");
      return;
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      showNotification("Enter valid stock quantity", "warning");
      return;
    }

    if (images.length > 3) {
      showNotification("Maximum 3 images allowed", "warning");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      showNotification("Uploading product images...");

      const uploadedImages = await Promise.all(
        images.map((file) => uploadToCloudinary(file, "image"))
      );

      let videoUrl = "";

      if (video) {
        showNotification("Uploading product video...");
        videoUrl = await uploadToCloudinary(video, "video");
      }

      showNotification("Saving product...");

      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          name: productName.trim(),
          price: Number(price),
          delivery_charge: Number(deliveryCharge),
          image: uploadedImages[0],
          images: uploadedImages.slice(1),
          video: videoUrl,
          category,
          description: description.trim(),
          currency,
          stock: Number(stock),
        }),
      });

      await refreshProducts();

      setProductName("");
      setPrice("");
      setDeliveryCharge("0");
      setCategory("");
      setImages([]);
      setVideo(null);
      setDescription("");
      setStock("0");
      setCurrency("PKR");

      const imageInput = document.getElementById(
        "product-images"
      ) as HTMLInputElement | null;

      const videoInput = document.getElementById(
        "product-video"
      ) as HTMLInputElement | null;

      if (imageInput) imageInput.value = "";
      if (videoInput) videoInput.value = "";

      showNotification("Product added successfully!");
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE STOCK
  const handleUpdateStock = async (id: number) => {
    const quantity = Number(editingStock);

    if (!Number.isInteger(quantity) || quantity < 0) {
      showNotification("Enter a valid stock quantity", "warning");
      return;
    }

    try {
      await apiRequest(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ stock: quantity }),
      });

      await refreshProducts();

      setEditingStockId(null);
      showNotification("Stock updated successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id: number) => {
    if (
      !(await askConfirmation(
        "Are you sure you want to delete this product?"
      ))
    ) return;

    try {
      await apiRequest(`/products/${id}`, {
        method: "DELETE",
      });

      await refreshProducts();
      showNotification("Product deleted successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // ADD CATEGORY
  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      showNotification("Enter category name", "warning");
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

      await fetchCategories();
      showNotification("Category added successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // EDIT CATEGORY
  const handleEditCategory = (item: any) => {
    setEditingCategory(item);
    setEditCategoryName(item.name || "");
    setEditCategoryDescription(item.description || "");
  };

  const saveEditedCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) {
      showNotification("Enter category name", "warning");
      return;
    }

    try {
      await apiRequest(`/categories/${editingCategory.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editCategoryName.trim(),
          description: editCategoryDescription,
        }),
      });

      setEditingCategory(null);
      await fetchCategories();

      showNotification("Category updated successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // DELETE CATEGORY
  const handleDeleteCategory = async (id: number) => {
    if (
      !(await askConfirmation(
        "Are you sure you want to delete this category?"
      ))
    ) return;

    try {
      await apiRequest(`/categories/${id}`, {
        method: "DELETE",
      });

      await fetchCategories();
      showNotification("Category deleted successfully!");
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

      await fetchReviews();

      if (selectedReview?.id === id) {
        setSelectedReview((previous: any) => ({
          ...previous,
          status,
        }));
      }

      showNotification(`Review ${status.toLowerCase()} successfully!`);
    } catch (error) {
      showError(error);
    }
  };

  // DELETE REVIEW
  const handleDeleteReview = async (id: number) => {
    if (
      !(await askConfirmation(
        "Are you sure you want to permanently delete this review?"
      ))
    ) return;

    try {
      await apiRequest(`/reviews/${id}`, {
        method: "DELETE",
      });

      setReviews((previous) =>
        previous.filter((review) => review.id !== id)
      );

      if (selectedReview?.id === id) {
        setSelectedReview(null);
      }

      showNotification("Review deleted successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // ADD COUPON
  const handleAddCoupon = async () => {
    if (!couponCode.trim() || !discountValue) {
      showNotification("Enter coupon code and discount value", "warning");
      return;
    }

    const discount = Number(discountValue);

    if (!Number.isFinite(discount) || discount <= 0) {
      showNotification("Enter a valid discount", "warning");
      return;
    }

    if (discountType === "percentage" && discount > 100) {
      showNotification("Percentage cannot exceed 100", "warning");
      return;
    }

    if (
      usageLimit &&
      (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) <= 0)
    ) {
      showNotification("Enter a valid usage limit", "warning");
      return;
    }

    try {
      await apiRequest("/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: discount,
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

      await fetchCoupons();
      showNotification("Coupon created successfully!");
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

      await fetchCoupons();
      showNotification("Coupon status updated!");
    } catch (error) {
      showError(error);
    }
  };

  // DELETE COUPON
  const handleDeleteCoupon = async (id: number) => {
    if (
      !(await askConfirmation(
        "Are you sure you want to delete this coupon?"
      ))
    ) return;

    try {
      await apiRequest(`/coupons/${id}`, {
        method: "DELETE",
      });

      await fetchCoupons();
      showNotification("Coupon deleted successfully!");
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

      showNotification("Store settings saved successfully!");
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

      await fetchOrders();
      showNotification("Order status updated!");
    } catch (error) {
      showError(error);
    }
  };

  // DELETE ORDER
  const handleDeleteOrder = async (id: number) => {
    if (
      !(await askConfirmation(
        "Are you sure you want to delete this order?"
      ))
    ) return;

    try {
      await apiRequest(`/orders/${id}`, {
        method: "DELETE",
      });

      await fetchOrders();
      showNotification("Order deleted successfully!");
    } catch (error) {
      showError(error);
    }
  };

  // CLEAR ALL ORDERS
  const handleClearRevenue = async () => {
    const confirmed = await askConfirmation(
      "WARNING! This will permanently delete ALL orders and revenue records. This action cannot be undone. Continue?"
    );

    if (!confirmed) return;

    try {
      await apiRequest("/orders/clear", {
        method: "DELETE",
      });

      setOrders([]);
      setAnalytics(null);
      setNewOrderAlert(null);
      knownOrderIds.current = new Set();

      await fetchAnalytics();

      showNotification(
        "All orders and revenue records cleared successfully!"
      );
    } catch (error) {
      showError(error);
    }
  };

  // DASHBOARD
  const renderDashboard = () => {
    const revenue = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      );

    const customers = new Set(
      orders.map((order) => order.email).filter(Boolean)
    ).size;

    return (
      <section className="admin-panel">
        <div className="admin-content">
          <h2>👑 Admin Dashboard</h2>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>

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
                      <td>
                        {order.currency || "PKR"} {order.total}
                      </td>
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

          <label>Product Delivery Charges</label>

          <input
            type="number"
            min="0"
            placeholder="Delivery Charges"
            value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(e.target.value)}
          />

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>

            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <label>Product Description</label>

          <textarea
            placeholder="Write product description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Product Stock</label>

          <input
            type="number"
            min="0"
            placeholder="Stock quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <label>Product Images (Maximum 3)</label>

          <input
            id="product-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);

              if (selected.length > 3) {
                showNotification("Maximum 3 images allowed", "warning");
                e.target.value = "";
                setImages([]);
                return;
              }

              setImages(selected);
            }}
          />

          <p>{images.length}/3 images selected</p>

          {images.map((file, index) => (
            <p key={`${file.name}-${index}`}>
              {index + 1}. {file.name}
            </p>
          ))}

          <label>Product Video (Optional)</label>

          <input
            id="product-video"
            type="file"
            accept="video/*"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;

              if (selected && selected.size > 100 * 1024 * 1024) {
                showNotification(
                  "Video must be 100 MB or smaller",
                  "warning"
                );
                e.target.value = "";
                setVideo(null);
                return;
              }

              setVideo(selected);
            }}
          />

          {video && <p>Selected video: {video.name}</p>}

          <button
            type="button"
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
            products.map((product) => (
              <div key={product.id} className="admin-product">
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

                  <p>
                    Delivery Charges: {product.currency || "PKR"}{" "}
                    {Number(
                      (product as any).delivery_charge ?? 0
                    ).toLocaleString()}
                  </p>

                  <p>Category: {product.category}</p>
                  <p>
                    Images: {(product.images?.length || 0) + 1}
                  </p>
                  <p>Video: {product.video ? "Available" : "None"}</p>
                  <p>Description: {product.description || "None"}</p>
                  <p>Stock: {product.stock ?? 0}</p>

                  {editingStockId === product.id ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        value={editingStock}
                        onChange={(e) =>
                          setEditingStock(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStock(product.id)
                        }
                      >
                        Save Stock
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingStockId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStockId(product.id);
                        setEditingStock(
                          String(product.stock ?? 0)
                        );
                      }}
                    >
                      ✏️ Edit Stock
                    </button>
                  )}
                </div>

                <button
                  type="button"
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

  // ORDERS
  const renderOrders = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>🛒 Orders</h2>

        <button type="button" onClick={fetchOrders}>
          🔄 Refresh Orders
        </button>

        {ordersLoading && <p>Loading orders...</p>}

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
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9}>No Orders Found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.phone}</td>
                    <td>{order.email}</td>
                    <td>{order.address}</td>
                    <td>{order.payment_method}</td>
                    <td>
                      {order.currency || "PKR"} {order.total}
                    </td>

                    <td>
                      <select
                        value={order.status || "Pending"}
                        onChange={(e) =>
                          handleOrderStatus(
                            order.id,
                            e.target.value
                          )
                        }
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteOrder(order.id)
                        }
                      >
                        🗑 Delete
                      </button>
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
    const customers = orders.reduce(
      (unique: any[], order: any) => {
        const email = order.email?.toLowerCase();

        if (
          !unique.some(
            (customer) =>
              customer.email?.toLowerCase() === email
          )
        ) {
          unique.push(order);
        }

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
                    <td colSpan={4}>No Customers Found</td>
                  </tr>
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

        <div className="add-product">
          <h3>➕ Add New Category</h3>

          <input
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) =>
              setCategoryName(e.target.value)
            }
          />

          <input
            placeholder="Category Description"
            value={categoryDescription}
            onChange={(e) =>
              setCategoryDescription(e.target.value)
            }
          />

          <input
            placeholder="Category Image URL (optional)"
            value={categoryImage}
            onChange={(e) =>
              setCategoryImage(e.target.value)
            }
          />

          <button
            type="button"
            onClick={handleAddCategory}
          >
            Add Category
          </button>
        </div>

        <div className="dashboard-box">
          <h3>All Categories ({categories.length})</h3>

          {categories.length === 0 ? (
            <p>No categories found. Add your first category above.</p>
          ) : (
            categories.map((item) => (
              <div className="admin-product" key={item.id}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    width="70"
                  />
                )}

                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleEditCategory(item)}
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCategory(item.id)
                  }
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

  // REVIEWS
  const renderReviews = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>⭐ Customer Reviews ({reviews.length})</h2>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={reviewsLoading}
        >
          {reviewsLoading ? "Loading..." : "🔄 Refresh Reviews"}
        </button>

        {reviewsLoading ? (
          <div className="dashboard-box">
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="dashboard-box">
            <h3>No Reviews Found</h3>
            <p>Customer reviews will appear here when submitted.</p>
          </div>
        ) : (
          reviews.map((review) => {
            const rating = Math.max(
              0,
              Math.min(5, Number(review.rating) || 0)
            );

            return (
              <div className="dashboard-box" key={review.id}>
                <h3>
                  {review.customer_name || "Anonymous"}
                </h3>

                <p>
                  <strong>Product:</strong>{" "}
                  {review.product_name || "Product unavailable"}
                </p>

                <p>
                  <strong>Rating:</strong>{" "}
                  {"⭐".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span>{review.status || "Pending"}</span>
                </p>

                <p style={{ overflowWrap: "anywhere" }}>
                  {review.comment
                    ? `${review.comment.slice(0, 120)}${review.comment.length > 120 ? "..." : ""
                    }`
                    : "No written comment"}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedReview(review)}
                >
                  👁 View Details
                </button>

                <button
                  type="button"
                  disabled={review.status === "Approved"}
                  onClick={() =>
                    handleReviewStatus(review.id, "Approved")
                  }
                >
                  ✅ Approve
                </button>

                <button
                  type="button"
                  disabled={review.status === "Rejected"}
                  onClick={() =>
                    handleReviewStatus(review.id, "Rejected")
                  }
                >
                  ❌ Reject
                </button>

                <button
                  type="button"
                  disabled={review.status === "Pending"}
                  onClick={() =>
                    handleReviewStatus(review.id, "Pending")
                  }
                >
                  ↩ Pending
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteReview(review.id)}
                >
                  🗑 Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );

  // COUPONS
  const renderCoupons = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>🎟️ Coupons Management</h2>

        <div className="add-product">
          <h3>➕ Create Coupon</h3>

          <input
            placeholder="Coupon Code (e.g. SAVE10)"
            value={couponCode}
            onChange={(e) =>
              setCouponCode(e.target.value.toUpperCase())
            }
          />

          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value)
            }
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="Discount Value"
            value={discountValue}
            onChange={(e) =>
              setDiscountValue(e.target.value)
            }
          />

          <label>Expiry Date (optional)</label>

          <input
            type="datetime-local"
            value={expiryDate}
            onChange={(e) =>
              setExpiryDate(e.target.value)
            }
          />

          <input
            type="number"
            min="1"
            placeholder="Usage Limit (optional)"
            value={usageLimit}
            onChange={(e) =>
              setUsageLimit(e.target.value)
            }
          />

          <button
            type="button"
            onClick={handleAddCoupon}
          >
            Create Coupon
          </button>
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
                    {coupon.discount_type === "percentage"
                      ? "%"
                      : " fixed"}
                  </p>

                  <p>Used: {coupon.used_count || 0}</p>
                  <p>
                    Status: {coupon.active ? "Active" : "Inactive"}
                  </p>

                  <p>
                    Expiry: {coupon.expiry_date
                      ? new Date(
                        coupon.expiry_date
                      ).toLocaleString()
                      : "No expiry"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCouponToggle(coupon)}
                >
                  {coupon.active ? "Deactivate" : "Activate"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCoupon(coupon.id)
                  }
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

  // ANALYTICS
  const renderAnalytics = () => (
    <section className="admin-panel">
      <div className="admin-content">
        <h2>📊 Store Analytics</h2>

        <button
          type="button"
          onClick={fetchAnalytics}
        >
          🔄 Refresh Analytics
        </button>

        <button
          type="button"
          onClick={handleClearRevenue}
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            margin: "15px 0",
          }}
        >
          🗑 Clear All Revenue & Orders
        </button>

        {!analytics ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <section className="dashboard-cards">
              <div className="dashboard-card revenue">
                <h3>💰 Total Revenue</h3>
                <h2>
                  {Number(
                    analytics.summary?.total_revenue || 0
                  ).toLocaleString()}
                </h2>
              </div>

              <div className="dashboard-card orders">
                <h3>🛒 Total Orders</h3>
                <h2>
                  {analytics.summary?.total_orders || 0}
                </h2>
              </div>

              <div className="dashboard-card products">
                <h3>📦 Products</h3>
                <h2>{products.length}</h2>
              </div>

              <div className="dashboard-card customers">
                <h3>👥 Customers</h3>
                <h2>
                  {new Set(
                    orders.map((order) => order.email).filter(Boolean)
                  ).size}
                </h2>
              </div>
            </section>

            <div className="dashboard-box">
              <h3>🔥 Top Selling Products</h3>

              {(analytics.topProducts || []).length === 0 ? (
                <p>No product sales data available yet.</p>
              ) : (
                analytics.topProducts.map((item: any) => (
                  <div
                    key={item.id}
                    className="admin-product"
                  >
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
                  <div
                    key={item.id}
                    className="admin-product"
                  >
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

        <div className="add-product">
          <h3>Store Information</h3>

          <label>Store Name</label>

          <input
            value={settings.store_name || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                store_name: e.target.value,
              })
            }
            placeholder="Store Name"
          />

          <label>Store Email</label>

          <input
            type="email"
            value={settings.store_email || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                store_email: e.target.value,
              })
            }
            placeholder="Store Email"
          />

          <label>Store Phone</label>

          <input
            value={settings.store_phone || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                store_phone: e.target.value,
              })
            }
            placeholder="Store Phone"
          />

          <label>Store Address</label>

          <textarea
            value={settings.store_address || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                store_address: e.target.value,
              })
            }
            placeholder="Store Address"
          />

          <label>Default Currency</label>

          <select
            value={settings.currency || "PKR"}
            onChange={(e) =>
              setSettings({
                ...settings,
                currency: e.target.value,
              })
            }
          >
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          <label>Delivery Fee</label>

          <input
            type="number"
            min="0"
            value={settings.delivery_fee ?? "0"}
            onChange={(e) =>
              setSettings({
                ...settings,
                delivery_fee: e.target.value,
              })
            }
            placeholder="Delivery Fee"
          />

          <button
            type="button"
            onClick={handleSaveSettings}
          >
            💾 Save Settings
          </button>
        </div>
      </div>
    </section>
  );

  // PAGE ROUTING
  const page =
    activePage === "dashboard" ? renderDashboard() :
      activePage === "products" ? renderProducts() :
        activePage === "orders" ? renderOrders() :
          activePage === "customers" ? renderCustomers() :
            activePage === "categories" ? renderCategories() :
              activePage === "reviews" ? renderReviews() :
                activePage === "coupons" ? renderCoupons() :
                  activePage === "analytics" ? renderAnalytics() :
                    activePage === "settings" ? renderSettings() :
                      (
                        <section className="admin-panel">
                          <h2>Page not found</h2>
                        </section>
                      );

  return (
    <>
      {newOrderAlert && (
        <div
          className="new-order-alert"
          style={{
            background: "#e8f7ed",
            border: "1px solid #28a745",
            color: "#155724",
            padding: "16px",
            margin: "15px",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>🔔 New Order Received!</h3>
            <p>Order ID: #{newOrderAlert.id}</p>
            <p>Customer: {newOrderAlert.customer_name}</p>
            <p>
              Total: {newOrderAlert.currency || "PKR"}{" "}
              {newOrderAlert.total}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNewOrderAlert(null)}
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {page}

      {/* NOTIFICATION */}
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          <span>{notification.message}</span>

          <button
            type="button"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="admin-modal-overlay">
          <div className="admin-confirm-modal">
            <h2>Confirm Action</h2>
            <p>{confirmDialog.message}</p>

            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={() => closeConfirmation(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-delete-confirm"
                onClick={() => closeConfirmation(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="admin-modal-overlay">
          <div className="admin-confirm-modal">
            <h2>Edit Category</h2>

            <input
              value={editCategoryName}
              onChange={(e) =>
                setEditCategoryName(e.target.value)
              }
              placeholder="Category name"
            />

            <textarea
              value={editCategoryDescription}
              onChange={(e) =>
                setEditCategoryDescription(e.target.value)
              }
              placeholder="Category description"
            />

            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEditedCategory}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW DETAILS MODAL */}
      {selectedReview && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="admin-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="review-details-title">
              ⭐ Review Details
            </h2>

            <p>
              <strong>Review ID:</strong> #{selectedReview.id}
            </p>

            <p>
              <strong>Customer:</strong>{" "}
              {selectedReview.customer_name || "Anonymous"}
            </p>

            <p>
              <strong>Product:</strong>{" "}
              {selectedReview.product_name || "Product unavailable"}
            </p>

            <p>
              <strong>Rating:</strong>{" "}
              {Number(selectedReview.rating) || 0}/5
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedReview.status || "Pending"}
            </p>

            <p>
              <strong>Comment:</strong>
            </p>

            <p
              style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {selectedReview.comment || "No written comment"}
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  handleReviewStatus(
                    selectedReview.id,
                    "Approved"
                  )
                }
              >
                ✅ Approve
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDeleteReview(selectedReview.id)
                }
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPanel;
