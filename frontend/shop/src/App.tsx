import { Routes, Route } from "react-router-dom";
import Login from "./login/login";
import PMDashboard from "./pm_admin/PMDashboard";
import SMDashboard from "./sm_admin/SMDashboard";
import AppContent from "./AppContent";
import ProductPage from "./product_page/product_page";
import ShoppingCart from "./shoppingcart/shoppingcart";
import "./App.css";
import CheckoutSuccess from "./checkoutpage/CheckoutSuccess";
import PaymentPage from "./payment_page/PaymentPage";
import WishlistPage from "./wishlist/WishlistPage";
import OrdersPage from "./orders/OrdersPage";
import ProfilePage from "./profile/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login initialType="signUp" />} />
      <Route path="/" element={<AppContent />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/cart" element={<ShoppingCart />} />
      <Route path="/pm-admin/*" element={<PMDashboard />} />
      <Route path="/sm-admin/*" element={<SMDashboard />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/payment" element={<PaymentPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
